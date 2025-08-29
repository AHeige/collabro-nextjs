import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Hämta alla projekt
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        milestones: true,
        tasks: true,
      },
    })
    return NextResponse.json(projects)
  } catch (error) {
    return NextResponse.json({ error: 'Could not get the projects' }, { status: 500 })
  }
}

// POST: Skapa nytt projekt
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const newProject = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        ownerId: body.ownerId,
        teamId: body.teamId,
      },
    })
    return NextResponse.json(newProject)
  } catch (error) {
    return NextResponse.json({ error: 'Could not save the project' }, { status: 500 })
  }
}
