import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

const app = express()
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/v1/health', (_request, response) => {
  response.json({ success: true, data: { service: 'bluestock-ipo-api', status: 'ok' } })
})

app.use((_request, response) => {
  response.status(404).json({ success: false, message: 'Route not found' })
})

export default app
