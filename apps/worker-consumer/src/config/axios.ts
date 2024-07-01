import axios from 'axios'
import { BASE_URL, PORT } from '.'
axios.defaults.baseURL = `http://localhost:${PORT}/${BASE_URL}`
