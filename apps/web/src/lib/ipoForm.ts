export type AdminIpoForm = {
  companyName: string
  companySlug: string
  priceBand: string
  openDate: string
  closeDate: string
  issueSize: string
  issueType: string
  listingDate: string
  status: 'upcoming' | 'ongoing' | 'closed' | 'listed'
  ipoPrice: number | ''
  listingPrice: number | ''
  currentMarketPrice: number | ''
}

export function toAdminFormState(
  ipo?: Partial<{
    _id: string
    company: { name?: string; slug?: string }
    priceBand?: string
    openDate?: string
    closeDate?: string
    issueSize?: string
    issueType?: string
    listingDate?: string
    status?: string
    ipoPrice?: number
    listingPrice?: number
    currentMarketPrice?: number
  }> | null,
): AdminIpoForm {
  return {
    companyName: ipo?.company?.name ?? '',
    companySlug: ipo?.company?.slug ?? '',
    priceBand: ipo?.priceBand ?? '',
    openDate: ipo?.openDate ?? '',
    closeDate: ipo?.closeDate ?? '',
    issueSize: ipo?.issueSize ?? '',
    issueType: ipo?.issueType ?? 'Book Built',
    listingDate: ipo?.listingDate ?? '',
    status: (ipo?.status ?? 'upcoming') as AdminIpoForm['status'],
    ipoPrice: ipo?.ipoPrice ?? '',
    listingPrice: ipo?.listingPrice ?? '',
    currentMarketPrice: ipo?.currentMarketPrice ?? '',
  }
}

export function submitableIpoForm(
  form: AdminIpoForm,
  media: {
    logo?: { url: string; publicId: string }
    rhp?: { url: string; publicId: string }
    drhp?: { url: string; publicId: string }
  } = {},
) {
  const companySlug =
    form.companySlug.trim() ||
    form.companyName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')

  return {
    companyName: form.companyName.trim(),
    companySlug,
    priceBand: form.priceBand.trim(),
    openDate: form.openDate,
    closeDate: form.closeDate,
    issueSize: form.issueSize.trim(),
    issueType: form.issueType.trim() || 'Book Built',
    listingDate: form.listingDate || undefined,
    status: form.status,
    ipoPrice: form.ipoPrice === '' ? undefined : Number(form.ipoPrice),
    listingPrice: form.listingPrice === '' ? undefined : Number(form.listingPrice),
    currentMarketPrice:
      form.currentMarketPrice === '' ? undefined : Number(form.currentMarketPrice),
    ...(media.logo ? { logo: media.logo } : {}),
    ...(media.rhp ? { rhp: media.rhp } : {}),
    ...(media.drhp ? { drhp: media.drhp } : {}),
  }
}
