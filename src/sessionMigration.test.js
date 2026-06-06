/**
 * @jest-environment node
 */

const sessionMigration = require('../data/migrations/20260603000000_create_session_table');

function createColumnBuilder() {
  return {
    notNullable: jest.fn(function() {
      return this;
    }),
    primary: jest.fn(function() {
      return this;
    })
  };
}

function createMockKnex() {
  const sidColumn = createColumnBuilder();
  const sessColumn = createColumnBuilder();
  const expireColumn = createColumnBuilder();
  const table = {
    specificType: jest.fn(function(columnName) {
      if (columnName === 'sid') {
        return sidColumn;
      }
      if (columnName === 'expire') {
        return expireColumn;
      }
      return createColumnBuilder();
    }),
    json: jest.fn(function() {
      return sessColumn;
    }),
    index: jest.fn()
  };
  const schema = {
    createTable: jest.fn(function(tableName, callback) {
      callback(table);
      return 'create-session-table';
    }),
    dropTable: jest.fn(function() {
      return 'drop-session-table';
    })
  };

  return {
    knex: { schema },
    schema,
    table,
    sidColumn,
    sessColumn,
    expireColumn
  };
}

describe('session table migration', () => {
  it('creates the connect-pg-simple session table shape', () => {
    const mockKnex = createMockKnex();

    const result = sessionMigration.up(mockKnex.knex);

    expect(result).toBe('create-session-table');
    expect(mockKnex.schema.createTable).toHaveBeenCalledWith('session', expect.any(Function));
    expect(mockKnex.table.specificType).toHaveBeenCalledWith('sid', 'varchar');
    expect(mockKnex.sidColumn.notNullable).toHaveBeenCalled();
    expect(mockKnex.sidColumn.primary).toHaveBeenCalled();
    expect(mockKnex.table.json).toHaveBeenCalledWith('sess');
    expect(mockKnex.sessColumn.notNullable).toHaveBeenCalled();
    expect(mockKnex.table.specificType).toHaveBeenCalledWith('expire', 'timestamp(6)');
    expect(mockKnex.expireColumn.notNullable).toHaveBeenCalled();
    expect(mockKnex.table.index).toHaveBeenCalledWith(['expire'], 'IDX_session_expire');
  });

  it('drops the session table on rollback', () => {
    const mockKnex = createMockKnex();

    const result = sessionMigration.down(mockKnex.knex);

    expect(result).toBe('drop-session-table');
    expect(mockKnex.schema.dropTable).toHaveBeenCalledWith('session');
  });
});
