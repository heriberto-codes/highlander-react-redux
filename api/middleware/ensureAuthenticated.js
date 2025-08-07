'use strict';

function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.coachId) {
    return next();
  }
  return res.status(403).send('No session available');
}

module.exports = ensureAuthenticated;
