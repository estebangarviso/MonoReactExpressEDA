import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Sets page document title.
 *
 * @param title - document title
 */
export const useDocumentTitle = title => {
	useEffect(() => {
		document.title = title;
	}, [title]);
};

/**
 * Returns URL hash value.
 *
 * @example
 *  const hash = useHash();
 *
 * @see useLocation from react-router-dom.
 *
 * @returns URL hash.
 */
export const useHashValue = () => {
	const { hash } = useLocation();

	return hash.slice(1);
};
