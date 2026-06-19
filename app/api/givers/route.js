import connectDB from '@/lib/mongodb'
import Giving from '@/models/Giving'

export async function GET() {
  try {
    await connectDB()
    const givers = await Giving.distinct('giverName')
    return Response.json(givers.sort())
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}