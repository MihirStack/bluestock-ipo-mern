import { model, Schema, type InferSchemaType } from 'mongoose'

export const ipoStatuses = ['upcoming', 'ongoing', 'closed', 'listed'] as const

const ipoSchema = new Schema(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    priceBand: { type: String, required: true, trim: true },
    openDate: { type: Date, required: true, index: true },
    closeDate: { type: Date, required: true },
    issueSize: { type: String, required: true, trim: true },
    issueType: { type: String, required: true, trim: true },
    listingDate: { type: Date, index: true },
    status: { type: String, enum: ipoStatuses, required: true, index: true },
    ipoPrice: { type: Number, min: 0 },
    listingPrice: { type: Number, min: 0 },
    currentMarketPrice: { type: Number, min: 0 },
    documents: {
      rhp: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
      drhp: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    },
  },
  { timestamps: true },
)

export type Ipo = InferSchemaType<typeof ipoSchema>
export const IpoModel = model('Ipo', ipoSchema)
