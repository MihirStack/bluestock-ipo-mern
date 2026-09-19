import { Router } from 'express'
import { findIpoById, listIpos, parseListQuery } from '../services/ipo.service.js'

const ipoRouter = Router()

ipoRouter.get('/', async (request, response, next) => {
  try {
    const result = await listIpos(parseListQuery(request.query))
    response.json({
      success: true,
      message: 'IPOs fetched successfully',
      data: result.records,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    })
  } catch (error) {
    next(error)
  }
})

ipoRouter.get('/:id', async (request, response, next) => {
  try {
    const ipo = await findIpoById(request.params.id)
    if (!ipo) {
      response.status(404).json({ success: false, message: 'IPO not found' })
      return
    }
    response.json({ success: true, data: ipo })
  } catch (error) {
    next(error)
  }
})

export default ipoRouter
