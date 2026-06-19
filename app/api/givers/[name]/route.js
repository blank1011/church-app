import connectDB from '@/lib/mongodb'
import Giving from '@/models/Giving'

export async function PUT(request, { params }) {
  try {
    await connectDB()
    const { name } = params
    const { newName } = await request.json()
    await Giving.updateMany(
      { giverName: decodeURIComponent(name) },
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
    const { name } = params
    await Giving.deleteMany({ giverName: decodeURIComponent(name) })
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}