const {
  createValidationError,
  createInternalServerError,
  getApiErrorResponse
} = require('../api/utils/apiErrors');

describe('apiErrors', () => {
  it('keeps details on non-500 api errors', () => {
    const response = getApiErrorResponse(
      createValidationError('Invalid input', { field: 'email' })
    );

    expect(response).toEqual({
      status: 400,
      body: {
        error: 'Invalid input',
        details: { field: 'email' }
      }
    });
  });

  it('strips details from 500 api errors', () => {
    const response = getApiErrorResponse(
      createInternalServerError({ internal: 'secret' })
    );

    expect(response).toEqual({
      status: 500,
      body: {
        error: 'Internal server error'
      }
    });
  });

  it('returns the generic 500 payload for unknown errors', () => {
    const response = getApiErrorResponse(new Error('boom'));

    expect(response).toEqual({
      status: 500,
      body: {
        error: 'Internal server error'
      }
    });
  });

  it('does not trust plain objects that claim to be api errors', () => {
    const response = getApiErrorResponse({
      isApiError: true,
      status: 418,
      payload: {
        error: 'exposed spoofed error'
      }
    });

    expect(response).toEqual({
      status: 500,
      body: {
        error: 'Internal server error'
      }
    });
  });
});
