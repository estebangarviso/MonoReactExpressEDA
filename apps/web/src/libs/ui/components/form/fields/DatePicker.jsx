import ReactDatePicker from 'react-datepicker';
import { Controller, useFormContext } from 'react-hook-form';
import { FormGroup } from '../FormGroup.jsx';
import './DatePicker.scss';

/**
 * Date picker form field.
 */
export const DatePicker = ({
	className,
	groupProps,
	label,
	name,
	placeholder,
	...otherProps
}) => {
	const { control } = useFormContext();

	return (
		<Controller
			control={control}
			name={name}
			render={({ field, fieldState }) => (
				<FormGroup
					error={fieldState.error}
					label={label}
					name={name}
					{...groupProps}
				>
					<ReactDatePicker
						className={`form-input ${className}`.trim()}
						id={name}
						onChange={(value) => field.onChange(value)}
						placeholderText={placeholder}
						selected={field.value}
						{...otherProps}
					/>
				</FormGroup>
			)}
		/>
	);
};

/**
 * Handle input key down mask.
 * @param event - Keyboard event.
 * @example
 * ```tsx
 * <input onKeyDown={handleInputKeyDownMask} />
 * ```
 */
export const handleInputKeyDownMask = (event) => {
	const separator = '/';
	const target = event.target;
	const inputValue = target.value;
	const key = event.key;

	if (key !== separator) {
		if (key === 'Backspace') {
			if (inputValue.length === 5) {
				target.value = inputValue.slice(0, 4);
			} else if (inputValue.length === 2) {
				target.value = inputValue.slice(0, 1);
			}
		} else if (inputValue.length === 2 || inputValue.length === 5) {
			target.value = inputValue + separator;
		} else if (key === 'v' && inputValue.length === 8) {
			// to handle copy & paste of 8 digit
			target.value = `${inputValue.slice(0, 2)}${separator}${inputValue.slice(2, 4)}${separator}${inputValue.slice(4, 8)}`;
		}
	}
};
