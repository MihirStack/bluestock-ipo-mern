import { model, Schema, type InferSchemaType } from 'mongoose'

const companySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    logo: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
  },
  { timestamps: true },
)

export type Company = InferSchemaType<typeof companySchema>
export const CompanyModel = model('Company', companySchema)
