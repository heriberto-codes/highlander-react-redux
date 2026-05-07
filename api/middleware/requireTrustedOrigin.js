'use strict';

const { CLIENT_ORIGIN } = require('../../config');
const { sendForbiddenError } = require('../utils/apiErrors');

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
    return sendForbiddenError(res, 'Invalid request origin');
  }

  return next();
}

module.exports = requireTrustedOrigin;
