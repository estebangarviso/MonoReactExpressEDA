import { useEffect, useRef } from 'react';
import { Portal } from './Portal';
import './Modal.scss';

export interface ModalProps extends React.HTMLAttributes<HTMLElement> {
	/**
	 * Modal title.
	 */
	title: string;

	/**
	 * Modal close handler.
	 */
	onClose: () => void;

	/**
	 * Modal state.
	 */
	isOpen: boolean;

	/**
	 * Modal children inside the content.
	 */
	children: React.ReactNode;

	/**
	 * Modal footer.
	 */
	footer?: React.ReactNode;
}

/**
 * Modal wrapper.
 *
 * @param props - component props
 *
 * @returns modal
 */
export const Modal: React.FC<ModalProps> = ({
	children,
	footer,
	isOpen,
	onClose,
	title,
	...otherProps
}): React.ReactElement => {
	const modalRef = useRef<HTMLDivElement>(null);

	/**
	 * It will prevent the body from scrolling when the modal is open.
	 */
	useEffect(() => {
		document.body.style.overflow = isOpen ? 'hidden' : 'auto';
	}, [isOpen]);

	/**
	 * It will close the modal when the user clicks outside the modal.
	 */
	useEffect(() => {
		const handleClick = (event: MouseEvent): void => {
			if (
				modalRef.current &&
				!modalRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClick);
		}

		return (): void => {
			document.removeEventListener('mousedown', handleClick);
		};
	}, [isOpen, onClose]);

	return (
		<Portal>
			{isOpen && (
				<div className='modal' {...otherProps}>
					<div className='modal-overlay' />
					<div className='modal-content' ref={modalRef}>
						<div className='modal-header'>
							{title || <h2 className='modal-title'>{title}</h2>}
							<button
								className='modal-close'
								onClick={onClose}
								type='button'
							/>
						</div>
						<div className='modal-body'>{children}</div>
						{footer && <div className='modal-footer'>{footer}</div>}
					</div>
				</div>
			)}
		</Portal>
	);
};
