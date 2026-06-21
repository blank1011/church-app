import connectDB from '@/lib/mongodb'
import Service from '@/models/Service'
import Giving from '@/models/Giving'
import { getChurchId } from '@/lib/getChurchId'

export async function GET(request) {
  try {
    await connectDB()
    const churchId = getChurchId(request)
    if (!churchId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month'))
    const year = parseInt(searchParams.get('year'))

    const startOfMonth = new Date(year, month - 1, 1)
    startOfMonth.setHours(0, 0, 0, 0)
    const endOfMonth = new Date(year, month, 0)
    endOfMonth.setHours(23, 59, 59, 999)

    let services = await Service.find({
      churchId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ date: 1 })

    if (churchId && services.length === 0) {
      // Fallback for legacy or imported records that are not tagged with the current church
      services = await Service.find({ churchId, date: { $gte: startOfMonth, $lte: endOfMonth } }).sort({ date: 1 })
    }

    const serviceIds = services.map(s => s._id)
    let givings = await Giving.find({ churchId, serviceId: { $in: serviceIds } })
    if (churchId && serviceIds.length > 0 && givings.length === 0) {
      // Fallback to any givings for the selected services when church linkage is missing
      const allGivings = await Giving.find({ churchId, serviceId: { $in: serviceIds } })
      if (allGivings.length > 0) {
        givings.splice(0, givings.length, ...allGivings)
      }
    }

    const tithesOffering = givings
      .filter(g => g.givingType === 'Tithe' || g.givingType === 'Offering')
      .reduce((sum, g) => sum + g.amount, 0)

    const specificByType = {}
    givings.forEach(g => {
      if (g.givingType !== 'Tithe' && g.givingType !== 'Offering') {
        const key = g.givingType.toLowerCase().replace(/\s+/g, '_')
        specificByType[key] = (specificByType[key] || 0) + g.amount
      }
    })

    const serviceSummaries = services.map(s => {
      const serviceGivings = givings.filter(g => g.serviceId.toString() === s._id.toString())
      return {
        _id: s._id,
        date: s.date,
        serviceType: s.serviceType,
        total: serviceGivings.reduce((sum, g) => sum + g.amount, 0),
        entryCount: serviceGivings.length
      }
    })

    return Response.json({
      tithesOffering,
      specificByType,
      serviceCount: services.length,
      uniqueGivers: [...new Set(givings.map(g => g.giverName))].length,
      services: serviceSummaries,
    })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}