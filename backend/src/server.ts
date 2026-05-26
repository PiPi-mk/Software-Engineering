import { buildApp } from './app'
import { getPort } from './config/env'

const app = buildApp()
const port = getPort()

app.listen(port, '0.0.0.0')

