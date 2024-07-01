import path from 'path'
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
export const APP_PRODUCER_ROOT_DIR = path.resolve(__dirname, '../../../api-producer')
export const PDFS_DIR = path.join(APP_PRODUCER_ROOT_DIR, 'pdfs')
