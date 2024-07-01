import { Page } from '#libs/router';
import styles from './main.page.module.scss';

/**
 * Main page.
 */
export const LoginPage = () => {
	// jsx
	return (
        (<Page className={styles.page} title='Main Page'>
            <div className='flex items-center justify-center space-x-4'>
				<i className='mdi-file-pdf-box-outline text-4xl text-red-700' />
				<h1 className='text-4xl text-blue-700 font-bold'>Login</h1>
			</div>
        </Page>)
    );
};

export default LoginPage;
