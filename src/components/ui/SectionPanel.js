import React from 'react';

function getSectionPanelClassName(className) {
  const classes = ['tile', 'is-child', 'box', 'header', 'hl-panel'];

  if (className) {
    classes.push(className);
  }

  return classes.join(' ');
}

function getHeadingClassName(className) {
  const classes = ['level', 'dashboard-title'];

  if (className) {
    classes.push(className);
  }

  return classes.join(' ');
}

export default function SectionPanel(props) {
  const {
    actions,
    children,
    className,
    headingClassName,
    iconClassName,
    title,
    titleClassName,
    ...sectionPanelProps
  } = props;
  const hasHeading = Boolean(title || iconClassName || actions);

  return (
    <div
      {...sectionPanelProps}
      className={getSectionPanelClassName(className)}
    >
      {hasHeading ? (
        <nav className={getHeadingClassName(headingClassName)}>
          <div className="level-left">
            <div className="level-item">
              {iconClassName ? (
                <span className="icon icon-dasboard-placement">
                  <i className={iconClassName} aria-hidden="true"></i>
                </span>
              ) : null}
              {title ? (
                <p className={titleClassName}>
                  {title}
                </p>
              ) : null}
            </div>
          </div>
          {actions ? (
            <div className="level-right">
              <span className="level-item">
                {actions}
              </span>
            </div>
          ) : null}
        </nav>
      ) : null}
      {children}
    </div>
  );
}
