import { PrismaClient } from "@prisma/client";
import { ensureUniqueUsername, slugifyForUsername } from "../src/lib/username";

const prisma = new PrismaClient();

async function main() {
    const usersWithoutUsername = await prisma.user.findMany({
        where: { username: null },
        select: { id: true, name: true, email: true },
    });

    if (usersWithoutUsername.length === 0) {
        console.log("No users need a username. Done.");
        return;
    }

    console.log(`Backfilling usernames for ${usersWithoutUsername.length} user(s)...`);

    for (const user of usersWithoutUsername) {
        const base = slugifyForUsername(user.name) || user.email.split("@")[0];
        const username = await ensureUniqueUsername(prisma, base, user.id);
        await prisma.user.update({
            where: { id: user.id },
            data: { username },
        });
        console.log(`  ${user.email} -> @${username}`);
    }

    console.log("Backfill complete.");
}

main()
    .catch((e) => {
        console.error("Backfill failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
