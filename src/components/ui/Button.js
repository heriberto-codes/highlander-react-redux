import React from 'react';
import { Link } from 'react-router-dom';

function getButtonClassName(props) {
	const classes = ['button'];

	if (props.variant) {
		classes.push(`is-${props.variant}`);
	}

	if (props.size) {
		classes.push(`is-${props.size}`);
	}

	if (props.isOutlined) {
		classes.push('is-outlined');
	}

	if (props.isInverted) {
		classes.push('is-inverted');
	}

	if (props.isLight) {
		classes.push('is-light');
	}

	if (props.isActive) {
		classes.push('is-active');
	}

	if (props.isDisabled) {
		classes.push('is-disabled');
	}

	if (props.className) {
		classes.push(props.className);
	}

	return classes.join(' ');
}

function getDisabledProps(isDisabled, onClick) {
	if (!isDisabled) {
		return { onClick };
	}

	return {
		'aria-disabled': true,
		onClick: event => {
			event.preventDefault();
			if (event.stopPropagation) {
				event.stopPropagation();
			}
		},
		tabIndex: -1
	};
}

export default function Button(props) {
	const {
		children,
		className,
		disabled,
		href,
		isActive,
		isDisabled,
		isInverted,
		isLight,
		isOutlined,
		onClick,
		size,
		to,
		type,
		variant,
		...buttonProps
	} = props;
	const effectiveDisabled = Boolean(isDisabled || disabled);
	const buttonClassName = getButtonClassName({
		className,
		isActive,
		isDisabled: effectiveDisabled,
		isInverted,
		isLight,
		isOutlined,
		size,
		variant
	});

	if (to) {
		return (
			<Link
				{...buttonProps}
				{...getDisabledProps(effectiveDisabled, onClick)}
				className={buttonClassName}
				to={to}
			>
				{children}
			</Link>
		);
	}

	if (href) {
		return (
			<a
				{...buttonProps}
				{...getDisabledProps(effectiveDisabled, onClick)}
				className={buttonClassName}
				href={href}
			>
				{children}
			</a>
		);
	}

	return (
		<button
			{...buttonProps}
			className={buttonClassName}
			disabled={effectiveDisabled}
			onClick={onClick}
			type={type || 'button'}
		>
			{children}
		</button>
	);
}
