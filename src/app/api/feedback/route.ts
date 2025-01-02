import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../prisma/prisma'

export async function POST(req: NextRequest) {
  try {
    const { pathname, response, deviceId } = await req.json()

    // Validate response as boolean ("yes" for true, "no" for false)
    if (response !== 'yes' && response !== 'no') {
      return jsonResponse(
        { error: 'Invalid response value. Expected "yes" or "no".' },
        400,
      )
    }

    const responseValue = response === 'yes'

    // Check if feedback already exists
    const existingFeedback = await prisma.feedback
      .findFirst({
        where: {
          device_id: deviceId,
          pathname,
        },
      })
      .catch(() => null) // Handle any unexpected errors gracefully

    if (existingFeedback) {
      return jsonResponse(
        { error: 'You have already submitted feedback for this page.' },
        400,
      )
    }

    // Save the new feedback
    await prisma.feedback.create({
      data: {
        pathname,
        response: responseValue,
        device_id: deviceId,
      },
    })

    // Calculate percentage of "true" responses
    const [totalResponses, trueResponses] = await Promise.all([
      prisma.feedback.count({ where: { pathname } }),
      prisma.feedback.count({
        where: { pathname, response: true },
      }),
    ])

    const percentageTrue =
      totalResponses > 0 ? (trueResponses / totalResponses) * 100 : 0

    return jsonResponse({ isHelpfulPercentage: percentageTrue.toFixed(2) }, 200)
  } catch (error) {
    console.error('Error processing feedback:', error)
    return jsonResponse(
      { error: 'An error occurred while processing your request.' },
      500,
    )
  }
}

// Helper function for JSON responses
function jsonResponse(data: object, status: number) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
