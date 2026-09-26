// cPanel / Phusion Passenger entry point
process.env.TOKIO_WORKER_THREADS = process.env.TOKIO_WORKER_THREADS || '1';
process.env.UV_THREADPOOL_SIZE = process.env.UV_THREADPOOL_SIZE || '2';

const path = require('path');
const fs = require('fs');

// 1. Ensure working directory is always the application root
try {
  process.chdir(__dirname);
} catch (e) {
  // fallback if chdir is restricted
}

// 2. Load environment file immediately before any application module is loaded
try {
  const envCandidates = [
    path.join(__dirname, '.env'),
    path.join(__dirname, 'env'),
    path.join(__dirname, '.env.txt'),
    path.join(__dirname, 'env.txt'),
    path.join(__dirname, 'production.env'),
    path.join(__dirname, '.env.production'),
  ];
  let loaded = false;
  for (const candidate of envCandidates) {
    if (fs.existsSync(candidate)) {
      require('dotenv').config({ path: candidate });
      loaded = true;
      break;
    }
  }
  if (!loaded) {
    require('dotenv').config();
  }
} catch (e) {
  // continue
}

try {
  const server = require('./dist/server.js');
  module.exports = server.default || server;
} catch (error) {
  const errorMsg = `[${new Date().toISOString()}] CRITICAL STARTUP ERROR:\n${error.stack || error}\n`;
  try {
    fs.appendFileSync(path.join(__dirname, 'startup_error.log'), errorMsg);
  } catch (e) {
    // fallback
  }
  console.error(errorMsg);
  throw error;
}

