import { createPortal } from 'react-dom';

/**
 * Portal wrapper.
 *
 * @param props - component props
 *
 * @returns portal
 */
export const Portal: React.FC<React.PropsWithChildren> = ({
	children,
}): React.ReactElement => {
	return createPortal(children, document.body);
};
