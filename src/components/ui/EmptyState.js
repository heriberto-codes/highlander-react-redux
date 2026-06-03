import React from 'react';

function getEmptyStateClassName(className) {
  const classes = ['notification', 'has-text-centered', 'hl-status-message'];

  if (className) {
    classes.push(className);
  }

  return classes.join(' ');
}

export default function EmptyState(props) {
  const {
    children,
    className,
    message = 'No items to display.',
    ...emptyStateProps
  } = props;
  const content = children || message;

  return (
    <div
      {...emptyStateProps}
      className={getEmptyStateClassName(className)}
    >
      {content}
    </div>
  );
}
