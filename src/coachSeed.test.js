/**
 * @jest-environment node
 */

const bcrypt = require('bcrypt');
const coachSeed = require('../data/seeds/seed_coaches');

jest.mock('bcrypt', () => ({
  hash: jest.fn()
}));

function createMockKnex() {
  const del = jest.fn(function() {
    return Promise.resolve();
  });
  const insert = jest.fn(function(rows) {
    return Promise.resolve(rows);
  });
  const table = {
    del,
    insert
  };
  const knex = jest.fn(function() {
    return table;
  });

  return {
    knex,
    del,
    insert
  };
}

describe('coach seed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hashes the seed password before inserting preserved coach identities', async () => {
    const mockKnex = createMockKnex();
    bcrypt.hash.mockResolvedValue('hashed-highlander');

    await coachSeed.seed(mockKnex.knex);

    expect(mockKnex.knex).toHaveBeenCalledWith('coaches');
    expect(mockKnex.del).toHaveBeenCalled();
    expect(bcrypt.hash).toHaveBeenCalledWith('highlander', 10);
    expect(mockKnex.insert).toHaveBeenCalledWith([
      {email: 'romanh99@gmail.com', password: 'hashed-highlander', first_name: 'Isaac', last_name: 'Brewman'},
      {email: 'hroman@theknowledgehouse.org', password: 'hashed-highlander', first_name: 'Danny', last_name: 'Diaz'}
    ]);
    expect(mockKnex.del.mock.invocationCallOrder[0]).toBeLessThan(bcrypt.hash.mock.invocationCallOrder[0]);
    expect(bcrypt.hash.mock.invocationCallOrder[0]).toBeLessThan(mockKnex.insert.mock.invocationCallOrder[0]);
  });

  it('rejects before inserting coach rows when password hashing fails', async () => {
    const mockKnex = createMockKnex();
    bcrypt.hash.mockRejectedValue(new Error('hash failed'));

    await expect(coachSeed.seed(mockKnex.knex)).rejects.toThrow('hash failed');

    expect(mockKnex.del).toHaveBeenCalled();
    expect(bcrypt.hash).toHaveBeenCalledWith('highlander', 10);
    expect(mockKnex.insert).not.toHaveBeenCalled();
  });
});
