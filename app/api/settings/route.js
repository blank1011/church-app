import connectDB from '@/lib/mongodb'
import mongoose from 'mongoose'

const SettingsSchema = new mongoose.Schema({
  churchName: { type: String, default: 'Tolosa Church' },
  allocations: { type: Map, of: Number, default: {
    pastoralTithe: 20,
    electricBill: 20,
    missionMyanmar: 20,
    conferencePledge: 20,
  }},
  accentColor: { type: String, default: '#185FA5' },
}, { timestamps: true })

const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema)

export async function GET() {
  try {
    await connectDB()
    let settings = await Settings.findOne()
    if (!settings) settings = await Settings.create({})
    return Response.json({
      _id: settings._id,
      churchName: settings.churchName,
      accentColor: settings.accentColor,
      allocations: Object.fromEntries(settings.allocations),
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    await connectDB()
    const body = await request.json()
    const settings = await Settings.findOneAndUpdate(
      {},
      {
        churchName: body.churchName,
        allocations: body.allocations,
        accentColor: body.accentColor,
      },
      { new: true, upsert: true }
    )
    return Response.json({
      _id: settings._id,
      churchName: settings.churchName,
      accentColor: settings.accentColor,
      allocations: Object.fromEntries(settings.allocations),
    })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}