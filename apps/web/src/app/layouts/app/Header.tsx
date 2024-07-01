import { SignUpButton } from './components/SignUpButton';
/**
 * Header for App Layout.
 *
 * @returns header component
 */
export const Header: React.FC<HeaderProps> = ({
	title,
}): React.ReactElement => {
	return (
		<header className='bg-blue-500 p-4 text-white'>
			<div className='flex items-center justify-between'>
				<h1 className='text-2xl font-bold'>{title}</h1>
				<SignUpButton />
			</div>
		</header>
	);
};

interface HeaderProps {
	title: string;
}
