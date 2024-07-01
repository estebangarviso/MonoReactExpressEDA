import { useState } from 'react';

/**
 * Modal hook.
 *
 * @returns modal state and handlers
 */
export const useModal = () => {
	const [isOpen, setIsOpen] = useState(false);

	const open = () => {
		setIsOpen(true);
	};

	const close = () => {
		setIsOpen(false);
	};

	return { close, isOpen, open };
};
