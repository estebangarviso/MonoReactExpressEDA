import type { LayoutRoute, RouteDefinition } from './route';

export const isLayoutRoute = (route: RouteDefinition): route is LayoutRoute => {
	return !!(route as LayoutRoute).Layout;
};
