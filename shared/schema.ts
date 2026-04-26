import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Daily check-in sessions
export const checkIns = sqliteTable("check_ins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(), // YYYY-MM-DD
  vocabLearned: integer("vocab_learned").notNull().default(0),
  vocabLevel: text("vocab_level").notNull().default("N5"), // N5/N4/N3/N2/N1
  kanjiDrilled: integer("kanji_drilled").notNull().default(0),       // isolated kanji study
  kanjiInContext: integer("kanji_in_context").notNull().default(0),   // kanji encountered while reading
  minutesStudied: integer("minutes_studied").notNull().default(0),
  sessionType: text("session_type").notNull().default("morning"), // "morning" | "evening"
  notes: text("notes").default(""),
  comprehensionWin: text("comprehension_win").default(""), // qualitative win
  wordOfDayViewed: integer("word_of_day_viewed").notNull().default(0), // 0 or 1
});

// SRS flashcard words
export const srsWords = sqliteTable("srs_words", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  word: text("word").notNull(),
  reading: text("reading").notNull().default(""),
  meaning: text("meaning").notNull().default(""),
  level: text("level").notNull().default("N5"),
  addedDate: text("added_date").notNull(), // YYYY-MM-DD
  nextReview: text("next_review").notNull(), // YYYY-MM-DD
  interval: integer("interval").notNull().default(1), // days until next review
  easeFactor: real("ease_factor").notNull().default(2.5),
  repetitions: integer("repetitions").notNull().default(0),
  lastResult: text("last_result").default(""), // "again"|"hard"|"good"|"easy"
});

// Persistent stats/scores
export const stats = sqliteTable("stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  vocabulary: real("vocabulary").notNull().default(0),
  kanji: real("kanji").notNull().default(0),
  listening: real("listening").notNull().default(0),
  reading: real("reading").notNull().default(0),
  grammar: real("grammar").notNull().default(0),
  consistency: real("consistency").notNull().default(0),
  totalVocabLearned: integer("total_vocab_learned").notNull().default(0),
  totalKanjiDrilled: integer("total_kanji_drilled").notNull().default(0),
  totalKanjiInContext: integer("total_kanji_in_context").notNull().default(0),
  totalMinutesStudied: integer("total_minutes_studied").notNull().default(0),
  totalSrsReviews: integer("total_srs_reviews").notNull().default(0),
  totalComprehensionWins: integer("total_comprehension_wins").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastCheckIn: text("last_check_in").default(""),
});

export const insertCheckInSchema = createInsertSchema(checkIns).omit({ id: true });
export const insertSrsWordSchema = createInsertSchema(srsWords).omit({ id: true });
export const insertStatsSchema = createInsertSchema(stats).omit({ id: true });

export type CheckIn = typeof checkIns.$inferSelect;
export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
export type SrsWord = typeof srsWords.$inferSelect;
export type InsertSrsWord = z.infer<typeof insertSrsWordSchema>;
export type Stats = typeof stats.$inferSelect;
export type InsertStats = z.infer<typeof insertStatsSchema>;
