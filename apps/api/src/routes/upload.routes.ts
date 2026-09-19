import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'
import { documentUpload, logoUpload } from '../middleware/upload.middleware.js'
import { uploadMedia } from '../services/media.service.js'

const uploadRouter = Router()
const adminOnly = [requireAuth, requireRole('admin')]

uploadRouter.post(
  '/logo',
  ...adminOnly,
  logoUpload.single('file'),
  async (request, response, next) => {
    try {
      if (!request.file) {
        response
          .status(400)
          .json({ success: false, message: 'A JPEG, PNG, or WebP logo file is required.' })
        return
      }
      const result = await uploadMedia(request.file.buffer, 'bluestock-ipo/logos', 'image')
      response.status(201).json({
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
        },
      })
    } catch (error) {
      next(error)
    }
  },
)

uploadRouter.post(
  '/document',
  ...adminOnly,
  documentUpload.single('file'),
  async (request, response, next) => {
    try {
      if (!request.file) {
        response
          .status(400)
          .json({ success: false, message: 'An RHP or DRHP PDF file is required.' })
        return
      }
      const result = await uploadMedia(request.file.buffer, 'bluestock-ipo/documents', 'raw')
      response.status(201).json({
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
        },
      })
    } catch (error) {
      next(error)
    }
  },
)

export default uploadRouter
