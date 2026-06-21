import connectDB from '@/lib/mongodb'
import Giving from '@/models/Giving'
import { getChurchId } from '@/lib/getChurchId'

export async function GET(request) {
  try {
    await connectDB()
    const churchId = getChurchId(request)
    if (!churchId) return Response.json([], { status: 401 })
    const givers = await Giving.distinct('giverName', { churchId })
    return Response.json(givers.sort())
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}