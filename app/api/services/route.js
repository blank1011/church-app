import connectDB from '@/lib/mongodb'
import Giving from '@/models/Giving'
import Service from '@/models/Service'

export async function GET(request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const query = search
      ? { giverName: { $regex: search, $options: 'i' } }
      : {}

    const givings = await Giving.find(query).sort({ createdAt: -1 })

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
      service: (g.serviceId && serviceMap[g.serviceId.toString()]) ? serviceMap[g.serviceId.toString()] : null
    }))

    return Response.json(result)
  } catch (error) {
    console.error("Error in /api/services:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}