import { useCallback } from 'react';
import ReactDatePicker, {
	type DatePickerProps as ReactDatePickerProps,
} from 'react-datepicker';
import { Controller, useFormContext } from 'react-hook-form';
import { FormGroup } from '../FormGroup.tsx';
import './DatePicker.scss';

interface DatePickerProps
	extends Omit<
		ReactDatePickerProps,
		| 'excludeScrollbar'
		| 'id'
		| 'onChange'
		| 'onSelect'
		| 'placeholderText'
		| 'selected'
		| 'selectsMultiple'
		| 'selectsRange'
	> {
	/**
	 * Date picker name.
	 */
	name: string;

	/**
	 * Date picker label.
	 */
	label: string;

	/**
	 * Date picker placeholder.
	 */
	placeholder?: string;

	/**
	 * Date picker group props.
	 */
	groupProps?: React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	>;
}

/**
 * Date picker form field.
 */
export const DatePicker: React.FC<DatePickerProps> = ({
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
export const handleInputKeyDownMask = (
	event: React.KeyboardEvent<HTMLElement>,
): void => {
	const separator = '/';
	const target = event.target as HTMLInputElement;
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
