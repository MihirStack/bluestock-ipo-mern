export type SeedIpo = {
  _id: string
  company: { _id: string; name: string; slug: string; logo: { url: string; publicId: string } }
  priceBand: string
  openDate: string
  closeDate: string
  issueSize: string
  issueType: string
  listingDate?: string
  status: 'upcoming' | 'ongoing' | 'closed' | 'listed'
  ipoPrice?: number
  listingPrice?: number
  currentMarketPrice?: number
  documents: { rhp: { url: string; publicId: string }; drhp: { url: string; publicId: string } }
}

export function toSeedDocument(seed: SeedIpo) {
  const { _id: seedKey, company, ...ipo } = seed
  return { ...ipo, seedKey, companySeedKey: company._id }
}

export const seedIpos: SeedIpo[] = [
  {
    _id: 'seed-nova-mobility',
    company: {
      _id: 'company-nova',
      name: 'Nova Mobility',
      slug: 'nova-mobility',
      logo: { url: '', publicId: '' },
    },
    priceBand: '₹420 - ₹441',
    openDate: '2026-10-05',
    closeDate: '2026-10-07',
    issueSize: '₹1,240 Cr',
    issueType: 'Book Built',
    status: 'upcoming',
    documents: { rhp: { url: '', publicId: '' }, drhp: { url: '', publicId: '' } },
  },
  {
    _id: 'seed-aster-health',
    company: {
      _id: 'company-aster',
      name: 'Aster Health Systems',
      slug: 'aster-health-systems',
      logo: { url: '', publicId: '' },
    },
    priceBand: '₹265 - ₹278',
    openDate: '2026-09-21',
    closeDate: '2026-09-23',
    issueSize: '₹680 Cr',
    issueType: 'Book Built',
    status: 'ongoing',
    documents: { rhp: { url: '', publicId: '' }, drhp: { url: '', publicId: '' } },
  },
  {
    _id: 'seed-orbit-fintech',
    company: {
      _id: 'company-orbit',
      name: 'Orbit Fintech',
      slug: 'orbit-fintech',
      logo: { url: '', publicId: '' },
    },
    priceBand: '₹150 - ₹158',
    openDate: '2026-08-12',
    closeDate: '2026-08-14',
    issueSize: '₹410 Cr',
    issueType: 'Book Built',
    listingDate: '2026-08-22',
    status: 'listed',
    ipoPrice: 158,
    listingPrice: 181,
    currentMarketPrice: 194,
    documents: { rhp: { url: '', publicId: '' }, drhp: { url: '', publicId: '' } },
  },
]
