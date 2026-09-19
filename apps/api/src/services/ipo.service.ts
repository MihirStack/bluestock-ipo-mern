import { Types } from 'mongoose'
import '../models/company.model.js'
import { IpoModel, type Ipo, ipoStatuses } from '../models/ipo.model.js'
import { CompanyModel } from '../models/company.model.js'
import { seedIpos, type SeedIpo } from '../data/seed.js'

export type IpoStatus = (typeof ipoStatuses)[number]
export type IpoInput = {
  companyName: string
  companySlug: string
  priceBand: string
  openDate: string
  closeDate: string
  issueSize: string
  issueType: string
  listingDate?: string
  status: IpoStatus
  ipoPrice?: number
  listingPrice?: number
  currentMarketPrice?: number
  logo?: MediaRef
  rhp?: MediaRef
  drhp?: MediaRef
}
type MediaRef = { url: string; publicId: string }
export type IpoListQuery = {
  page: number
  limit: number
  search?: string
  status?: IpoStatus
  sort: 'openDate' | 'listingDate' | 'company'
  order: 'asc' | 'desc'
}

export function calculatePercentage(current?: number, base?: number) {
  if (current === undefined || base === undefined || base <= 0) return undefined
  return Number((((current - base) / base) * 100).toFixed(2))
}

export function serializeIpo(
  record: SeedIpo | (Ipo & { company: { name: string; slug: string; logo?: unknown } }),
) {
  const ipo = record as SeedIpo & { company: { name: string; slug: string; logo?: unknown } }
  return {
    ...ipo,
    listingGain: calculatePercentage(ipo.listingPrice, ipo.ipoPrice),
    currentReturn: calculatePercentage(ipo.currentMarketPrice, ipo.ipoPrice),
  }
}

export function parseListQuery(query: Record<string, unknown>): IpoListQuery {
  const requestedStatus = typeof query.status === 'string' ? query.status : undefined
  const status = ipoStatuses.includes(requestedStatus as IpoStatus)
    ? (requestedStatus as IpoStatus)
    : undefined
  const page = Math.max(Number(query.page) || 1, 1)
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50)
  const sort = query.sort === 'listingDate' || query.sort === 'company' ? query.sort : 'openDate'
  const order = query.order === 'desc' ? 'desc' : 'asc'
  return {
    page,
    limit,
    search: typeof query.search === 'string' ? query.search.trim().toLowerCase() : undefined,
    status,
    sort,
    order,
  }
}

export async function listIpos(query: IpoListQuery) {
  if (IpoModel.db.readyState === 1) {
    const filter: Record<string, unknown> = query.status ? { status: query.status } : {}
    const records = await IpoModel.find(filter)
      .populate('company', 'name slug logo')
      .sort({ [query.sort]: query.order === 'desc' ? -1 : 1 })
      .lean()
      .exec()
    const serialized = records
      .map((record) => serializeIpo(record as never))
      .filter(
        (record) =>
          !query.search ||
          record.company.name.toLowerCase().includes(query.search) ||
          record.priceBand.toLowerCase().includes(query.search),
      )
    return paginate(serialized, query)
  }

  const filtered = seedIpos.filter(
    (record) =>
      (!query.status || record.status === query.status) &&
      (!query.search ||
        record.company.name.toLowerCase().includes(query.search) ||
        record.priceBand.toLowerCase().includes(query.search)),
  )
  const sorted = [...filtered].sort((left, right) => {
    const leftValue = query.sort === 'company' ? left.company.name : left[query.sort]
    const rightValue = query.sort === 'company' ? right.company.name : right[query.sort]
    return String(leftValue ?? '').localeCompare(String(rightValue ?? ''))
  })
  if (query.order === 'desc') sorted.reverse()
  return paginate(sorted.map(serializeIpo), query)
}

export async function findIpoById(id: string) {
  if (IpoModel.db.readyState === 1 && Types.ObjectId.isValid(id)) {
    const record = await IpoModel.findById(id).populate('company', 'name slug logo').lean().exec()
    return record ? serializeIpo(record as never) : undefined
  }
  const record = seedIpos.find((ipo) => ipo._id === id)
  return record ? serializeIpo(record) : undefined
}

export function validateIpoInput(payload: unknown): { value?: IpoInput; error?: string } {
  const input = payload as Partial<IpoInput>
  const required = [
    'companyName',
    'companySlug',
    'priceBand',
    'openDate',
    'closeDate',
    'issueSize',
    'issueType',
    'status',
  ] as const
  if (required.some((field) => typeof input[field] !== 'string' || !input[field]?.trim()))
    return { error: 'Company, pricing, dates, issue details, and status are required' }
  if (!ipoStatuses.includes(input.status as IpoStatus)) return { error: 'Invalid IPO status' }
  if (Number.isNaN(Date.parse(input.openDate!)) || Number.isNaN(Date.parse(input.closeDate!)))
    return { error: 'Open and close dates must be valid dates' }
  if (input.listingDate && Number.isNaN(Date.parse(input.listingDate)))
    return { error: 'Listing date must be valid' }
  return { value: input as IpoInput }
}

export async function createIpo(input: IpoInput) {
  ensureMongoConnection()
  const company = await CompanyModel.findOneAndUpdate(
    { slug: input.companySlug.trim().toLowerCase() },
    {
      name: input.companyName.trim(),
      slug: input.companySlug.trim().toLowerCase(),
      ...(input.logo ? { logo: input.logo } : {}),
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  ).exec()
  const record = new IpoModel(toIpoDocument(input, company._id as Types.ObjectId))
  await record.save()
  return findIpoById(String(record._id))
}

export async function updateIpo(id: string, input: IpoInput) {
  ensureMongoConnection()
  if (!Types.ObjectId.isValid(id)) return undefined
  const company = await CompanyModel.findOneAndUpdate(
    { slug: input.companySlug.trim().toLowerCase() },
    {
      name: input.companyName.trim(),
      slug: input.companySlug.trim().toLowerCase(),
      ...(input.logo ? { logo: input.logo } : {}),
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  ).exec()
  const record = await IpoModel.findByIdAndUpdate(id, toIpoDocument(input, company._id), {
    returnDocument: 'after',
    runValidators: true,
  }).exec()
  return record ? findIpoById(String(record._id)) : undefined
}

export async function deleteIpo(id: string) {
  ensureMongoConnection()
  if (!Types.ObjectId.isValid(id)) return false
  return Boolean(await IpoModel.findByIdAndDelete(id).exec())
}

function ensureMongoConnection() {
  if (IpoModel.db.readyState !== 1) throw new Error('MongoDB is required for admin IPO mutations.')
}

function toIpoDocument(input: IpoInput, companyId: Types.ObjectId) {
  return {
    company: companyId,
    priceBand: input.priceBand.trim(),
    openDate: new Date(input.openDate),
    closeDate: new Date(input.closeDate),
    issueSize: input.issueSize.trim(),
    issueType: input.issueType.trim(),
    listingDate: input.listingDate ? new Date(input.listingDate) : undefined,
    status: input.status,
    ipoPrice: input.ipoPrice,
    listingPrice: input.listingPrice,
    currentMarketPrice: input.currentMarketPrice,
    ...(input.rhp || input.drhp ? { documents: { rhp: input.rhp, drhp: input.drhp } } : {}),
  }
}

function paginate<T>(records: T[], query: IpoListQuery) {
  const start = (query.page - 1) * query.limit
  return {
    records: records.slice(start, start + query.limit),
    total: records.length,
    page: query.page,
    limit: query.limit,
    totalPages: Math.ceil(records.length / query.limit),
  }
}
