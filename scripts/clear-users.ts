import { db } from "../lib/db";

async function clearUsers() {
    try {
        // Delete in order: sessions, accounts, profiles, users
        await db.session.deleteMany({});
        console.log("✓ Cleared sessions");

        await db.account.deleteMany({});
        console.log("✓ Cleared accounts");

        await db.userProfile.deleteMany({});
        console.log("✓ Cleared user profiles");

        await db.user.deleteMany({});
        console.log("✓ Cleared users");

        console.log("\n✅ Database cleared successfully!");
        console.log("You can now sign up fresh or use Google login.");
    } catch (error) {
        console.error("❌ Error clearing database:", error);
    } finally {
        process.exit();
    }
}

clearUsers();
