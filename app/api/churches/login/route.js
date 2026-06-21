import connectDB from '@/lib/mongodb'
import Church from '@/models/Church'
import { ensureDefaultChurch } from '@/lib/churchScope'

function serializeChurch(church) {
  return {
    _id: church._id,
    name: church.name,
    slug: church.slug,
    isDefault: church.isDefault,
  }
}

export async function POST(request) {
  try {
    await connectDB()
    await ensureDefaultChurch()

    const body = await request.json()
    const churchId = body.churchId
    const accessCode = body.accessCode?.trim()

    const church = await Church.findById(churchId)
    if (!church || church.accessCode !== accessCode) {
      return Response.json({ error: 'Invalid church or access code.' }, { status: 401 })
    }

    return Response.json(serializeChurch(church))
  } catch (error) {
    console.error('Error in /api/churches/login:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
