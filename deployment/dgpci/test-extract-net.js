const http = require('http');
const body = JSON.stringify({ text: 'BYD Atto 3, VIN: LGWEF5HS4NA012345', schema_name: 'vehicle_import' });
const opts = {
  host: 'extract-service', port: 6000, path: '/v1/extract', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
};
const req = http.request(opts, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => { console.log('HTTP:', res.statusCode); console.log(d.slice(0, 400)); });
});
req.on('error', e => console.error('ERROR:', e.message));
req.write(body);
req.end();
