import connectDB from '@/lib/mongodb'
import Church from '@/models/Church'
import { ensureDefaultChurch, slugifyChurchName } from '@/lib/churchScope'

function serializeChurch(church) {
  return {
    _id: church._id,
    name: church.name,
    slug: church.slug,
    isDefault: church.isDefault,
  }
}

export async function GET() {
  try {
    await connectDB()
    await ensureDefaultChurch()
    const churches = await Church.find().sort({ isDefault: -1, name: 1 })
    return Response.json(churches.map(serializeChurch))
  } catch (error) {
    console.error('Error in /api/churches GET:', error)
    return Response.json([])
  }
}

export async function POST(request) {
  try {
    await connectDB()
    await ensureDefaultChurch()

    const body = await request.json()
    const name = body.name?.trim()
    const accessCode = body.accessCode?.trim()

    if (!name || !accessCode) {
      return Response.json({ error: 'Church name and access code are required.' }, { status: 400 })
    }

    const baseSlug = slugifyChurchName(name)
    let slug = baseSlug
    let suffix = 2

    while (await Church.findOne({ slug })) {
      slug = `${baseSlug}-${suffix}`
      suffix += 1
    }

    const church = await Church.create({ name, slug, accessCode })
    return Response.json(serializeChurch(church), { status: 201 })
  } catch (error) {
    console.error('Error in /api/churches POST:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
