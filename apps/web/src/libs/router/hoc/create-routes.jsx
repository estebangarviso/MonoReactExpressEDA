import { Suspense, lazy } from 'react';
import { Outlet } from 'react-router-dom';
import { isLayoutRoute } from '../types/is-layout-route.js';

const renderLayout = (Layout, loading) => {
	if (loading)
		return () => (
			<Layout>
				<Suspense fallback={loading}>
					<Outlet />
				</Suspense>
			</Layout>
		);

	return () => (
		<Layout>
			<Outlet />
		</Layout>
	);
};

export const createRoutes = (routes) => {
	for (const route of routes) {
		if (isLayoutRoute(route)) {
			const { Layout, loading } = route;

			route.Component = renderLayout(Layout, loading);

			route.Layout = undefined;
		}

		route.path ??= '';

		// lazy load component for chunk splitting
		if (route.lazy) {
			route.Component ??= lazy(route.lazy);
			route.lazy = undefined;
		}

		if (route.children) createRoutes(route.children);
	}

	return routes;
};
