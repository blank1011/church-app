import connectDB from '@/lib/mongodb'
import Service from '@/models/Service'

// GET all services
export async function GET() {
  try {
    await connectDB()
    const services = await Service.find().sort({ date: -1 })
    return Response.json(services)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// POST create new service
export async function POST(request) {
  try {
    await connectDB()
    const body = await request.json()
    const service = await Service.create(body)
    return Response.json(service, { status: 201 })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}