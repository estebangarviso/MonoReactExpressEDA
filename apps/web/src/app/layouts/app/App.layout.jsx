import { Footer } from './Footer.jsx';
import { Header } from './Header.jsx';
import styles from './app.layout.module.scss';

const TITLE = import.meta.env.APP_TITLE;
const AUTHOR = import.meta.env.APP_AUTHOR;

/**
 * App layout (wrapper for pages with header/footer).
 *
 * @returns app layout
 */
export const AppLayout = ({
	children,
	withFooter = true,
	withHeader = true,
}) => (
	<main className={styles.layout}>
		{withHeader && <Header title={TITLE} />}
		{children}
		{withFooter && (
			<Footer text={`© ${new Date().getFullYear()} ${AUTHOR}`} />
		)}
	</main>
);

export default AppLayout;
