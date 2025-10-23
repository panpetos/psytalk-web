// Lightweight .env loader to avoid external dependencies
// Reads the project root .env file once and populates process.env for missing keys
const fs = require('fs');
const path = require('path');

let loaded = false;

function loadEnv() {
  if (loaded) {
    return;
  }
  loaded = true;

  const envPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    return;
  }

  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split(/\r?\n/);

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) {
        continue;
      }

      const delimiterIndex = line.indexOf('=');
      if (delimiterIndex === -1) {
        continue;
      }

      const key = line.slice(0, delimiterIndex).trim();
      if (!key) {
        continue;
      }

      let value = line.slice(delimiterIndex + 1).trim();

      if (
        (value.startsWith("\"") && value.endsWith("\"")) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      value = value.replace(/\\n/g, '\n').replace(/\\r/g, '\r');

      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not load .env file:', error.message);
  }
}

module.exports = { loadEnv };
