import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import ipoRouter from './routes/ipo.routes.js'

const app = express()
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/v1/ipos', ipoRouter)

app.get('/api/v1/health', (_request, response) => {
  response.json({ success: true, data: { service: 'bluestock-ipo-api', status: 'ok' } })
})

app.use((_request, response) => {
  response.status(404).json({ success: false, message: 'Route not found' })
})

app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    void _next
    console.error(error)
    response.status(500).json({ success: false, message: 'Internal server error' })
  },
)

export default app
