const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();
  try {
    const [,, email, name, password] = process.argv;
    if (!email || !name || !password) {
      console.error('Usage: node scripts/create-user.js email name password [--admin]');
      process.exit(1);
    }

    const role = process.argv.includes('--admin') ? 'admin' : 'user';
    const hashed = await bcrypt.hash(password, 12);

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      console.log('User exists, updating role and status...');
      await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { name, role, isActive: true }
      });
      console.log('Updated existing user.');
    } else {
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashed,
          name,
          role,
          isActive: true,
        }
      });
      console.log('Created user:', user.email, 'role=', role);
    }

    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
    process.exit(2);
  }
}

main();
