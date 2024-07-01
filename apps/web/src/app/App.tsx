import { AppRouter } from './App.router.tsx';
import './styles/app.scss';

/**
 * Here occur the initialization,
 * for routing, store and main app.
 *
 * @returns app container
 */
export const App: React.FC = (): React.ReactElement => {
	return <AppRouter />;
};
