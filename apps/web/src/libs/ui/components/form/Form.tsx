import { Children, createElement, isValidElement } from 'react';
import {
	type FieldError,
	type FieldValues,
	FormProvider,
	type UseFormRegister,
	useForm,
} from 'react-hook-form';
import { type ObjectSchema } from 'yup';
import { useYupValidationResolver } from '#libs/ui';
import './Form.scss';

interface FormProps {
	/**
	 * Form submit handler.
	 */
	onSubmit: (data: Record<string, string>) => void;

	/**
	 * Form children.
	 */
	children: React.ReactNode;

	/**
	 * Form initial values.
	 */
	defaultValues?: Record<string, any>;

	/**
	 * Form validation schema.
	 */
	schema?: ObjectSchema<FieldValues>;

	/**
	 * Submit button text.
	 */
	submitText?: string;
}

export interface FormFieldCommonProps {
	/**
	 * Field error.
	 */
	fieldError?: FieldError;

	/**
	 * React hook form register.
	 */
	register?: UseFormRegister<FieldValues>;
}

/**
 * Form wrapper.
 *
 * @param props - component props
 *
 * @returns form
 */
export const Form: React.FC<FormProps> = ({
	children,
	defaultValues = {},
	onSubmit,
	schema,
	submitText = 'Submit',
}): React.ReactElement => {
	const resolver = schema ? useYupValidationResolver(schema) : undefined;
	const methods = useForm({
		defaultValues,
		resolver,
	});

	return (
		<>
			<form onSubmit={methods.handleSubmit(onSubmit)}>
				<div className='form-fields'>
					<FormProvider {...methods}>
						{Children.map(children, (child) => {
							return isValidElement(child) && child.props.name
								? createElement(child.type, {
										...child.props,
										fieldError: (
											methods.formState.errors as any
										)[child.props.name],
										key: child.props.name,
										register: methods.register,
									})
								: child;
						})}
					</FormProvider>
				</div>
				<div className='flex justify-end'>
					<button
						className='rounded bg-blue-500 px-4 py-2 text-white font-bold transition-colors hover:bg-blue-700'
						type='submit'
					>
						{submitText}
					</button>
				</div>
			</form>
			{/* Debug */}
			<pre className={'fixed bottom-0 left-0 p-4 bg-white border'}>
				{JSON.stringify(methods.watch(), null, 2)}
			</pre>
		</>
	);
};
