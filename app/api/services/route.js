import connectDB from '@/lib/mongodb'
import Service from '@/models/Service'

export async function GET() {
  try {
    await connectDB()
    const services = await Service.find().sort({ date: -1 })
    return Response.json(Array.isArray(services) ? services : [])
  } catch (error) {
    return Response.json([], { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()
    const body = await request.json()

    const startOfDay = new Date(body.date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(body.date)
    endOfDay.setHours(23, 59, 59, 999)

    let service = await Service.findOne({
      serviceType: body.serviceType,
      date: { $gte: startOfDay, $lte: endOfDay }
    })

    if (!service) {
      service = await Service.create(body)
    }

    return Response.json(service, { status: 201 })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    await Service.findByIdAndDelete(id)
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}