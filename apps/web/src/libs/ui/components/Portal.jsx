import { createPortal } from 'react-dom';

/**
 * Portal wrapper.
 *
 * @param props - component props
 *
 * @returns portal
 */
export const Portal = (
    {
        children,
    }
) => {
	return createPortal(children, document.body);
};
