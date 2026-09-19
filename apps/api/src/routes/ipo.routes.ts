import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'
import {
  createIpo,
  deleteIpo,
  findIpoById,
  listIpos,
  parseListQuery,
  updateIpo,
  validateIpoInput,
} from '../services/ipo.service.js'

const ipoRouter = Router()

ipoRouter.post('/', requireAuth, requireRole('admin'), async (request, response, next) => {
  try {
    const parsed = validateIpoInput(request.body)
    if (parsed.error) {
      response.status(400).json({ success: false, message: parsed.error })
      return
    }
    const ipo = await createIpo(parsed.value!)
    response.status(201).json({ success: true, data: ipo })
  } catch (error) {
    next(error)
  }
})

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

ipoRouter.patch('/:id', requireAuth, requireRole('admin'), async (request, response, next) => {
  try {
    const parsed = validateIpoInput(request.body)
    if (parsed.error) {
      response.status(400).json({ success: false, message: parsed.error })
      return
    }
    const ipo = await updateIpo(String(request.params.id), parsed.value!)
    if (!ipo) {
      response.status(404).json({ success: false, message: 'IPO not found' })
      return
    }
    response.json({ success: true, data: ipo })
  } catch (error) {
    next(error)
  }
})

ipoRouter.delete('/:id', requireAuth, requireRole('admin'), async (request, response, next) => {
  try {
    if (!(await deleteIpo(String(request.params.id)))) {
      response.status(404).json({ success: false, message: 'IPO not found' })
      return
    }
    response.json({ success: true, message: 'IPO deleted successfully' })
  } catch (error) {
    next(error)
  }
})

export default ipoRouter
