'use strict';

const env = process.env.NODE_ENV || 'development';

const configs = {
  development: {
    CLIENT_ORIGIN: 'http://localhost:3000',
    SECRET: process.env.SECRET || 'default',
  },
  test: {
    CLIENT_ORIGIN: 'http://localhost:3000',
    SECRET: process.env.SECRET || 'default',
  },
  production: {
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
    SECRET: process.env.SECRET,
  },
};

module.exports = configs[env];

