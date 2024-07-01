import { Children, createElement, isValidElement } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useYupValidationResolver } from '#libs/ui';
import './Form.scss';

/**
 * Form wrapper.
 *
 * @param props - component props
 *
 * @returns form
 */
export const Form = (
    {
        children,
        defaultValues = {},
        onSubmit,
        schema,
        submitText = 'Submit',
    }
) => {
	const resolver = schema ? useYupValidationResolver(schema) : undefined;
	const methods = useForm({
		defaultValues,
		resolver,
	});

	return (<>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
            <div className='form-fields'>
                <FormProvider {...methods}>
                    {Children.map(children, (child) => {
                        return isValidElement(child) && child.props.name
                            ? createElement(child.type, {
                                    ...child.props,
                                    fieldError: (
                                        methods.formState.errors
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
                    type='submit'>
                    {submitText}
                </button>
            </div>
        </form>
        {/* Debug */}
        <pre className={'fixed bottom-0 left-0 p-4 bg-white border'}>
            {JSON.stringify(methods.watch(), null, 2)}
        </pre>
    </>);
};
