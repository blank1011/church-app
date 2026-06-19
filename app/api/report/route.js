import connectDB from '@/lib/mongodb'
import Service from '@/models/Service'
import Giving from '@/models/Giving'

export async function GET(request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month'))
    const year = parseInt(searchParams.get('year'))

    const startOfMonth = new Date(year, month - 1, 1)
    const endOfMonth = new Date(year, month, 0, 23, 59, 59)

    // Get all services for this month
    const services = await Service.find({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ date: 1 })

    // Get all givings for those services
    const serviceIds = services.map(s => s._id)
    const givings = await Giving.find({ serviceId: { $in: serviceIds } })

    // Compute totals
    const tithesOffering = givings
      .filter(g => g.givingType === 'Tithe' || g.givingType === 'Offering')
      .reduce((sum, g) => sum + g.amount, 0)

    const specificMission = givings
      .filter(g => g.givingType === 'Mission')
      .reduce((sum, g) => sum + g.amount, 0)

    const specificElectric = givings
      .filter(g => g.givingType === 'Electric')
      .reduce((sum, g) => sum + g.amount, 0)

    const specificConference = givings
      .filter(g => g.givingType === 'Conference')
      .reduce((sum, g) => sum + g.amount, 0)

    const alloc20 = tithesOffering * 0.2

    // Per service totals
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
      specificMission,
      specificElectric,
      specificConference,
      alloc20,
      serviceCount: services.length,
      uniqueGivers,
      services: serviceSummaries,
      allocations: {
        pastoralTithe: alloc20,
        electricBill: alloc20 + specificElectric,
        missionMyanmar: alloc20 + specificMission,
        conferencePledge: alloc20 + specificConference,
      }
    })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}