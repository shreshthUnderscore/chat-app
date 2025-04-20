// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const username = "Shreshth";
  let shreshth = await prisma.user.findUnique({ where: { username } });
  if (!shreshth) {
    const password = await bcrypt.hash("shreshth", 10);
    shreshth = await prisma.user.create({ data: { username, password } });
    console.log("Created default user Shreshth");
  } else {
    console.log("User Shreshth exists");
  }
}

main().finally(() => prisma.$disconnect());
