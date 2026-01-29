import { db } from "../lib/db";

async function fixGoogleAccountConflicts() {
    try {
        console.log("🔍 Checking for Google account conflicts...\n");

        // Find all Google accounts
        const googleAccounts = await db.account.findMany({
            where: { provider: "google" },
            include: { user: true }
        });

        if (googleAccounts.length === 0) {
            console.log("✓ No Google accounts found");
            return;
        }

        let fixed = 0;

        for (const account of googleAccounts) {
            const googleEmail = account.user.email;

            // Check if another user with this email exists
            const emailUser = await db.user.findUnique({
                where: { email: googleEmail }
            });

            if (emailUser && emailUser.id !== account.userId) {
                console.log(`❌ Conflict found:`);
                console.log(`   Email: ${googleEmail}`);
                console.log(`   Google account linked to user: ${account.userId}`);
                console.log(`   But email belongs to user: ${emailUser.id}`);

                // Delete the conflicting Google account record
                await db.account.delete({
                    where: {
                        provider_providerAccountId: {
                            provider: account.provider,
                            providerAccountId: account.providerAccountId
                        }
                    }
                });

                console.log(`   ✅ Deleted conflicting Google account record\n`);
                fixed++;
            }
        }

        if (fixed === 0) {
            console.log("✓ No conflicts found - all accounts are properly linked");
        } else {
            console.log(`\n✅ Fixed ${fixed} conflict(s)!`);
            console.log("You can now use Google login - it will link to your existing email account.");
        }
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        process.exit();
    }
}

fixGoogleAccountConflicts();
