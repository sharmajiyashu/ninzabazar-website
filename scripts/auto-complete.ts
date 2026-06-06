import nodeCron from 'node-cron'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Custom function to read .env file
const loadEnvFile = () => {
  try {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const envPath = path.resolve(__dirname, '..', '.env')

    const envContent = fs.readFileSync(envPath, 'utf8')
    const envVars = envContent.split('\n')

    envVars.forEach((line) => {
      const matches = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
      if (matches) {
        const key = matches[1]
        let value = matches[2] || ''

        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1)
        }

        process.env[key] = value
      }
    })

    console.log('Environment variables loaded from .env file')
  } catch (error: unknown) {
    console.warn(
      'Error loading .env file, continuing without it:',
      (error as Error).message
    )
  }
}

// Load environment variables
loadEnvFile()

// Validate environment variables
if (!process.env.NEXTAUTH_URL) {
  console.error('NEXTAUTH_URL is not defined in environment variables')
  process.exit(1)
}

if (!process.env.CRON_SECRET_TOKEN) {
  console.error('CRON_SECRET_TOKEN is not defined in environment variables')
  process.exit(1)
}

// Auto-complete status for order items
// Every Wednesday at 9 AM UTC
nodeCron.schedule('0 9 * * 3', async () => {
  console.log('Running weekly auto-complete for delivered orders...')

  try {
    const response = await axios.get(
      `${process.env.NEXTAUTH_URL}/api/orders/cron/auto-complete?token=${process.env.CRON_SECRET_TOKEN}`
    )

    console.log('Auto-complete job result:', response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Auto-complete job failed:', error.message)
      if (error.response) {
        console.error('Response data:', error.response.data)
      }
    } else {
      console.error('Auto-complete job failed with unknown error')
    }
  }
})

// test for auto-complete
// ;(async () => {
console.log('Running initial test of auto-complete orders...')
try {
  const response = await axios.get(
    `${process.env.NEXTAUTH_URL}/api/orders/cron/auto-complete?token=${process.env.CRON_SECRET_TOKEN}`
  )
  console.log('Test auto-complete result:', response.data)
} catch (error) {
  if (axios.isAxiosError(error)) {
    console.error('Test auto-complete failed:', error.message)
    if (error.response) {
      console.error('Response data:', error.response.data)
    }
  } else {
    console.error('Test auto-complete failed with unknown error')
  }
}
// })()
