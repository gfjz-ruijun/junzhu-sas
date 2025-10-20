import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createSubject,
  getUserSubjects,
  deleteSubject,
  createExamRecord,
  getSubjectExamRecords,
  deleteExamRecord,
  updateExamRecord,
  createExamRanking,
  getExamRanking,
  updateExamRanking,
  deleteExamRanking,
} from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // 学科管理路由
  subjects: router({
    // 获取用户的所有学科
    list: protectedProcedure.query(({ ctx }) =>
      getUserSubjects(ctx.user.id)
    ),
    // 创建新学科
    create: protectedProcedure
      .input(z.object({ name: z.string().min(1, "学科名称不能为空") }))
      .mutation(({ ctx, input }) =>
        createSubject(ctx.user.id, input.name)
      ),
    // 删除学科
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(({ input }) => deleteSubject(input.id)),
  }),

  // 考试成绩管理路由
  examRecords: router({
    // 获取某学科的所有考试记录
    list: protectedProcedure
      .input(z.object({ subjectId: z.string() }))
      .query(({ input }) => getSubjectExamRecords(input.subjectId)),
    // 创建新考试记录
    create: protectedProcedure
      .input(
        z.object({
          subjectId: z.string(),
          examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式应为YYYY-MM-DD"),
          examType: z.enum(["小测", "周测", "月考", "期中考", "期末考", "模拟考", "中考", "高考", "其他"]),
          totalScore: z.number().positive("卷面总分必须大于0"),
          actualScore: z.number().nonnegative("实际得分不能为负"),
          difficulty: z.enum(["简单", "中等", "困难"]),
        })
      )
      .mutation(({ input }) =>
        createExamRecord(
          input.subjectId,
          input.examDate,
          input.examType,
          input.totalScore,
          input.actualScore,
          input.difficulty
        )
      ),
    // 删除考试记录
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(({ input }) => deleteExamRecord(input.id)),
    // 更新考试记录
    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式应为YYYY-MM-DD"),
          examType: z.enum(["小测", "周测", "月考", "期中考", "期末考", "模拟考", "中考", "高考", "其他"]),
          totalScore: z.number().positive("卷面总分必须大于0"),
          actualScore: z.number().nonnegative("实际得分不能为负"),
          difficulty: z.enum(["简单", "中等", "困难"]),
        })
      )
      .mutation(({ input }) =>
        updateExamRecord(
          input.id,
          input.examDate,
          input.examType,
          input.totalScore,
          input.actualScore,
          input.difficulty
        )
      ),
  }),

  // 考试排名管理路由
  examRankings: router({
    // 获取某次考试的排名
    get: protectedProcedure
      .input(z.object({ examRecordId: z.string() }))
      .query(({ input }) => getExamRanking(input.examRecordId)),
    // 创建或更新排名
    upsert: protectedProcedure
      .input(
        z.object({
          examRecordId: z.string(),
          ranking: z.number().positive("排名必须大于0"),
          totalStudents: z.number().positive("班级总人数必须大于0"),
        })
      )
      .mutation(({ input }) =>
        updateExamRanking(
          input.examRecordId,
          input.ranking,
          input.totalStudents
        )
      ),
    // 删除排名
    delete: protectedProcedure
      .input(z.object({ examRecordId: z.string() }))
      .mutation(({ input }) => deleteExamRanking(input.examRecordId)),
  }),
});

export type AppRouter = typeof appRouter;

