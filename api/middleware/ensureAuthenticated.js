'use strict';

const { sendForbiddenError } = require('../utils/apiErrors');

function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.coachId) {
    req.authenticatedCoachId = Number(req.session.coachId);
    return next();
  }
  return sendForbiddenError(res, 'No session available');
}

module.exports = ensureAuthenticated;
