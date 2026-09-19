import multer from 'multer'

const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const documentTypes = new Set(['application/pdf'])

export const logoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => callback(null, imageTypes.has(file.mimetype)),
})

export const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => callback(null, documentTypes.has(file.mimetype)),
})
