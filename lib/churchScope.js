import Church from '@/models/Church'

export async function ensureDefaultChurch() {
  const existing = await Church.findOne({ isDefault: true })
  if (!existing) {
    await Church.create({
      name: 'Tolosa Church',
      slug: 'tolosa-church',
      accessCode: 'tolosa2024',
      isDefault: true,
    })
  }
}

export function slugifyChurchName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}