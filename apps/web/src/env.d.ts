type MODE = 'development' | 'production' | 'test';

/**
 * Global types definition for
 * environment variables.
 *
 * @remarks environment variables schema
 */
interface ImportMetaEnv {
	readonly APP_ENV: 'dev' | 'release';
	readonly MODE: MODE;
	readonly NODE_ENV: MODE;

	readonly DEV: 'false' | 'true';
	readonly PROD: 'false' | 'true';
	readonly SSR: 'false' | 'true';
	readonly VITEST: 'false' | 'true';

	// SECTION: base config
	readonly BASE_URL: string;
	readonly PORT: string;

	// SECTION: project info from package.json
	readonly APP_AUTHOR: string;
	readonly APP_TITLE: string;
	readonly APP_VERSION: string;

	// SECTION: bff config
	readonly VITE_BFF_BASE_URL: string;
	readonly VITE_BFF_SIGNUP_ENDPOINT: string;
	readonly VITE_BFF_SSE_PDF_ENDPOINT: string;
	readonly VITE_BFF_USER_LIST_ENDPOINT: string;
	readonly VITE_BFF_USER_PDF_DOWNLOAD_ENDPOINT;
	readonly VITE_BFF_USER_PDF_ENDPOINT: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
