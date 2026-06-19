import mongoose from 'mongoose'

const GivingSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  giverName: { type: String, required: true },
  amount: { type: Number, required: true },
  givingType: {
    type: String,
    enum: ['Tithe', 'Offering', 'Mission', 'Conference', 'Electric'],
    required: true
  },
}, { timestamps: true })

export default mongoose.models.Giving || mongoose.model('Giving', GivingSchema)