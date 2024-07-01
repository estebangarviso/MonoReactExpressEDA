import path from 'path'
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
export const ROOT_DIR = path.resolve(__dirname, '../../')
export const PDFS_DIR = path.join(ROOT_DIR, 'pdfs')
