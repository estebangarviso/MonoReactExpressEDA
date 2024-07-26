import react from '@vitejs/plugin-react-swc';
import css from 'unocss/vite';
import { normalizePath } from 'vite';
import { checker } from 'vite-plugin-checker';
import { VitePWA as pwa } from 'vite-plugin-pwa';
import fonts from 'vite-plugin-webfont-dl';
import { compilerOptions as tsconfig } from './tsconfig.json';

const FONT_FAMILY = process.env.FONT_FAMILY;
const FONT_WEIGHTS = process.env.FONT_WEIGHTS;
const BASE_PATH = normalizePath(`/${process.env.BASE_URL}`);

/**
 * @type {import('vite').UserConfig}
 */
export default {
	base: BASE_PATH,

	build: {
		minify: true,
		rollupOptions: {
			output: {
				manualChunks: {
					/* elements order is important because chunks
					may import previously generated/grouped chunks */
					react: ['react', 'react-dom'],
					router: ['react-router-dom'],
					store: ['zustand'],
					'lib-router': ['./src/libs/router/index.js'],
				},
			},
		},
		sourcemap: tsconfig.sourceMap,
		target: tsconfig.target,
	},

	clearScreen: false,

	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `$font-family: ${FONT_FAMILY};`,
			},
		},
	},

	// envPrefix: 'CUSTOM_PREFIX_',
	plugins: [
		checker({
			enableBuild: true,
			terminal: true,
			// typescript: true,
		}),
		react(),
		css(),
		fonts(
			[
				`https://fonts.googleapis.com/css2?family=${FONT_FAMILY}:wght@${FONT_WEIGHTS}&display=swap`,
			],
			{
				injectAsStyleTag: false,
				minifyCss: true,
			},
		),
		pwa({
			devOptions: {
				enabled: false,
			},
			disable: process.env.SERVICE_WORKER === 'false',
			injectRegister: 'inline',
			manifest: false,
			registerType: 'autoUpdate',
			workbox: {
				cleanupOutdatedCaches: true,
				globPatterns: [
					'**/*.{html,js,css,ico,png,svg,webp,avif,woff2}',
				],
				// sourcemap: tsconfig.sourceMap,
				sourcemap: true,
			},
		}),
	],

	preview: {
		cors: true,
		open: false,
	},

	server: {
		cors: true,
		open: false,
		port: +process.env.PORT,
		proxy: {
			'/api': {
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/v, ''),
				target: process.env.PROXY,
			},
		},
	},
};
