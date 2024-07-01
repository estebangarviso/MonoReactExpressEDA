import { WrapperError } from '../../../errors/index.ts';
import { type FormFieldCommonProps } from '../Form.tsx';
import { FormGroup } from '../FormGroup.tsx';

type InputProps = FormFieldCommonProps &
	React.InputHTMLAttributes<HTMLInputElement> & {
		/**
		 * Input name.
		 */
		name: string;

		/**
		 * Input label.
		 */
		label: string;

		/**
		 * Input type.
		 */
		type: string;

		/**
		 * Input placeholder.
		 */
		placeholder?: string;

		/**
		 * Group props.
		 */
		groupProps?: React.DetailedHTMLProps<
			React.HTMLAttributes<HTMLDivElement>,
			HTMLDivElement
		>;
	};

/**
 * Input form field.
 */
export const Input: React.FC<InputProps> = ({
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
