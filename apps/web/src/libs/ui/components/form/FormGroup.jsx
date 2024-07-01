import React from 'react';

/**
 * FormGroup wraps a form element and provides a label and error message.
 */
export const FormGroup = ({
	children,
	className,
	error,
	label,
	name,
	...otherProps
}) => {
	return (
        (<div className={`form-group ${className}`.trim()} {...otherProps}>
            <label
                className='mb-2 block text-sm text-gray-900 font-medium dark:text-white'
                htmlFor={name}>
				{label}
			</label>
            {children}
            <p className='mt-2 text-sm text-red-600 dark:text-red-500' role='alert'>
				{error ? error.message : <>&nbsp;</>}
			</p>
        </div>)
    );
};
