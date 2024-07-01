import { Footer } from './Footer.tsx';
import { Header } from './Header.tsx';
import styles from './app.layout.module.scss';

const TITLE = import.meta.env.APP_TITLE;
const AUTHOR = import.meta.env.APP_AUTHOR;

/**
 * App layout (wrapper for pages with header/footer).
 *
 * @returns app layout
 */
export const AppLayout: React.FC<AppLayoutProps> = ({
	children,
	withFooter = true,
	withHeader = true,
}): React.ReactElement => (
	<main className={styles.layout}>
		{withHeader && <Header title={TITLE} />}

		{children}

		{withFooter && (
			<Footer text={`© ${new Date().getFullYear()} ${AUTHOR}`} />
		)}
	</main>
);

export interface AppLayoutProps extends React.PropsWithChildren {
	withFooter?: boolean;
	withHeader?: boolean;
}

export default AppLayout;
