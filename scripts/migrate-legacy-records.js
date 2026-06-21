import mongoose from 'mongoose'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import connectDB from '../lib/mongodb.js'
import Church from '../models/Church.js'
import Service from '../models/Service.js'
import Giving from '../models/Giving.js'

async function loadEnv() {
  const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '../.env.local')
  const contents = await readFile(envPath, 'utf8')
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [key, ...rest] = trimmed.split('=')
    if (!key) continue
    process.env[key] = rest.join('=').trim().replace(/^"|"$/g, '')
  }
}

async function run() {
  try {
    await loadEnv()
    await connectDB()
    const church = await Church.findOne({ isDefault: true })
    if (!church) {
      throw new Error('Default church not found')
    }

    const services = await Service.find({ churchId: { $exists: false } })
    console.log(`Found ${services.length} services without churchId`)
    for (const service of services) {
      service.churchId = church._id
      await service.save()
    }

    const givings = await Giving.find({ churchId: { $exists: false } })
    console.log(`Found ${givings.length} givings without churchId`)
    for (const giving of givings) {
      giving.churchId = church._id
      await giving.save()
    }

    console.log('Migration complete.')
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

run()
