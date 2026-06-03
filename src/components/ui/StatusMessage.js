import React from 'react';

const variantClasses = {
  error: 'is-danger',
  loading: '',
  success: 'is-success',
  warning: 'is-warning'
};

function getStatusMessageClassName(variant, className) {
  const classes = ['notification', 'hl-status-message'];
  const variantClassName = variantClasses[variant];

  if (variantClassName) {
    classes.push(variantClassName);
  }

  if (className) {
    classes.push(className);
  }

  return classes.join(' ');
}

function getDefaultRole(variant) {
  return variant === 'error' || variant === 'warning' ? 'alert' : undefined;
}

export default function StatusMessage(props) {
  const {
    children,
    className,
    message,
    role,
    variant = 'loading',
    ...statusMessageProps
  } = props;
  const content = children || message;

  if (!content) {
    return null;
  }

  return (
    <div
      {...statusMessageProps}
      className={getStatusMessageClassName(variant, className)}
      role={role || getDefaultRole(variant)}
    >
      {content}
    </div>
  );
}
