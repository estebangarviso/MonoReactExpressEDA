import React from 'react';
import { type FieldError } from 'react-hook-form';

/**
 * FormGroup props.
 */
export interface FormGroupProps
	extends React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	> {
	/**
	 * Form field error.
	 */
	error?: FieldError;

	/**
	 * Form field label.
	 */
	label: string;

	/**
	 * Form field name.
	 */
	name: string;
}

/**
 * FormGroup wraps a form element and provides a label and error message.
 */
export const FormGroup: React.FC<React.PropsWithChildren<FormGroupProps>> = ({
	children,
	className,
	error,
	label,
	name,
	...otherProps
}) => {
	return (
		<div className={`form-group ${className}`.trim()} {...otherProps}>
			<label
				className='mb-2 block text-sm text-gray-900 font-medium dark:text-white'
				htmlFor={name}
			>
				{label}
			</label>
			{children}

			<p
				className='mt-2 text-sm text-red-600 dark:text-red-500'
				role='alert'
			>
				{error ? error.message : <>&nbsp;</>}
			</p>
		</div>
	);
};
