import { WrapperError } from '../../../errors/index.js';
import { FormGroup } from '../FormGroup.jsx';

/**
 * Input form field.
 */
export const Input = ({
	className,
	fieldError,
	groupProps,
	label,
	name,
	register,
	...otherProps
}) => {
	if (register === undefined)
		throw new WrapperError(
			'Input component must be wrapped in a Form component.',
		);

	return (
		<FormGroup error={fieldError} label={label} name={name} {...groupProps}>
			<input
				className={`form-input ${className}`.trim()}
				id={name}
				{...register(name)}
				{...otherProps}
			/>
		</FormGroup>
	);
};
