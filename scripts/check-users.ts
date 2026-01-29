import { db } from "../lib/db";

async function checkUsers() {
    try {
        const users = await db.user.findMany({
            include: {
                accounts: true,
                profile: true
            }
        });
        console.log("USERS IN DB:");
        console.log(JSON.stringify(users, null, 2));
    } catch (error) {
        console.error("Error fetching users:", error);
    } finally {
        process.exit();
    }
}

checkUsers();
