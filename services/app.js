// cPanel / Phusion Passenger entry point
try {
  module.exports = require('./dist/server.js');
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
