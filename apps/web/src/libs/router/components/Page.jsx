import { useDocumentTitle } from '../router.hook.js';

/**
 * Page wrapper.
 *
 * @param props - component props
 *
 * @returns page
 */
export const Page = ({ children, title, ...attrs }) => {
	// sets up page tab title
	useDocumentTitle(title);

	return <section {...attrs}>{children}</section>;
};
