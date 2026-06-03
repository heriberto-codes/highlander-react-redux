import React from 'react';
import ReactDOM from 'react-dom';

import PaginationControls from './PaginationControls';

describe('PaginationControls', () => {
  let div;

  function renderPaginationControls(element) {
    ReactDOM.render(element, div);
  }

  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
    div.remove();
    div = null;
  });

  it('renders nothing when pagination is missing or only has one page', () => {
    renderPaginationControls(<PaginationControls />);

    expect(div.firstChild).toBeNull();

    renderPaginationControls(
      <PaginationControls
        pagination={{
          page: 1,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false
        }}
      />
    );

    expect(div.firstChild).toBeNull();
  });

  it('renders page count, labels, classes, aria label, and passthrough props', () => {
    renderPaginationControls(
      <PaginationControls
        ariaLabel="teams pagination"
        className="teams-pagination"
        data-pagination="teams"
        pagination={{
          page: 2,
          totalPages: 4,
          hasPreviousPage: true,
          hasNextPage: true
        }}
      />
    );

    const pagination = div.querySelector('.pagination');
    const previousButton = div.querySelector('.pagination-previous');
    const nextButton = div.querySelector('.pagination-next');
    const currentPage = div.querySelector('.pagination-link');

    expect(pagination).not.toBeNull();
    expect(pagination.className).toContain('pagination');
    expect(pagination.className).toContain('is-small');
    expect(pagination.className).toContain('teams-pagination');
    expect(pagination.getAttribute('role')).toBe('navigation');
    expect(pagination.getAttribute('aria-label')).toBe('teams pagination');
    expect(pagination.getAttribute('data-pagination')).toBe('teams');
    expect(previousButton.textContent).toBe('Previous');
    expect(nextButton.textContent).toBe('Next');
    expect(currentPage.textContent).toBe('Page 2 of 4');
  });

  it('requests previous and next pages when enabled buttons are clicked', () => {
    const handlePageChange = jest.fn();

    renderPaginationControls(
      <PaginationControls
        onPageChange={handlePageChange}
        pagination={{
          page: 3,
          totalPages: 5,
          hasPreviousPage: true,
          hasNextPage: true
        }}
      />
    );

    div.querySelector('.pagination-previous').click();
    div.querySelector('.pagination-next').click();

    expect(handlePageChange).toHaveBeenCalledTimes(2);
    expect(handlePageChange).toHaveBeenNthCalledWith(1, 2);
    expect(handlePageChange).toHaveBeenNthCalledWith(2, 4);
  });

  it('disables unavailable or unhandled pagination buttons', () => {
    const handlePageChange = jest.fn();

    renderPaginationControls(
      <PaginationControls
        onPageChange={handlePageChange}
        pagination={{
          page: 1,
          totalPages: 3,
          hasPreviousPage: false,
          hasNextPage: true
        }}
      />
    );

    const firstPagePreviousButton = div.querySelector('.pagination-previous');
    const firstPageNextButton = div.querySelector('.pagination-next');

    expect(firstPagePreviousButton.disabled).toBe(true);
    expect(firstPageNextButton.disabled).toBe(false);

    firstPagePreviousButton.click();
    firstPageNextButton.click();

    expect(handlePageChange).toHaveBeenCalledTimes(1);
    expect(handlePageChange).toHaveBeenCalledWith(2);

    renderPaginationControls(
      <PaginationControls
        pagination={{
          page: 2,
          totalPages: 3,
          hasPreviousPage: true,
          hasNextPage: true
        }}
      />
    );

    const unhandledPreviousButton = div.querySelector('.pagination-previous');
    const unhandledNextButton = div.querySelector('.pagination-next');

    expect(unhandledPreviousButton.disabled).toBe(true);
    expect(unhandledNextButton.disabled).toBe(true);
  });
});
