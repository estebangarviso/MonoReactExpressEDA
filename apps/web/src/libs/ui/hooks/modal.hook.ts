import { useState } from 'react';

interface UseModal {
	/**
	 * Modal state.
	 */
	isOpen: boolean;

	/**
	 * Open modal handler.
	 */
	open: () => void;

	/**
	 * Close modal handler.
	 */
	close: () => void;
}

/**
 * Modal hook.
 *
 * @returns modal state and handlers
 */
export const useModal = (): UseModal => {
	const [isOpen, setIsOpen] = useState(false);

	const open = (): void => {
		setIsOpen(true);
	};

	const close = (): void => {
		setIsOpen(false);
	};

	return { close, isOpen, open };
};
