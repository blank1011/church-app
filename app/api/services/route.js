import connectDB from '@/lib/mongodb'
import Service from '@/models/Service'
import { getChurchId } from '@/lib/getChurchId'

export async function GET(request) {
  try {
    await connectDB()
    const churchId = getChurchId(request)
    if (!churchId) return Response.json([], { status: 401 })
    const services = await Service.find({ churchId }).sort({ date: -1 })
    return Response.json(Array.isArray(services) ? services : [])
  } catch (error) {
    return Response.json([], { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()
    const churchId = getChurchId(request)
    if (!churchId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()

    const startOfDay = new Date(body.date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(body.date)
    endOfDay.setHours(23, 59, 59, 999)

    let service = await Service.findOne({
      churchId,
      serviceType: body.serviceType,
      date: { $gte: startOfDay, $lte: endOfDay }
    })

    if (!service) {
      service = await Service.create({ churchId, ...body })
    }

    return Response.json(service, { status: 201 })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    await connectDB()
    const churchId = getChurchId(request)
    if (!churchId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    await Service.findOneAndDelete({ _id: id, churchId })
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}