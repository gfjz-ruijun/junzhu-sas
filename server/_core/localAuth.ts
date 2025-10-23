import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { COOKIE_NAME } from "@shared/const";
import crypto from "crypto";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// 简单的密码哈希函数
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// 验证密码
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// 生成会话令牌
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function registerLocalAuthRoutes(app: Express) {
  // 登录路由
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: "用户名和密码不能为空" });
        return;
      }

      // 查询用户
      const user = await db.getUserByUsername(username);

      if (!user) {
        res.status(401).json({ error: "用户名或密码错误" });
        return;
      }

      // 验证密码
      if (!verifyPassword(password, user.passwordHash)) {
        res.status(401).json({ error: "用户名或密码错误" });
        return;
      }

      // 更新最后登录时间
      await db.updateUserLastSignedIn(user.id);

      // 生成会话令牌
      const sessionToken = generateSessionToken();

      // 保存会话
      await db.createSession(user.id, sessionToken, ONE_YEAR_MS);

      // 设置Cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("[LocalAuth] Login failed", error);
      res.status(500).json({ error: "登录失败" });
    }
  });

  // 注册路由（可选）
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password, name, email } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: "用户名和密码不能为空" });
        return;
      }

      // 检查用户是否已存在
      const existingUser = await db.getUserByUsername(username);
      if (existingUser) {
        res.status(400).json({ error: "用户名已存在" });
        return;
      }

      // 创建用户
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const passwordHash = hashPassword(password);

      await db.createLocalUser(userId, username, passwordHash, name || null, email || null);

      res.json({
        success: true,
        message: "注册成功",
      });
    } catch (error) {
      console.error("[LocalAuth] Register failed", error);
      res.status(500).json({ error: "注册失败" });
    }
  });

  // 登出路由
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });
}

