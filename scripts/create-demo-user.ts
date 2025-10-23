import crypto from "crypto";
import * as db from "../server/db";

async function createDemoUser() {
  try {
    // 检查用户是否已存在
    const existingUser = await db.getUserByUsername("宫瑞骏");
    if (existingUser) {
      console.log("Demo user already exists");
      return;
    }

    // 创建演示用户
    const userId = `user_demo_${Date.now()}`;
    const passwordHash = crypto
      .createHash("sha256")
      .update("Ma101814559")
      .digest("hex");

    await db.createLocalUser(
      userId,
      "宫瑞骏",
      passwordHash,
      "宫瑞骏",
      "gfjz0326@gmail.com"
    );

    console.log("Demo user created successfully!");
    console.log("Username: 宫瑞骏");
    console.log("Password: Ma101814559");
  } catch (error) {
    console.error("Error creating demo user:", error);
    process.exit(1);
  }
}

createDemoUser();

