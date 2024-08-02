import path from 'path'
import url from 'url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const APP_PRODUCER_ROOT_DIR = path.resolve(__dirname, '../../../apps/api-producer')
export const PDFS_DIR = path.join(APP_PRODUCER_ROOT_DIR, 'pdfs')

export const PDF_QUEUE = 'pdf:queue';
export const USER_CREATE_PDF = 'user:create-pdf';
export const PRODUCER_APP_NAME = '@demo/api-producer';
