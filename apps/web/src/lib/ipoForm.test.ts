import test from 'node:test'
import assert from 'node:assert/strict'

import { toAdminFormState } from './ipoForm.ts'

test('toAdminFormState converts an IPO record into the admin form shape', () => {
  const form = toAdminFormState({
    _id: 'ipo-123',
    company: { name: 'Nova Mobility', slug: 'nova-mobility' },
    status: 'ongoing',
    priceBand: '₹420 - ₹441',
    openDate: '2026-10-05',
    closeDate: '2026-10-07',
    issueSize: '₹1,240 Cr',
    issueType: 'Book Built',
    listingDate: '2026-10-18',
    ipoPrice: 441,
    listingPrice: 468,
    currentMarketPrice: 492,
  })

  assert.deepEqual(form, {
    companyName: 'Nova Mobility',
    companySlug: 'nova-mobility',
    priceBand: '₹420 - ₹441',
    openDate: '2026-10-05',
    closeDate: '2026-10-07',
    issueSize: '₹1,240 Cr',
    issueType: 'Book Built',
    listingDate: '2026-10-18',
    status: 'ongoing',
    ipoPrice: 441,
    listingPrice: 468,
    currentMarketPrice: 492,
  })
})
