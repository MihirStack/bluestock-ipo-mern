import 'dotenv/config'
import app from './app.js'
import { connectDatabase } from './config/database.js'

const port = Number(process.env.PORT ?? 11000)

connectDatabase()
  .catch((error: unknown) => {
    console.error('MongoDB connection failed; using deterministic seed data.', error)
  })
  .finally(() => {
    app.listen(port, () => console.log(`Bluestock IPO API listening on http://localhost:${port}`))
  })
