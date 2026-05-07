/**
 * @jest-environment node
 */

process.env.DATABASE_URL = 'postgresql://localhost/highlander-react-redux-test';
process.env.CLIENT_ORIGIN = 'http://localhost:3000';
process.env.SECRET = 'test-secret';

const ensureAuthenticated = require('../api/middleware/ensureAuthenticated');
const requireTrustedOrigin = require('../api/middleware/requireTrustedOrigin');

function createResponse() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

function createRequest(headers = {}) {
  const normalizedHeaders = Object.keys(headers).reduce((result, key) => {
    result[key.toLowerCase()] = headers[key];
    return result;
  }, {});

  return {
    get: jest.fn(name => normalizedHeaders[name.toLowerCase()]),
    session: {}
  };
}

describe('ensureAuthenticated', () => {
  it('returns a standardized 403 JSON error when no session is available', () => {
    const req = createRequest();
    const res = createResponse();
    const next = jest.fn();

    ensureAuthenticated(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'No session available'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('sets authenticatedCoachId and continues when a session coach id exists', () => {
    const req = createRequest();
    req.session.coachId = '42';
    const res = createResponse();
    const next = jest.fn();

    ensureAuthenticated(req, res, next);

    expect(req.authenticatedCoachId).toBe(42);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe('requireTrustedOrigin', () => {
  it('returns a standardized 403 JSON error when no origin or referer is present', () => {
    const req = createRequest();
    const res = createResponse();
    const next = jest.fn();

    requireTrustedOrigin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid request origin'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns a standardized 403 JSON error for an untrusted origin', () => {
    const req = createRequest({
      Origin: 'http://malicious.example'
    });
    const res = createResponse();
    const next = jest.fn();

    requireTrustedOrigin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid request origin'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('continues when the origin matches CLIENT_ORIGIN', () => {
    const req = createRequest({
      Origin: process.env.CLIENT_ORIGIN
    });
    const res = createResponse();
    const next = jest.fn();

    requireTrustedOrigin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('continues when the referer origin matches CLIENT_ORIGIN', () => {
    const req = createRequest({
      Referer: `${process.env.CLIENT_ORIGIN}/dashboard`
    });
    const res = createResponse();
    const next = jest.fn();

    requireTrustedOrigin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('returns a standardized 403 JSON error for a malformed referer', () => {
    const req = createRequest({
      Referer: 'not a valid url'
    });
    const res = createResponse();
    const next = jest.fn();

    requireTrustedOrigin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid request origin'
    });
    expect(next).not.toHaveBeenCalled();
  });
});
