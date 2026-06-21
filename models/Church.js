import mongoose from 'mongoose'

const ChurchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  accessCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.models.Church || mongoose.model('Church', ChurchSchema)