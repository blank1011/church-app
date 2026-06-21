import mongoose from 'mongoose'

const ServiceSchema = new mongoose.Schema({
  churchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Church', required: true },
  date: { type: Date, required: true },
  serviceType: {
    type: String,
    enum: ['Sunday AM', 'Sunday PM', 'Wednesday PM'],
    required: true
  },
}, { timestamps: true })

export default mongoose.models.Service || mongoose.model('Service', ServiceSchema)