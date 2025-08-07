const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost/highlander-react-redux';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const SECRET = process.env.SECRET;

if (!SECRET) {
  throw new Error('SECRET environment variable is required');
}

module.exports = {
  DATABASE_URL,
  CLIENT_ORIGIN,
  SECRET
};
