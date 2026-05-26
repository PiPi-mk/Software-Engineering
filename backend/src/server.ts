import { buildApp } from './app.ts'
import { getPort } from './config/env.ts'

const app = buildApp()
const port = getPort()

app.listen(port, '0.0.0.0')
