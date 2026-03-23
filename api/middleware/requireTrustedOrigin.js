'use strict';

const { CLIENT_ORIGIN } = require('../../config');

function getOriginFromHeaders(req) {
  const originHeader = req.get('origin');
  if (originHeader) {
    return originHeader;
  }

  const refererHeader = req.get('referer');
  if (!refererHeader) {
    return null;
  }

  try {
    return new URL(refererHeader).origin;
  } catch (error) {
    return null;
  }
}

function requireTrustedOrigin(req, res, next) {
  const requestOrigin = getOriginFromHeaders(req);

  if (!requestOrigin || requestOrigin !== CLIENT_ORIGIN) {
    return res.status(403).send('Invalid request origin');
  }

  return next();
}

module.exports = requireTrustedOrigin;
