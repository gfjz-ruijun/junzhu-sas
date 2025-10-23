import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  username: varchar("username", { length: 255 }), // 本地登录用户名
  passwordHash: varchar("passwordHash", { length: 255 }), // 密码哈希
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 会话表 - 存储用户会话
 */
export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * 学科表 - 存储用户的各个学科
 */
export const subjects = mysqlTable("subjects", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(), // 学科名称，如"数学"、"英语"等
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = typeof subjects.$inferInsert;

/**
 * 考试成绩表 - 存储每次考试的详细信息
 */
export const examRecords = mysqlTable("examRecords", {
  id: varchar("id", { length: 64 }).primaryKey(),
  subjectId: varchar("subjectId", { length: 64 }).notNull(), // 关联学科
  examDate: varchar("examDate", { length: 10 }).notNull(), // 考试日期，格式：YYYY-MM-DD
  examType: mysqlEnum("examType", ["小测", "周测", "月考", "期中考", "期末考", "模拟考", "中考", "高考", "其他"]).notNull(), // 考试类型
  totalScore: int("totalScore").notNull(), // 卷面总分
  actualScore: int("actualScore").notNull(), // 实际得分
  scoreRatio: decimal("scoreRatio", { precision: 5, scale: 4 }).notNull(), // 成绩比值（如0.9500表示95%）
  difficulty: mysqlEnum("difficulty", ["简单", "中等", "困难"]).notNull(), // 难易程度
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type ExamRecord = typeof examRecords.$inferSelect;
export type InsertExamRecord = typeof examRecords.$inferInsert;

/**
 * 考试排名表 - 存储每次考试的班级排名
 */
export const examRankings = mysqlTable("examRankings", {
  id: varchar("id", { length: 64 }).primaryKey(),
  examRecordId: varchar("examRecordId", { length: 64 }).notNull(), // 关联考试记录
  ranking: int("ranking").notNull(), // 班级排名
  totalStudents: int("totalStudents").notNull(), // 班级总人数
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type ExamRanking = typeof examRankings.$inferSelect;
export type InsertExamRanking = typeof examRankings.$inferInsert;
