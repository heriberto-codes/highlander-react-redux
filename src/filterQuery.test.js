const {
  parsePaginationQuery,
  paginateItems
} = require('../api/utils/filterQuery');

describe('filterQuery pagination helpers', () => {
  describe('parsePaginationQuery', () => {
    it('defaults missing page and limit values', () => {
      expect(parsePaginationQuery({})).toEqual({
        value: {
          page: 1,
          limit: 10
        }
      });
    });

    it('uses blank page and limit values as defaults', () => {
      expect(parsePaginationQuery({ page: '   ', limit: '' })).toEqual({
        value: {
          page: 1,
          limit: 10
        }
      });
    });

    it('parses positive integer page and limit values', () => {
      expect(parsePaginationQuery({ page: '2', limit: '25' })).toEqual({
        value: {
          page: 2,
          limit: 25
        }
      });
    });

    it('supports custom query keys and limit caps', () => {
      expect(parsePaginationQuery(
        { playerPage: '3', playerLimit: '150' },
        {
          pageKey: 'playerPage',
          limitKey: 'playerLimit',
          maxLimit: 50
        }
      )).toEqual({
        value: {
          page: 3,
          limit: 50
        }
      });
    });

    it('returns validation errors for invalid page values', () => {
      expect(parsePaginationQuery({ page: '0', limit: '10' })).toEqual({
        error: 'Sorry your page is invalid please try again'
      });
      expect(parsePaginationQuery({ page: '-1', limit: '10' })).toEqual({
        error: 'Sorry your page is invalid please try again'
      });
      expect(parsePaginationQuery({ page: '1.5', limit: '10' })).toEqual({
        error: 'Sorry your page is invalid please try again'
      });
      expect(parsePaginationQuery({ page: ['1'], limit: '10' })).toEqual({
        error: 'Sorry your page is invalid please try again'
      });
    });

    it('returns validation errors for invalid limit values', () => {
      expect(parsePaginationQuery({ page: '1', limit: '0' })).toEqual({
        error: 'Sorry your limit is invalid please try again'
      });
      expect(parsePaginationQuery({ page: '1', limit: '-1' })).toEqual({
        error: 'Sorry your limit is invalid please try again'
      });
      expect(parsePaginationQuery({ page: '1', limit: '2.5' })).toEqual({
        error: 'Sorry your limit is invalid please try again'
      });
      expect(parsePaginationQuery({ page: '1', limit: ['10'] })).toEqual({
        error: 'Sorry your limit is invalid please try again'
      });
    });
  });

  describe('paginateItems', () => {
    it('returns the requested page of items and pagination metadata', () => {
      const result = paginateItems(['a', 'b', 'c', 'd', 'e'], {
        page: 2,
        limit: 2
      });

      expect(result).toEqual({
        items: ['c', 'd'],
        pagination: {
          page: 2,
          limit: 2,
          totalItems: 5,
          totalPages: 3,
          hasPreviousPage: true,
          hasNextPage: true
        }
      });
    });

    it('caps the limit when paginating items', () => {
      const result = paginateItems(['a', 'b'], {
        page: 1,
        limit: 150
      });

      expect(result.pagination.limit).toBe(100);
      expect(result.items).toEqual(['a', 'b']);
    });

    it('handles empty and non-array item lists safely', () => {
      expect(paginateItems([], { page: 1, limit: 10 })).toEqual({
        items: [],
        pagination: {
          page: 1,
          limit: 10,
          totalItems: 0,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false
        }
      });

      expect(paginateItems(null, { page: 1, limit: 10 })).toEqual({
        items: [],
        pagination: {
          page: 1,
          limit: 10,
          totalItems: 0,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false
        }
      });
    });

    it('returns empty items with consistent metadata for out-of-range pages', () => {
      expect(paginateItems(['a', 'b'], { page: 3, limit: 2 })).toEqual({
        items: [],
        pagination: {
          page: 3,
          limit: 2,
          totalItems: 2,
          totalPages: 1,
          hasPreviousPage: true,
          hasNextPage: false
        }
      });
    });
  });
});
