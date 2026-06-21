import connectDB from '@/lib/mongodb'
import Giving from '@/models/Giving'
import Service from '@/models/Service'
import { getChurchId } from '@/lib/getChurchId'

export async function GET(request) {
  try {
    await connectDB()
    const churchId = getChurchId(request)
    if (!churchId) return Response.json([], { status: 401 })
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    let query = { churchId }
    if (search) query.giverName = { $regex: search, $options: 'i' }

    let givings = await Giving.find(query).sort({ createdAt: -1 })
    if (churchId && givings.length === 0) {
      // Fallback for legacy or imported records that are not tagged with the current church
      const fallbackQuery = { churchId, ...(search && { giverName: { $regex: search, $options: 'i' } }) }
      givings = await Giving.find(fallbackQuery).sort({ createdAt: -1 })
    }

    const serviceIds = [...new Set(givings.map(g => g.serviceId?.toString()).filter(Boolean))]
    const services = await Service.find({ _id: { $in: serviceIds } })
    const serviceMap = {}
    services.forEach(s => { serviceMap[s._id.toString()] = s })

    const result = givings.map(g => ({
      _id: g._id,
      giverName: g.giverName,
      amount: g.amount,
      givingType: g.givingType,
      createdAt: g.createdAt,
      service: g.serviceId && serviceMap[g.serviceId.toString()] ? serviceMap[g.serviceId.toString()] : null
    }))

    return Response.json(result)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}