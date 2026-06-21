import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import { getChurchId } from '@/lib/getChurchId'

const defaultAllocations = {
  pastoralTithe: 10,
  electricBill: 15,
  missionMyanmar: 10,
  conferencePledge: 10,
  fellowship: 10,
}

const settingsSchema = new mongoose.Schema(
  {
    churchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Church',
      required: true,
      unique: true,
      index: true,
    },
    allocations: {
      type: Object,
      default: defaultAllocations,
    },
  },
  { timestamps: true }
)

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema)

function sanitizeAllocations(input = {}) {
  const merged = { ...defaultAllocations, ...input }
  Object.keys(merged).forEach((k) => {
    const n = Number(merged[k])
    merged[k] = Number.isFinite(n) ? n : defaultAllocations[k] || 0
  })
  return merged
}

export async function GET(request) {
  try {
    await connectDB()

    const churchId = getChurchId(request)
    if (!churchId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let settings = await Settings.findOne({ churchId }).lean()

    if (!settings) {
      settings = await Settings.findOneAndUpdate(
        { churchId },
        { churchId, allocations: defaultAllocations },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).lean()
    }

    return Response.json({
      allocations: sanitizeAllocations(settings.allocations),
    })
  } catch (error) {
    console.error('GET settings error:', error)
    return Response.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    await connectDB()

    const churchId = getChurchId(request)
    if (!churchId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const allocations = sanitizeAllocations(body.allocations || {})

    const updated = await Settings.findOneAndUpdate(
      { churchId },
      { $set: { churchId, allocations } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean()

    return Response.json({
      allocations: sanitizeAllocations(updated.allocations),
    })
  } catch (error) {
    console.error('PUT settings error:', error)
    return Response.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
