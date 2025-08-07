module.exports = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost/highlander-react-redux',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  SECRET: process.env.SECRET || 'super-secret'
};
