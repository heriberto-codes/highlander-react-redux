'use strict';

function buildErrorPayload(message, details) {
  const payload = {
    error: typeof message === 'string' && message.trim() !== ''
      ? message
      : 'Internal server error'
  };

  if (details !== undefined) {
    payload.details = details;
  }

  return payload;
}

class ApiError extends Error {
  constructor(status, message, details) {
    const errorMessage = typeof message === 'string' && message.trim() !== ''
      ? message
      : 'Internal server error';
    const errorStatus = Number.isInteger(status) ? status : 500;

    super(errorMessage);
    this.name = 'ApiError';
    this.status = errorStatus;
    this.payload = errorStatus === 500
      ? buildErrorPayload('Internal server error')
      : buildErrorPayload(errorMessage, details);
    this.isApiError = true;
  }
}

function createApiError(status, message, details) {
  return new ApiError(status, message, details);
}

function createValidationError(message, details) {
  return createApiError(400, message, details);
}

function createAuthenticationError(message, details) {
  return createApiError(401, message || 'Authentication required', details);
}

function createForbiddenError(message, details) {
  return createApiError(403, message || 'Unauthorized', details);
}

function createNotFoundError(message, details) {
  return createApiError(404, message || 'Not found', details);
}

function createInternalServerError(details) {
  return createApiError(500, 'Internal server error', details);
}

function getApiErrorResponse(error) {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      body: error.payload
    };
  }

  return {
    status: 500,
    body: buildErrorPayload('Internal server error')
  };
}

function sendApiError(res, error) {
  const response = getApiErrorResponse(error);
  return res.status(response.status).json(response.body);
}

function sendValidationError(res, message, details) {
  return sendApiError(res, createValidationError(message, details));
}

function sendAuthenticationError(res, message, details) {
  return sendApiError(res, createAuthenticationError(message, details));
}

function sendForbiddenError(res, message, details) {
  return sendApiError(res, createForbiddenError(message, details));
}

function sendNotFoundError(res, message, details) {
  return sendApiError(res, createNotFoundError(message, details));
}

module.exports = {
  ApiError,
  createApiError,
  createValidationError,
  createAuthenticationError,
  createForbiddenError,
  createNotFoundError,
  createInternalServerError,
  getApiErrorResponse,
  sendApiError,
  sendValidationError,
  sendAuthenticationError,
  sendForbiddenError,
  sendNotFoundError
};
