import { useCallback } from 'react';
import type { FieldValues } from 'react-hook-form';
import * as Yup from 'yup';

export const useYupValidationResolver = (
	schema:
		| Yup.Lazy<
				{
					[x: string]: any;
				},
				Yup.AnyObject,
				any
		  >
		| Yup.ObjectSchema<FieldValues, Yup.AnyObject, any, ''>,
) =>
	useCallback(
		async (data: Record<string, string>) => {
			try {
				const values = await schema.validate(data, {
					abortEarly: false,
				});

				return {
					errors: {},
					values,
				};
			} catch (error: unknown) {
				if (!(error instanceof Yup.ValidationError)) {
					throw error;
				}
				return {
					errors: Object.fromEntries(
						error.inner.map((currentError) => [
							currentError.path,
							{
								message: currentError.message,
								type: currentError.type ?? 'validation',
							},
						]),
					),
					values: {},
				};
			}
		},
		[schema],
	);
