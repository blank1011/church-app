import mongoose from 'mongoose'

const GivingSchema = new mongoose.Schema({
  churchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Church', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  giverName: { type: String, required: true },
  amount: { type: Number, required: true },
  givingType: { type: String, required: true },
}, { timestamps: true })

export default mongoose.models.Giving || mongoose.model('Giving', GivingSchema)