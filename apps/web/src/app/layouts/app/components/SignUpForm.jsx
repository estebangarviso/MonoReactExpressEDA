import { useCallback } from 'react';
import * as yup from 'yup';
import {
	DatePicker,
	Form,
	Input,
	handleInputKeyDownMask,
	useDob,
} from '#libs/ui';
import './SignUpForm.scss';

const schema = yup.object().shape({
	birthDate: yup.date().required().max(new Date()),
	email: yup.string().email().required(),
	firstName: yup.string().required(),
	lastName: yup.string().required(),
	password: yup.string().required().min(8),
});

const endpoint =
	import.meta.env.VITE_BFF_BASE_URL +
	import.meta.env.VITE_BFF_SIGNUP_ENDPOINT;

const defaultValues = {
	birthDate: '',
	email: '',
	firstName: '',
	lastName: '',
	password: '',
};

/**
 * Sign up form component.
 */
export const SignUpForm = ({ onSuccess }) => {
	const { maxDate, minDate } = useDob();

	/**
	 * Handle form submit.
	 */
	const handleSubmit = useCallback(async (data) => {
		try {
			// remove time from birthDate
			data.birthDate = new Date(data.birthDate)
				.toISOString()
				.split('T')[0];
			const body = JSON.stringify(data);
			const response = await fetch(endpoint, {
				body,
				headers: {
					'Content-Type': 'application/json',
				},
				method: 'POST',
			});

			if (!response.ok) {
				throw new Error('Failed to sign up');
			}

			onSuccess(data);
		} catch (error) {
			console.error(error);
		}
	}, []);

	return (
        (<Form defaultValues={defaultValues} onSubmit={handleSubmit} schema={schema}>
            <Input className='w-full' label='First Name' name='firstName' type='text' />
            <Input className='w-full' label='Last Name' name='lastName' type='text' />
            <DatePicker
                className='w-full'
                dropdownMode='select'
                label='Birth Date'
                maxDate={maxDate}
                minDate={minDate}
                name='birthDate'
                onKeyDown={handleInputKeyDownMask}
                peekNextMonth
                showMonthDropdown
                showYearDropdown />
            <Input className='w-full' label='Email' name='email' type='email' />
            <Input className='w-full' label='Password' name='password' type='password' />
        </Form>)
    );
};
