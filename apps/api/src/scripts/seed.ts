import 'dotenv/config'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { seedIpos, toSeedDocument } from '../data/seed.js'
import { CompanyModel } from '../models/company.model.js'
import { IpoModel } from '../models/ipo.model.js'

async function seedDatabase() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required to run the seed command.')

  await connectDatabase()
  const companies = new Map<string, string>()

  for (const seed of seedIpos) {
    const { _id: companySeedKey, ...companyData } = seed.company
    const company = await CompanyModel.findOneAndUpdate({ slug: seed.company.slug }, companyData, {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true,
    }).exec()
    companies.set(companySeedKey, String(company._id))
  }

  for (const seed of seedIpos) {
    const document = toSeedDocument(seed)
    const { companySeedKey, ...ipo } = document
    await IpoModel.findOneAndUpdate(
      { seedKey: seed._id },
      { ...ipo, company: companies.get(companySeedKey) },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    ).exec()
  }

  console.log(`Seeded ${seedIpos.length} IPO records and ${companies.size} companies.`)
}

seedDatabase()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(disconnectDatabase)
