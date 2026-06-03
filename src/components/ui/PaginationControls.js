import React from 'react';

function getPaginationClassName(className) {
  const classes = ['pagination', 'is-small'];

  if (className) {
    classes.push(className);
  }

  return classes.join(' ');
}

export default function PaginationControls(props) {
  const {
    ariaLabel = 'pagination',
    className,
    nextLabel = 'Next',
    onPageChange,
    pagination,
    previousLabel = 'Previous',
    ...paginationControlsProps
  } = props;

  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const previousPage = pagination.page - 1;
  const nextPage = pagination.page + 1;
  const canGoPrevious = pagination.hasPreviousPage && typeof onPageChange === 'function';
  const canGoNext = pagination.hasNextPage && typeof onPageChange === 'function';

  return (
    <nav
      {...paginationControlsProps}
      className={getPaginationClassName(className)}
      role="navigation"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className="pagination-previous"
        disabled={!canGoPrevious}
        onClick={() => canGoPrevious && onPageChange(previousPage)}
      >
        {previousLabel}
      </button>
      <button
        type="button"
        className="pagination-next"
        disabled={!canGoNext}
        onClick={() => canGoNext && onPageChange(nextPage)}
      >
        {nextLabel}
      </button>
      <ul className="pagination-list">
        <li>
          <span className="pagination-link is-current">
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </li>
      </ul>
    </nav>
  );
}
