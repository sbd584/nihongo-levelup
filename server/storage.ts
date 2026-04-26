import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { checkIns, stats, srsWords, type CheckIn, type InsertCheckIn, type Stats, type SrsWord, type InsertSrsWord } from "@shared/schema";
import { CORE_4000 } from "./wordBank";
const CORE_500 = CORE_4000.slice(0, 500);
import { eq, desc, lte, sql } from "drizzle-orm";

const TURSO_URL = process.env.TURSO_DATABASE_URL!;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN!;

const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });
export const db = drizzle(client);

// Initialize tables (async — called once at startup)
export async function initDb() {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS check_ins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      vocab_learned INTEGER NOT NULL DEFAULT 0,
      vocab_level TEXT NOT NULL DEFAULT 'N5',
      kanji_drilled INTEGER NOT NULL DEFAULT 0,
      kanji_in_context INTEGER NOT NULL DEFAULT 0,
      minutes_studied INTEGER NOT NULL DEFAULT 0,
      session_type TEXT NOT NULL DEFAULT 'morning',
      notes TEXT DEFAULT '',
      comprehension_win TEXT DEFAULT '',
      word_of_day_viewed INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS srs_words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL,
      reading TEXT NOT NULL DEFAULT '',
      meaning TEXT NOT NULL DEFAULT '',
      level TEXT NOT NULL DEFAULT 'N5',
      added_date TEXT NOT NULL,
      next_review TEXT NOT NULL,
      interval INTEGER NOT NULL DEFAULT 1,
      ease_factor REAL NOT NULL DEFAULT 2.5,
      repetitions INTEGER NOT NULL DEFAULT 0,
      last_result TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vocabulary REAL NOT NULL DEFAULT 0,
      kanji REAL NOT NULL DEFAULT 0,
      listening REAL NOT NULL DEFAULT 0,
      reading REAL NOT NULL DEFAULT 0,
      grammar REAL NOT NULL DEFAULT 0,
      consistency REAL NOT NULL DEFAULT 0,
      total_vocab_learned INTEGER NOT NULL DEFAULT 0,
      total_kanji_drilled INTEGER NOT NULL DEFAULT 0,
      total_kanji_in_context INTEGER NOT NULL DEFAULT 0,
      total_minutes_studied INTEGER NOT NULL DEFAULT 0,
      total_srs_reviews INTEGER NOT NULL DEFAULT 0,
      total_comprehension_wins INTEGER NOT NULL DEFAULT 0,
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      last_check_in TEXT DEFAULT ''
    );
  `);

  // Safe column migrations (ignore errors if columns already exist)
  const migrations = [
    "ALTER TABLE stats ADD COLUMN total_kanji_drilled INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE stats ADD COLUMN total_kanji_in_context INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE stats ADD COLUMN total_srs_reviews INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE stats ADD COLUMN total_comprehension_wins INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE check_ins ADD COLUMN vocab_level TEXT NOT NULL DEFAULT 'N5'",
    "ALTER TABLE check_ins ADD COLUMN kanji_drilled INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE check_ins ADD COLUMN kanji_in_context INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE check_ins ADD COLUMN comprehension_win TEXT DEFAULT ''",
    "ALTER TABLE check_ins ADD COLUMN word_of_day_viewed INTEGER NOT NULL DEFAULT 0",
  ];
  for (const m of migrations) {
    try { await client.execute(m); } catch (_) {}
  }

  // Seed initial stats row if empty
  const { rows } = await client.execute("SELECT COUNT(*) as count FROM stats");
  const count = Number((rows[0] as any).count ?? 0);
  if (count === 0) {
    await client.execute(`INSERT INTO stats
      (vocabulary, kanji, listening, reading, grammar, consistency,
       total_vocab_learned, total_kanji_drilled, total_kanji_in_context, total_minutes_studied,
       total_srs_reviews, total_comprehension_wins, current_streak, longest_streak, last_check_in)
      VALUES (0,0,0,0,0,0,0,0,0,0,0,0,0,0,'')`);
  }

  // Auto-seed SRS deck with N5 words if deck is empty
  const { rows: srsRows } = await client.execute("SELECT COUNT(*) as count FROM srs_words");
  const srsCount = Number((srsRows[0] as any).count ?? 0);
  if (srsCount === 0) {
    const today = new Date().toISOString().split("T")[0];
    const n5Words = CORE_500.filter(w => w.level === "N5");
    // Stagger due dates: 15 words per day
    const DAILY = 15;
    for (let i = 0; i < n5Words.length; i++) {
      const w = n5Words[i];
      const daysOffset = Math.floor(i / DAILY);
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + daysOffset);
      const nextReviewStr = nextReview.toISOString().split("T")[0];
      await client.execute({
        sql: `INSERT INTO srs_words (word, reading, meaning, level, added_date, next_review, interval, ease_factor, repetitions, last_result)
              VALUES (?, ?, ?, ?, ?, ?, 1, 2.5, 0, '')`,
        args: [w.word, w.reading, w.meaning, w.level, today, nextReviewStr],
      });
    }
    console.log(`[seed] Auto-seeded ${n5Words.length} N5 words into SRS deck`);
  }
}

// SM-2 spaced repetition algorithm
function sm2(word: SrsWord, result: number): { interval: number; easeFactor: number; repetitions: number } {
  let { interval, easeFactor, repetitions } = word;
  if (result < 2) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 3;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }
  easeFactor = Math.max(1.3, easeFactor + 0.1 - (3 - result) * (0.08 + (3 - result) * 0.02));
  if (result === 3) interval = Math.round(interval * 1.3);
  if (result === 1) interval = Math.max(1, Math.round(interval * 0.8));
  return { interval, easeFactor, repetitions };
}

const levelMultiplier: Record<string, number> = { N5: 1.5, N4: 1.2, N3: 1.0, N2: 0.8, N1: 0.7 };

export interface IStorage {
  getStats(): Promise<Stats | undefined>;
  getCheckIns(): Promise<CheckIn[]>;
  getCheckInByDate(date: string): Promise<CheckIn | undefined>;
  createCheckIn(data: InsertCheckIn): Promise<CheckIn>;
  recalcAndSaveStats(): Promise<Stats>;
  markWotdViewed(date: string): Promise<void>;
  getSrsWords(): Promise<SrsWord[]>;
  getDueSrsWords(): Promise<SrsWord[]>;
  addSrsWord(data: InsertSrsWord): Promise<SrsWord>;
  reviewSrsWord(id: number, result: number): Promise<SrsWord>;
  deleteSrsWord(id: number): Promise<void>;
}

export class Storage implements IStorage {
  async getStats(): Promise<Stats | undefined> {
    return db.select().from(stats).get();
  }

  async getCheckIns(): Promise<CheckIn[]> {
    return db.select().from(checkIns).orderBy(desc(checkIns.date)).all();
  }

  async getCheckInByDate(date: string): Promise<CheckIn | undefined> {
    return db.select().from(checkIns).where(eq(checkIns.date, date)).get();
  }

  async createCheckIn(data: InsertCheckIn): Promise<CheckIn> {
    return db.insert(checkIns).values(data).returning().get();
  }

  async markWotdViewed(date: string): Promise<void> {
    const existing = await this.getCheckInByDate(date);
    if (existing) {
      await client.execute({ sql: "UPDATE check_ins SET word_of_day_viewed = 1 WHERE date = ?", args: [date] });
    } else {
      await client.execute({
        sql: `INSERT INTO check_ins (date, vocab_learned, vocab_level, kanji_drilled, kanji_in_context, minutes_studied, session_type, word_of_day_viewed)
              VALUES (?, 0, 'N5', 0, 0, 0, 'wotd', 1)`,
        args: [date],
      });
    }
  }

  async recalcAndSaveStats(): Promise<Stats> {
    const allCheckIns = await this.getCheckIns();
    const current = (await this.getStats())!;

    const totalVocab = allCheckIns.reduce((s, c) => s + c.vocabLearned * (levelMultiplier[c.vocabLevel] ?? 1.0), 0);
    const rawVocabCount = allCheckIns.reduce((s, c) => s + c.vocabLearned, 0);
    const totalKanjiDrilled = allCheckIns.reduce((s, c) => s + (c.kanjiDrilled ?? 0), 0);
    const totalKanjiInContext = allCheckIns.reduce((s, c) => s + (c.kanjiInContext ?? 0), 0);
    const totalMinutes = allCheckIns.reduce((s, c) => s + c.minutesStudied, 0);
    const totalWins = allCheckIns.filter(c => c.comprehensionWin && c.comprehensionWin.length > 0).length;
    const totalWotd = allCheckIns.reduce((s, c) => s + (c.wordOfDayViewed ?? 0), 0);
    const totalSrs = current.totalSrsReviews ?? 0;

    const vocabularyScore = Math.min(100, (totalVocab * 0.4) + (totalWotd * 0.5));
    const kanjiScore = Math.min(100, (totalKanjiDrilled * 0.8) + (totalKanjiInContext * 1.6));
    const listeningScore = Math.min(100, (totalMinutes / 60) * 6);
    const readingScore = Math.min(100, allCheckIns.length * 1.2 + totalKanjiInContext * 0.5);
    const grammarScore = Math.min(100, Math.floor(rawVocabCount / 40) * 8 + (totalSrs * 0.3));
    const consistencyScore = Math.min(100, current.currentStreak * 3 + allCheckIns.length * 0.4 + totalWins * 2);

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let { currentStreak, longestStreak } = current;
    if (current.lastCheckIn === today) {
      // already logged today
    } else if (current.lastCheckIn === yesterday) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }
    longestStreak = Math.max(longestStreak, currentStreak);

    await client.execute({
      sql: `UPDATE stats SET
        vocabulary=?, kanji=?, listening=?, reading=?, grammar=?, consistency=?,
        total_vocab_learned=?, total_kanji_drilled=?, total_kanji_in_context=?,
        total_minutes_studied=?, total_srs_reviews=?, total_comprehension_wins=?,
        current_streak=?, longest_streak=?, last_check_in=?
        WHERE id=?`,
      args: [
        vocabularyScore, kanjiScore, listeningScore, readingScore, grammarScore, consistencyScore,
        rawVocabCount, totalKanjiDrilled, totalKanjiInContext, totalMinutes,
        totalSrs, totalWins, currentStreak, longestStreak, today, current.id,
      ],
    });

    return (await this.getStats())!;
  }

  async getSrsWords(): Promise<SrsWord[]> {
    return db.select().from(srsWords).orderBy(srsWords.nextReview).all();
  }

  async getDueSrsWords(): Promise<SrsWord[]> {
    const today = new Date().toISOString().split('T')[0];
    return db.select().from(srsWords).where(lte(srsWords.nextReview, today)).all();
  }

  async addSrsWord(data: InsertSrsWord): Promise<SrsWord> {
    return db.insert(srsWords).values(data).returning().get();
  }

  async reviewSrsWord(id: number, result: number): Promise<SrsWord> {
    const word = await db.select().from(srsWords).where(eq(srsWords.id, id)).get();
    if (!word) throw new Error("Word not found");

    const { interval, easeFactor, repetitions } = sm2(word, result);
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    const nextReview = nextDate.toISOString().split('T')[0];
    const resultLabel = ['again', 'hard', 'good', 'easy'][result];

    await client.execute({
      sql: `UPDATE srs_words SET next_review=?, interval=?, ease_factor=?, repetitions=?, last_result=? WHERE id=?`,
      args: [nextReview, interval, easeFactor, repetitions, resultLabel, id],
    });
    await client.execute({ sql: `UPDATE stats SET total_srs_reviews = total_srs_reviews + 1 WHERE id = 1`, args: [] });

    return (await db.select().from(srsWords).where(eq(srsWords.id, id)).get())!;
  }

  async deleteSrsWord(id: number): Promise<void> {
    await db.delete(srsWords).where(eq(srsWords.id, id)).run();
  }
}

export const storage = new Storage();
