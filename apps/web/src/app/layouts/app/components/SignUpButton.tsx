import { Modal, useModal } from '#libs/ui';
import { SignUpForm } from './SignUpForm.tsx';
/**
 * Sign up modal component.
 */
export const SignUpButton: React.FC<
	Omit<
		React.DetailedHTMLProps<
			React.ButtonHTMLAttributes<HTMLButtonElement>,
			HTMLButtonElement
		>,
		'onClick'
	>
> = ({ className, ...otherProps }) => {
	const { close, isOpen, open } = useModal();

	return (
		<>
			<button
				className={`rounded bg-blue-500 px-4 py-2 text-white font-bold transition-colors hover:bg-blue-700 ${className ?? ''}`.trim()}
				{...otherProps}
				onClick={open}
			>
				Sign Up
			</button>
			<Modal isOpen={isOpen} onClose={close} title='Sign Up'>
				<SignUpForm onSuccess={close} />
			</Modal>
		</>
	);
};
