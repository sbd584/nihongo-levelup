import type { Express } from "express";
import { Server } from "http";
import { storage } from "./storage";
import { insertCheckInSchema } from "@shared/schema";
import { z } from "zod";
import { CORE_4000 } from "./wordBank";
import { PASSAGES } from "./passages";
const CORE_500 = CORE_4000.slice(0, 500);

function getTodayWord() {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const w = CORE_500[dayOfYear % CORE_500.length];
  return { word: w.word, reading: w.reading, romaji: w.romaji, meaning: w.meaning, example: w.example, exampleEn: w.exampleEn, level: w.level };
}

export function registerRoutes(httpServer: Server, app: Express) {
  // GET /api/stats
  app.get("/api/stats", async (_req, res) => {
    const s = await storage.getStats();
    res.json(s || {});
  });

  // GET /api/checkins
  app.get("/api/checkins", async (_req, res) => {
    res.json(await storage.getCheckIns());
  });

  // GET /api/checkin/today
  app.get("/api/checkin/today", async (_req, res) => {
    const today = new Date().toISOString().split('T')[0];
    res.json((await storage.getCheckInByDate(today)) || null);
  });

  // GET /api/word-of-day
  app.get("/api/word-of-day", (_req, res) => {
    res.json(getTodayWord());
  });

  // POST /api/wotd-viewed
  app.post("/api/wotd-viewed", async (_req, res) => {
    const today = new Date().toISOString().split('T')[0];
    await storage.markWotdViewed(today);
    const updatedStats = await storage.recalcAndSaveStats();
    res.json({ ok: true, stats: updatedStats });
  });

  // POST /api/checkin
  app.post("/api/checkin", async (req, res) => {
    const parsed = insertCheckInSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const checkin = await storage.createCheckIn(parsed.data);
    const updatedStats = await storage.recalcAndSaveStats();
    res.json({ checkin, stats: updatedStats });
  });

  // GET /api/core-words
  app.get("/api/core-words", (req, res) => {
    const lvl = req.query.level as string | undefined;
    const list = lvl ? CORE_4000.filter(w => w.level === lvl) : CORE_4000;
    res.json(list);
  });

  // POST /api/srs/bulk-add
  app.post("/api/srs/bulk-add", async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const schema = z.object({
      words: z.array(z.object({
        word: z.string().min(1),
        reading: z.string().default(""),
        meaning: z.string().default(""),
        level: z.enum(["N5","N4","N3","N2","N1"]).default("N5"),
      })).min(1).max(500),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const existing = (await storage.getSrsWords()).map(w => w.word);
    const toAdd = parsed.data.words.filter(w => !existing.includes(w.word));

    const DAILY_BATCH = 10;
    const added: any[] = [];
    for (let i = 0; i < toAdd.length; i++) {
      const w = toAdd[i];
      const daysOut = Math.floor(i / DAILY_BATCH);
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + daysOut);
      const nextReview = nextReviewDate.toISOString().split('T')[0];
      const result = await storage.addSrsWord({ ...w, addedDate: today, nextReview, interval: 1, easeFactor: 2.5, repetitions: 0, lastResult: "" });
      added.push(result);
    }

    res.json({ added: added.length, skipped: parsed.data.words.length - added.length });
  });

  // GET /api/srs/mastery
  app.get("/api/srs/mastery", async (_req, res) => {
    const all = await storage.getSrsWords();
    const vocabKnown = all.filter(w => w.repetitions >= 2 && w.interval >= 3).length;
    const kanjiKnown = all.filter(w => w.repetitions >= 4 && w.interval >= 7).length;
    const total = all.length;
    res.json({ total, vocabKnown, kanjiKnown, vocabPct: total > 0 ? Math.round((vocabKnown / total) * 100) : 0, kanjiPct: total > 0 ? Math.round((kanjiKnown / total) * 100) : 0 });
  });

  // GET /api/duolingo
  app.get("/api/duolingo", async (req, res) => {
    const username = (req.query.username as string || "").trim();
    if (!username) return res.status(400).json({ error: "username required" });
    try {
      const url = `https://www.duolingo.com/2017-06-30/users?username=${encodeURIComponent(username)}&fields=streak,streakData,totalXp,courses,name,picture`;
      const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      const data = await r.json() as { users?: any[] };
      if (!data.users || data.users.length === 0) return res.status(404).json({ error: "User not found" });
      const u = data.users[0];
      const jaCourse = (u.courses || []).find((c: any) => c.learningLanguage === "ja");
      res.json({ name: u.name, picture: u.picture ? `https:${u.picture}` : null, streak: u.streak || 0, totalXp: u.totalXp || 0, japaneseXp: jaCourse?.xp || 0 });
    } catch (e) {
      res.status(502).json({ error: "Failed to reach Duolingo" });
    }
  });

  // GET /api/srs
  app.get("/api/srs", async (_req, res) => {
    res.json(await storage.getSrsWords());
  });

  // GET /api/srs/studied — words actually reviewed at least once
  app.get("/api/srs/studied", async (_req, res) => {
    res.json(await storage.getStudiedWords());
  });

  // GET /api/srs/due
  app.get("/api/srs/due", async (_req, res) => {
    res.json((await storage.getDueSrsWords()).slice(0, 20));
  });

  // POST /api/srs/add
  app.post("/api/srs/add", async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const schema = z.object({
      word: z.string().min(1),
      reading: z.string().default(""),
      meaning: z.string().default(""),
      level: z.enum(["N5","N4","N3","N2","N1"]).default("N5"),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const word = await storage.addSrsWord({ ...parsed.data, addedDate: today, nextReview: today, interval: 1, easeFactor: 2.5, repetitions: 0, lastResult: "" });
    res.json(word);
  });

  // POST /api/srs/review/:id
  app.post("/api/srs/review/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { result } = req.body;
    if (typeof result !== "number" || result < 0 || result > 3) return res.status(400).json({ error: "result must be 0-3" });
    const word = await storage.reviewSrsWord(id, result);
    res.json(word);
  });

  // DELETE /api/srs/:id
  app.delete("/api/srs/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteSrsWord(id);
    res.json({ ok: true });
  });

  // GET /api/passages
  app.get("/api/passages", (req, res) => {
    const { level, rank } = req.query as { level?: string; rank?: string };
    let list = PASSAGES;
    if (level) list = list.filter(p => p.level === level);
    if (rank) list = list.filter(p => p.rank === rank);
    res.json(list);
  });

  // GET /api/passages/:id
  app.get("/api/passages/:id", (req, res) => {
    const passage = PASSAGES.find(p => p.id === req.params.id);
    if (!passage) return res.status(404).json({ error: "not found" });
    res.json(passage);
  });
}
