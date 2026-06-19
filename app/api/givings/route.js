import connectDB from '@/lib/mongodb'
import Giving from '@/models/Giving'

export async function GET(request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')
    const query = serviceId ? { serviceId } : {}
    const givings = await Giving.find(query).sort({ createdAt: -1 })
    return Response.json(givings)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()
    const body = await request.json()
    const giving = await Giving.create(body)
    return Response.json(giving, { status: 201 })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const serviceId = searchParams.get('serviceId')
    if (id) await Giving.findByIdAndDelete(id)
    if (serviceId) await Giving.deleteMany({ serviceId })
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}