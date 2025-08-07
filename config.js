require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;
const SECRET = process.env.SECRET;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

if (!CLIENT_ORIGIN) {
  throw new Error('CLIENT_ORIGIN environment variable is required');
}

if (!SECRET) {
  throw new Error('SECRET environment variable is required');
}

module.exports = {
  DATABASE_URL,
  CLIENT_ORIGIN,
  SECRET
};
