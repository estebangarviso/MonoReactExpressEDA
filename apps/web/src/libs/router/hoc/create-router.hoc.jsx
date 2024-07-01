import { Suspense } from 'react';
import {
	RouterProvider,
	createBrowserRouter,
	createHashRouter,
	createMemoryRouter,
} from 'react-router-dom';
import { createRoutes } from './create-routes.jsx';

/**
 * Create router lookup.
 */
const getRouterFactory = {
	browser: createBrowserRouter,
	hash: createHashRouter,
	memory: createMemoryRouter,
};

/**
 * Creates a routes rendering
 * using React Router.
 *
 * You can create multiple routers for
 * different routes contexts, i.e. public
 * and private routes.
 *
 * @example
 * ```ts
 *  // routes definition
 *	import { lazy } from 'react';
 *	import MyEagerPage from '@pages/MyEagerPage.page';
 *
 *	export const myRoutes = [
 *		...,
 *		{	// when not specified, by default '/' path
 *			Layout: AppLayout, // a layout wraps its children
 *			children: [
 *				{
 *					Component: lazy(() => import('./pages/main/Main.page')),
 *					..., // any React Router route config
 *				},
 *				{
 *					path: 'detail/:id?',
 *					Component: lazy(() => import('./pages/detail/Detail.page')),
 *				},
 *			],
 *		},
 *	];
 *```
 * @example
 * ```ts
 *  // use this HOC as
 *	import { createRouter } from '@router';
 *	import { myRoutes } from '...';
 *
 *	const Router = createRouter({
 *		routes: myRoutes,
 *		loader: <h1>Loading</h1>,
 *		fallback: <h1>Not Found</h1>
 *	});
 *
 *	export const AppRouter: React.FC = (): React.ReactElement => {
 *		// authorization or any other logic
 *
 *		return <Router />;
 *	};
 *```
 *
 * @param config - router config
 *
 * @returns router with routes preloaded
 */
export const createRouter = ({
	fallback,
	loading,
	options,
	routes: routesDef,
	type = 'browser',
}) => {
	const routes = createRoutes(routesDef);

	const create = getRouterFactory[type];
	const router = create(routes, options);

	return () => (
		<Suspense fallback={loading}>
			<RouterProvider fallbackElement={fallback} router={router} />
		</Suspense>
	);
};
