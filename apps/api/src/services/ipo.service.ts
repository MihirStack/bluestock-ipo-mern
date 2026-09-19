import { Types } from 'mongoose'
import '../models/company.model.js'
import { IpoModel, type Ipo, ipoStatuses } from '../models/ipo.model.js'
import { seedIpos, type SeedIpo } from '../data/seed.js'

export type IpoStatus = (typeof ipoStatuses)[number]
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
