import axios from 'axios'
import { BASE_URL, PORT } from './index.js'
axios.defaults.baseURL = `http://localhost:${PORT}/${BASE_URL}`
