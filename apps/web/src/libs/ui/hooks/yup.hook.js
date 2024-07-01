import { useCallback } from 'react';
import * as Yup from 'yup';

export const useYupValidationResolver = (
	schema,
) =>
	useCallback(async (data) => {
        try {
            const values = await schema.validate(data, {
                abortEarly: false,
            });

            return {
                errors: {},
                values,
            };
        } catch (error) {
            if (!(error instanceof Yup.ValidationError)) {
                throw error;
            }
            return {
                errors: Object.fromEntries(error.inner.map((currentError) => [
                    currentError.path,
                    {
                        message: currentError.message,
                        type: currentError.type ?? 'validation',
                    },
                ])),
                values: {},
            };
        }
    }, [schema]);
