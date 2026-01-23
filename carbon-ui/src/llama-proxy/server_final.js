const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3001;
const LLAMA_URL = 'http://localhost:8080';

/**
 * CORS must be first
 */
app.use(cors({
  origin: 'http://p1270-pvm1.p1270.cecc.ihost.com:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

/**
 * Log incoming requests (DO NOT parse body)
 */
app.use((req, res, next) => {
  console.log('\n=== INCOMING REQUEST ===');
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('========================\n');
  next();
});

/**
 * Transparent proxy to llama.cpp
 */
app.use(
  '/',
  createProxyMiddleware({
    target: LLAMA_URL,
    changeOrigin: true,
    logLevel: 'debug',

    onProxyReq(proxyReq, req) {
      console.log(`→ Proxying ${req.method} ${req.url} → ${LLAMA_URL}${req.url}`);
    },

    onProxyRes(proxyRes, req) {
      console.log(`← Response ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    },

    onError(err, req, res) {
      console.error('✗ PROXY ERROR ✗');
      console.error(err.message);
      res.status(502).json({
        error: 'Proxy error',
        message: err.message,
      });
    },
  })
);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ CORS Proxy running on http://localhost:${PORT}`);
  console.log(`→ Forwarding to llama.cpp at ${LLAMA_URL}`);
  console.log(`→ Accepting requests from http://p1270-pvm1.p1270.cecc.ihost.com:3000`);
});

