import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function main() {
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    console.log("Attempting to connect...");
    
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log("Connection successful!");
    console.log("Result:", result);
}

main()
    .catch((e) => {
        console.error("Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
