// db.server.ts
import { PrismaClient } from "@prisma/client";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";

// Prevent creating multiple PrismaClient instances in development (HMR)
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient;
}

console.log(process.env.DATABASE_URL);

// Initialize Prisma client
const prisma: PrismaClient = new PrismaClient();

// Initialize Shopify Prisma session storage
const shopifySessionStorage = new PrismaSessionStorage(prisma, {
  // Retry connection in case DB takes a moment to be ready
  connectionRetries: 1,
  connectionRetryIntervalMs: 5000,
  //tableName: "Session", // Optional: uncomment if you use a custom table name
});

// Optional helper function to check session table access (for debugging)
export async function checkSessionTable() {
  try {
    const first = await prisma.session.findFirst();
    console.log("Session table accessible:", first);
  } catch (err) {
    console.error("Error accessing Session table:", err);
  }
}

// Export everything for use in your loaders or server code
export { prisma, shopifySessionStorage };
