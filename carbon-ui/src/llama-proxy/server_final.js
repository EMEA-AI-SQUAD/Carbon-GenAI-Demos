const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3001;
const LLAMA_URL = 'http://localhost:8080';
const VISION_URL = 'http://localhost:8082';

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
 * Vision endpoint - routes to Granite Vision on port 8082
 */
app.use(
  '/vision',
  createProxyMiddleware({
    target: VISION_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/vision': '', // Remove /vision prefix when forwarding
    },
    logLevel: 'debug',

    onProxyReq(proxyReq, req) {
      console.log(`→ Proxying VISION ${req.method} ${req.url} → ${VISION_URL}${req.url.replace('/vision', '')}`);
    },

    onProxyRes(proxyRes, req) {
      console.log(`← Vision Response ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    },

    onError(err, req, res) {
      console.error('✗ VISION PROXY ERROR ✗');
      console.error(err.message);
      res.status(502).json({
        error: 'Vision proxy error',
        message: err.message,
      });
    },
  })
);

/**
 * Default proxy to llama.cpp text model
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
  console.log(`→ Text model: ${LLAMA_URL}`);
  console.log(`→ Vision model: ${VISION_URL} (via /vision route)`);
  console.log(`→ Accepting requests from http://p1270-pvm1.p1270.cecc.ihost.com:3000`);
});

