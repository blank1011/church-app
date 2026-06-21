import connectDB from '@/lib/mongodb'
import Church from '@/models/Church'
import Service from '@/models/Service'
import Giving from '@/models/Giving'
import { getChurchId } from '@/lib/getChurchId'

export async function GET(request) {
  try {
    await connectDB()
    const churchId = getChurchId(request)
    const churchCount = await Church.countDocuments()
    const serviceCount = await Service.countDocuments()
    const givingCount = await Giving.countDocuments()
    const churches = await Church.find({}, { name: 1, slug: 1, isDefault: 1 }).sort({ isDefault: -1, name: 1 })

    const result = {
      connected: true,
      churchIdHeader: churchId || null,
      churchCount,
      serviceCount,
      givingCount,
      churches: churches.map(c => ({ _id: c._id.toString(), name: c.name, slug: c.slug, isDefault: c.isDefault })),
    }

    if (churchId) {
      const church = await Church.findById(churchId)
      if (church) {
        result.currentChurch = { _id: church._id.toString(), name: church.name, slug: church.slug, isDefault: church.isDefault }
      }
      result.givingsForChurch = await Giving.countDocuments({ churchId })
      result.servicesForChurch = await Service.countDocuments({ churchId })
    }

    const sampleGivings = await Giving.find().limit(10).select({ churchId: 1, serviceId: 1, giverName: 1, amount: 1, givingType: 1, createdAt: 1 }).lean()
    const sampleServices = await Service.find().limit(10).select({ churchId: 1, date: 1, serviceType: 1 }).lean()

    result.sampleGivings = sampleGivings.map(g => ({
      ...g,
      _id: g._id?.toString(),
      churchId: g.churchId?.toString(),
      serviceId: g.serviceId?.toString(),
      createdAt: g.createdAt?.toISOString(),
    }))
    result.sampleServices = sampleServices.map(s => ({
      ...s,
      _id: s._id?.toString(),
      churchId: s.churchId?.toString(),
      date: s.date?.toISOString(),
    }))

    return Response.json(result)
  } catch (error) {
    return Response.json({ connected: false, error: error.message }, { status: 500 })
  }
}
