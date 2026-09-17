import 'dotenv/config';

import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Role } from '../generated/prisma/enums';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting database seeding...');

  // 1. Cleanup existing seed data
  await prisma.message.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany({ where: { email: 'test@lmesh.eu' } });

  // 2. Create seed user
  const hashedPassword = await bcrypt.hash('password', 10);
  const user = await prisma.user.create({
    data: {
      email: 'test@lmesh.eu',
      password: hashedPassword,
      name: 'Senior Lead Designer',
    },
  });

  console.log(`Seed user created: ${user.email} (Password: password)`);

  // 3. Create initial sample automotive design projects
  const project1 = await prisma.project.create({
    data: {
      userId: user.id,
      title: 'Terra Luxury SUV Interior',
      description:
        'Warm earth tones, matte Nappa leather, open-pore walnut wood, and brushed copper metal accents for a flagship electric SUV interior.',
      messages: {
        create: [
          {
            role: Role.USER,
            content:
              'What would be the best sustainable leather alternative for the dashboard wrapping that matches our warm earth tone theme?',
          },
          {
            role: Role.ASSISTANT,
            content:
              'For a warm earth tone luxury SUV, consider **Mycelium-based leather (Fine Mycelium)** or **AppleSkin (bio-based polyurethane from apple peel waste)**. Both offer a smooth, matte finish that pairs exceptionally well with open-pore walnut wood while maintaining a low carbon footprint.',
          },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      userId: user.id,
      title: 'CyberGT Aerodynamic Exterior',
      description:
        'Satin liquid silver paint, exposed satin carbon fibre weave, and anodised electric blue trim highlights for a track-focused GT concept.',
    },
  });

  console.log(
    `Seed projects created: "${project1.title}", "${project2.title}"`,
  );
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
