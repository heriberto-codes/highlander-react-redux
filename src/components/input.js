import React, { useEffect, useRef } from 'react';

export default function Input(props) {
	const inputRef = useRef(null);
	const previousActiveRef = useRef(props.meta.active);

	useEffect(() => {
		if(!previousActiveRef.current && props.meta.active && inputRef.current) {
			inputRef.current.focus();
		}

		previousActiveRef.current = props.meta.active;
	}, [props.meta.active]);

	const Element = props.element || 'input';

	let error;
	if(props.meta.touched && props.meta.error) {
		error = <div className='form-warning'>{props.meta.error}</div>;
	}

	let warning;
	if(props.meta.touched && props.meta.warning) {
		warning = (
			<div className='form-warning'>{props.meta.warning}</div>
		);
	}

	return (
		<div className='form-input' >
			<label htmlFor={props.input.name}>
				{props.label}
				{error}
				{warning}
			</label>
			<Element
				className='input is-medium required'
				{...props.input}
				id={props.input.name}
				type={props.type}
				ref={inputRef}
			/>
		</div>
	);
}
