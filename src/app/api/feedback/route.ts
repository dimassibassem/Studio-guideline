import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../prisma/prisma'

export async function POST(req: NextRequest) {
  try {
    const { pathname, response, deviceId } = await req.json()
    // Validate response as boolean (true for "yes", false for "no")
    const isValidResponse = response === 'yes' || response === 'no'

    if (!isValidResponse) {
      return new NextResponse(
        JSON.stringify({
          error: 'Invalid response value. Expected "yes" or "no".',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Check if feedback already exists for the device on the same pathname
    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        device_id: deviceId,
        pathname: pathname,
      },
    })

    if (existingFeedback) {
      return new NextResponse(
        JSON.stringify({
          error: 'You have already submitted feedback for this page.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Save the new feedback
    const feedback = await prisma.feedback.create({
      data: {
        pathname,
        response: response === 'yes',
        device_id: deviceId,
      },
    })

    return new NextResponse(JSON.stringify(feedback), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const errorMessage = 'An unknown error occurred'
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
