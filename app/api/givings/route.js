import connectDB from '@/lib/mongodb'
import Giving from '@/models/Giving'
import { getChurchId } from '@/lib/getChurchId'

export async function GET(request) {
  try {
    await connectDB()
    const churchId = getChurchId(request)
    if (!churchId) return Response.json([], { status: 401 })
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')
    const query = serviceId ? { churchId, serviceId } : { churchId }
    const givings = await Giving.find(query).sort({ createdAt: -1 })
    return Response.json(givings)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()
    const churchId = getChurchId(request)
    if (!churchId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const giving = await Giving.create({ churchId, ...body })
    return Response.json(giving, { status: 201 })
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
    const serviceId = searchParams.get('serviceId')
    if (id) await Giving.findOneAndDelete({ _id: id, churchId })
    if (serviceId) await Giving.deleteMany({ serviceId, churchId })
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}