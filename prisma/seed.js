// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // TEAM ROLES
  await prisma.role.upsert({
    where: { name_scope: { name: 'TeamOwner', scope: 'TEAM' } },
    update: {},
    create: {
      name: 'TeamOwner',
      scope: 'TEAM',
      permissions: {
        create: [
          { entity: 'Team', canCreate: true, canRead: true, canUpdate: true, canDelete: true },
          { entity: 'Project', canCreate: true, canRead: true, canUpdate: true, canDelete: true },
        ],
      },
    },
  })

  await prisma.role.upsert({
    where: { name_scope: { name: 'TeamAdmin', scope: 'TEAM' } },
    update: {},
    create: {
      name: 'TeamAdmin',
      scope: 'TEAM',
      permissions: {
        create: [
          { entity: 'Team', canRead: true, canUpdate: true },
          { entity: 'Project', canCreate: true, canRead: true, canUpdate: true },
        ],
      },
    },
  })

  await prisma.role.upsert({
    where: { name_scope: { name: 'TeamMember', scope: 'TEAM' } },
    update: {},
    create: {
      name: 'TeamMember',
      scope: 'TEAM',
      permissions: {
        create: [
          { entity: 'Team', canRead: true },
          { entity: 'Project', canRead: true },
        ],
      },
    },
  })

  // PROJECT ROLES
  await prisma.role.upsert({
    where: { name_scope: { name: 'ProjectOwner', scope: 'PROJECT' } },
    update: {},
    create: {
      name: 'ProjectOwner',
      scope: 'PROJECT',
      permissions: {
        create: [
          { entity: 'Project', canCreate: true, canRead: true, canUpdate: true, canDelete: true },
          { entity: 'Task', canCreate: true, canRead: true, canUpdate: true, canDelete: true },
          { entity: 'Milestone', canCreate: true, canRead: true, canUpdate: true, canDelete: true },
        ],
      },
    },
  })

  await prisma.role.upsert({
    where: { name_scope: { name: 'ProjectAdmin', scope: 'PROJECT' } },
    update: {},
    create: {
      name: 'ProjectAdmin',
      scope: 'PROJECT',
      permissions: {
        create: [
          { entity: 'Project', canRead: true, canUpdate: true },
          { entity: 'Task', canCreate: true, canRead: true, canUpdate: true, canDelete: true },
          { entity: 'Milestone', canCreate: true, canRead: true, canUpdate: true, canDelete: true },
        ],
      },
    },
  })

  await prisma.role.upsert({
    where: { name_scope: { name: 'ProjectMember', scope: 'PROJECT' } },
    update: {},
    create: {
      name: 'ProjectMember',
      scope: 'PROJECT',
      permissions: {
        create: [
          { entity: 'Project', canRead: true },
          { entity: 'Task', canCreate: true, canRead: true, canUpdate: true },
          { entity: 'Milestone', canRead: true },
        ],
      },
    },
  })

  await prisma.role.upsert({
    where: { name_scope: { name: 'ProjectViewer', scope: 'PROJECT' } },
    update: {},
    create: {
      name: 'ProjectViewer',
      scope: 'PROJECT',
      permissions: {
        create: [
          { entity: 'Project', canRead: true },
          { entity: 'Task', canRead: true },
          { entity: 'Milestone', canRead: true },
        ],
      },
    },
  })

  console.log('✅ Seed complete: roles and permissions created')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
