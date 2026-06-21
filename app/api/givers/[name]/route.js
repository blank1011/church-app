import connectDB from '@/lib/mongodb'
import Giving from '@/models/Giving'
import { getChurchId } from '@/lib/getChurchId'

export async function PUT(request, { params }) {
  try {
    await connectDB()
    const churchId = getChurchId(request)
    if (!churchId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const { name } = params
    const { newName } = await request.json()
    await Giving.updateMany(
      { churchId, giverName: decodeURIComponent(name) },
      { giverName: newName.trim() }
    )
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB()
    const churchId = getChurchId(request)
    if (!churchId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const { name } = params
    await Giving.deleteMany({ churchId, giverName: decodeURIComponent(name) })
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}