// cPanel / Phusion Passenger entry point
process.env.UV_THREADPOOL_SIZE = '4';

try {
  const server = require('./dist/server.js');
  module.exports = server.default || server;
} catch (error) {
  const fs = require('fs');
  const errorMsg = `[${new Date().toISOString()}] CRITICAL STARTUP ERROR:\n${error.stack || error}\n`;
  try {
    fs.appendFileSync('./startup_error.log', errorMsg);
  } catch (e) {
    // fallback
  }
  console.error(errorMsg);
  throw error;
}
