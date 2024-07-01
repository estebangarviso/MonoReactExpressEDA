import { Page } from '#libs/router';
import UsersBox from './components/UsersBox.tsx';
import styles from './main.page.module.scss';

/**
 * Main page.
 */
export const MainPage: React.FC = (): React.ReactElement => {
	// jsx
	return (
		<Page className={styles.page} title='Main Page'>
			<div className='flex items-center justify-center space-x-4'>
				<i className='mdi-file-pdf-box-outline text-4xl text-red-700' />
				<h1 className='text-4xl text-blue-700 font-bold'>Users</h1>
			</div>
			<UsersBox />
		</Page>
	);
};

export default MainPage;
