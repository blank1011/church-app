import connectDB from '@/lib/mongodb'
import Service from '@/models/Service'
import Giving from '@/models/Giving'

export async function GET(request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month'))
    const year = parseInt(searchParams.get('year'))

    // Use loose date range to handle timezone differences
    const startOfMonth = new Date(year, month - 1, 1)
    startOfMonth.setHours(0, 0, 0, 0)
    const endOfMonth = new Date(year, month, 0)
    endOfMonth.setHours(23, 59, 59, 999)

    const services = await Service.find({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ date: 1 })

    const serviceIds = services.map(s => s._id)
    const givings = await Giving.find({ serviceId: { $in: serviceIds } })

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
      const total = serviceGivings.reduce((sum, g) => sum + g.amount, 0)
      return {
        _id: s._id,
        date: s.date,
        serviceType: s.serviceType,
        total,
        entryCount: serviceGivings.length
      }
    })

    const uniqueGivers = [...new Set(givings.map(g => g.giverName))].length

    return Response.json({
      tithesOffering,
      specificByType,
      serviceCount: services.length,
      uniqueGivers,
      services: serviceSummaries,
    })
  } catch (error) {
    console.error('Error in /api/report:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}