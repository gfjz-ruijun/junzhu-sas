import axios from "axios";
import { Express } from "express";
import { SignJWT } from "jose";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { upsertUser } from "../db";
import { ENV } from "./env";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || "http://localhost:3000/api/github/callback";

const JWT_SECRET = new TextEncoder().encode(ENV.jwtSecret);

export function registerGitHubAuthRoutes(app: Express) {
  // GitHub登录重定向
  app.get("/api/github/login", (req, res) => {
    const scope = "user:email";
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=${scope}`;
    res.redirect(redirectUrl);
  });

  // GitHub回调处理
  app.get("/api/github/callback", async (req, res) => {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Missing authorization code" });
    }

    try {
      // 交换code获取access token
      const tokenResponse = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code: code as string,
          redirect_uri: GITHUB_REDIRECT_URI,
        },
        {
          headers: { Accept: "application/json" },
        }
      );

      const { access_token } = tokenResponse.data;

      if (!access_token) {
        return res.status(400).json({ error: "Failed to get access token" });
      }

      // 获取用户信息
      const userResponse = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const githubUser = userResponse.data;

      // 获取用户邮箱
      let email = githubUser.email;
      if (!email) {
        const emailResponse = await axios.get("https://api.github.com/user/emails", {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        const primaryEmail = emailResponse.data.find((e: any) => e.primary);
        email = primaryEmail?.email || `${githubUser.login}@github.com`;
      }

      // 保存或更新用户
      const userId = `github_${githubUser.id}`;
      await upsertUser({
        id: userId,
        name: githubUser.name || githubUser.login,
        email: email,
        loginMethod: "github",
        lastSignedIn: new Date(),
      });

      // 创建JWT token
      const token = await new SignJWT({
        userId,
        githubId: githubUser.id,
        login: githubUser.login,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1y")
        .sign(JWT_SECRET);

      // 设置cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      // 重定向到首页
      res.redirect("/");
    } catch (error) {
      console.error("[GitHub Auth] Error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // GitHub登出
  app.post("/api/github/logout", (req, res) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });
}

