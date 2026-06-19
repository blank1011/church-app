import mongoose from 'mongoose'

const ServiceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  serviceType: { 
    type: String, 
    enum: ['Sunday AM', 'Sunday PM', 'Wednesday PM'],
    required: true 
  },
}, { timestamps: true })

export default mongoose.models.Service || mongoose.model('Service', ServiceSchema)