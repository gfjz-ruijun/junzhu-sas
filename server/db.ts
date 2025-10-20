import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, subjects, examRecords, examRankings } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== Subject Queries =====
export async function createSubject(userId: string, name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `subject_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(subjects).values({ id, userId, name });
  return id;
}

export async function getUserSubjects(userId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(subjects).where(eq(subjects.userId, userId));
}

export async function deleteSubject(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(subjects).where(eq(subjects.id, id));
}

// ===== Exam Record Queries =====
export async function createExamRecord(
  subjectId: string,
  examDate: string,
  examType: "小测" | "周测" | "月考" | "期中考" | "期末考" | "模拟考" | "中考" | "高考" | "其他",
  totalScore: number,
  actualScore: number,
  difficulty: "简单" | "中等" | "困难"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const scoreRatio = (actualScore / totalScore).toFixed(4);
  const id = `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await db.insert(examRecords).values({
    id,
    subjectId,
    examDate,
    examType,
    totalScore,
    actualScore,
    scoreRatio: scoreRatio as any,
    difficulty,
  });
  
  return id;
}

export async function getSubjectExamRecords(subjectId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(examRecords)
    .where(eq(examRecords.subjectId, subjectId))
    .orderBy(examRecords.examDate);
}

export async function deleteExamRecord(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(examRecords).where(eq(examRecords.id, id));
}

export async function updateExamRecord(
  id: string,
  examDate: string,
  examType: "小测" | "周测" | "月考" | "期中考" | "期末考" | "模拟考" | "中考" | "高考" | "其他",
  totalScore: number,
  actualScore: number,
  difficulty: "简单" | "中等" | "困难"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const scoreRatio = (actualScore / totalScore).toFixed(4);
  
  await db
    .update(examRecords)
    .set({
      examDate,
      examType,
      totalScore,
      actualScore,
      scoreRatio: scoreRatio as any,
      difficulty,
      updatedAt: new Date(),
    })
    .where(eq(examRecords.id, id));
}


// ===== Exam Ranking Queries =====
export async function createExamRanking(
  examRecordId: string,
  ranking: number,
  totalStudents: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `ranking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await db.insert(examRankings).values({
    id,
    examRecordId,
    ranking,
    totalStudents,
  });
  
  return id;
}

export async function getExamRanking(examRecordId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(examRankings)
    .where(eq(examRankings.examRecordId, examRecordId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updateExamRanking(
  examRecordId: string,
  ranking: number,
  totalStudents: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getExamRanking(examRecordId);
  
  if (existing) {
    await db
      .update(examRankings)
      .set({
        ranking,
        totalStudents,
        updatedAt: new Date(),
      })
      .where(eq(examRankings.examRecordId, examRecordId));
  } else {
    await createExamRanking(examRecordId, ranking, totalStudents);
  }
}

export async function deleteExamRanking(examRecordId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(examRankings)
    .where(eq(examRankings.examRecordId, examRecordId));
}

