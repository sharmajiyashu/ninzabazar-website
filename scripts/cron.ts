import nodeCron from 'node-cron'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

interface AutoReleaseResponse {
  count: number
  success: boolean
  message?: string
}

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

// Define the auto-release job to run daily at midnight
nodeCron.schedule('0 0 1,30 * *', async () => {
  console.log('Running auto-release for escrow payments (30-day schedule)...')

  try {
    const response = await axios.get(
      `${process.env.NEXTAUTH_URL}/api/payment/cron/GET?token=${process.env.CRON_SECRET_TOKEN}`
    )

    console.log('Escrow release job completed successfully:', response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Escrow release job failed:', error.message)
      if (error.response) {
        console.error('Response data:', error.response.data)
      }
    } else {
      console.error('Escrow release job failed with unknown error')
    }
  }
})

// For the test function - wrapped in an async IIFE(async () => {
console.log('Running initial test of auto-release job...')
try {
  const response = await axios.get(
    `${process.env.NEXTAUTH_URL}/api/payment/cron/GET?token=${process.env.CRON_SECRET_TOKEN}`
  )

  const data = response.data as AutoReleaseResponse
  console.log('Test auto-release completed:', data)
} catch (error) {
  if (axios.isAxiosError(error)) {
    console.error('Test auto-release failed:', error.message)
    if (error.response) {
      console.error('Response data:', error.response.data)
    }
  } else {
    console.error('Test auto-release failed with unknown error')
  }
}

console.log('Escrow payment auto-release cron job scheduled')
