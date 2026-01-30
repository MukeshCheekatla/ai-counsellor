import { db } from "../lib/db";
import dotenv from "dotenv";

dotenv.config();

async function testTasks() {
    try {
        console.log("1. Connecting to DB...");
        // 1. Get a user
        const user = await db.user.findFirst();
        if (!user) {
            console.error("No user found to test with. Please sign up first.");
            return;
        }
        console.log(`Testing with user: ${user.email} (${user.id})`);

        // 2. Create a task
        console.log("2. Creating task...");
        const task = await db.task.create({
            data: {
                userId: user.id,
                title: "Test Task via Script",
                description: "Verifying DB connection and schema",
                category: "general",
                priority: "high"
            }
        });
        console.log("✅ Task created:", task.title, task.id);

        // 3. Mark as complete
        console.log("3. Marking task as complete...");
        const updatedTask = await db.task.update({
            where: { id: task.id },
            data: { completed: true }
        });
        console.log("✅ Task updated:", updatedTask.completed ? "COMPLETED" : "FAILED");

        // 4. Verify completion
        if (updatedTask.completed) {
            console.log("SUCCESS: Task workflow verified.");
        } else {
            console.error("FAILURE: Task not marked as complete.");
        }

        // 5. Cleanup
        console.log("4. Cleaning up...");
        await db.task.delete({ where: { id: task.id } });
        console.log("✅ Cleanup done.");

    } catch (error) {
        console.error("Test failed:", error);
    }
}

testTasks();
