"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Copy as CopyIcon,
  Sparkles,
  Check,
  Zap,
  GraduationCap,
  Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* ---------- Subjects (code-made logos) ---------- */
const SUBJECTS = [
  { id: "urdu", name: "Urdu", gradient: "linear-gradient(135deg,#10b981,#0d9488)", logoText: "اردو" },
  { id: "english", name: "English", gradient: "linear-gradient(135deg,#3b82f6,#4f46e5)", logoText: "EN" },
  { id: "math", name: "Math", gradient: "linear-gradient(135deg,#f43f5e,#db2777)", logoText: "π" },
  { id: "physics", name: "Physics", gradient: "linear-gradient(135deg,#8b5cf6,#7c3aed)", logoText: "Φ" },
  { id: "chemistry", name: "Chemistry", gradient: "linear-gradient(135deg,#f59e0b,#ea580c)", logoText: "H₂O" },
  { id: "biology", name: "Biology", gradient: "linear-gradient(135deg,#22c55e,#059669)", logoText: "DNA" },
  { id: "gk", name: "General Knowledge", gradient: "linear-gradient(135deg,#facc15,#f97316)", logoText: "GK" },
  { id: "test-ai", name: "Test AI", gradient: "linear-gradient(135deg,#374151,#111827)", logoText: "AI" }
];

const SAMPLE_QUESTIONS: Record<string, string> = {
  urdu: "اردو کے مشہور شعرا کے نام بتائیے",
  english: "What is a metaphor?",
  math: "What is the Pythagorean theorem?",
  physics: "What is gravity?",
  chemistry: "What is an atom?",
  biology: "What is photosynthesis?",
  gk: "Who is the current president of the USA?",
  "test-ai": "Ask any question to test AI capabilities."
};

const SUBJECT_PROMPTS: Record<string, any> = {
  homework: {
    urdu: "You are a helpful Urdu tutor. Answer in Urdu under 3 sentences.",
    english: "You are a helpful English tutor. Answer in English under 3 sentences.",
    math: "You are a math tutor. Solve with concise step-by-step (max 4 steps).",
    physics: "You are a physics tutor. Explain concisely under 3 sentences.",
    chemistry: "You are a chemistry tutor. Explain concisely under 3 sentences.",
    biology: "You are a biology tutor. Explain concisely under 3 sentences.",
    gk: "You are a general knowledge assistant. Answer concisely under 3 sentences.",
    "test-ai": "This is an AI test mode. Answer clearly."
  },
  exam: {
    urdu: "Provide concise exam-style answer in Urdu under 2 sentences.",
    english: "Provide concise exam-style answer in English under 2 sentences.",
    math: "Solve concisely with steps (max 3).",
    physics: "Provide concise exam-style answer under 2 sentences.",
    chemistry: "Provide concise exam-style answer under 2 sentences.",
    biology: "Provide concise exam-style answer under 2 sentences.",
    gk: "Provide concise general knowledge answer under 2 sentences.",
    "test-ai": "Answer concisely."
  }
};

/* ---------- Credits ---------- */
const CREDITS = ["Ishfaq", "Asim", "talha"];

/* ---------- Component ---------- */
export default function Page() {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [typingAnswer, setTypingAnswer] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [mode, setMode] = useState<"homework" | "exam">("homework");
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);

  // credits animation
  const [creditIndex, setCreditIndex] = useState<number>(0);
  const [creditText, setCreditText] = useState<string>(CREDITS[0]);

  useEffect(() => {
    let mounted = true;
    const loop = async () => {
      while (mounted) {
        const name = CREDITS[creditIndex % CREDITS.length];
        for (let i = name.length; i >= 0; i--) {
          if (!mounted) return;
          setCreditText(name.slice(0, i));
          await new Promise((r) => setTimeout(r, 80));
        }
        await new Promise((r) => setTimeout(r, 300));
        for (let i = 1; i <= name.length; i++) {
          if (!mounted) return;
          setCreditText(name.slice(0, i));
          await new Promise((r) => setTimeout(r, 120));
        }
        await new Promise((r) => setTimeout(r, 800));
        setCreditIndex((v) => (v + 1) % CREDITS.length);
      }
    };
    loop();
    return () => { mounted = false; };
  }, [creditIndex]);

  // progress state
  const [progress, setProgress] = useState<number>(0);
  const progressRef = useRef<number>(0);

  // durations history stored in localStorage
  const DUR_KEY = "ahh_durs_v1";
  const [durations, setDurations] = useState<number[]>(
    () => JSON.parse(typeof window !== "undefined" ? (localStorage.getItem(DUR_KEY) ?? "[]") : "[]")
  );
  useEffect(() => {
    try { localStorage.setItem(DUR_KEY, JSON.stringify(durations.slice(-10))); } catch {}
  }, [durations]);

  const estimateDuration = () => {
    if (durations.length === 0) return 1500;
    const last = durations.slice(-5);
    const avg = last.reduce((a, b) => a + b, 0) / last.length;
    return Math.max(400, Math.min(avg, 12000));
  };

  let _raf = useRef<number | null>(null);
  const startProgress = (estMs: number) => {
    cancelProgress();
    const start = Date.now();
    const targetBefore = 82;
    const loop = () => {
      const elapsed = Date.now() - start;
      const r = Math.min(1, elapsed / estMs);
      const eased = 1 - Math.pow(1 - r, 2);
      const val = Math.floor(eased * targetBefore);
      progressRef.current = val;
      setProgress(val);
      _raf.current = requestAnimationFrame(loop);
    };
    _raf.current = requestAnimationFrame(loop);
  };
  const cancelProgress = () => {
    if (_raf.current) cancelAnimationFrame(_raf.current);
    _raf.current = null;
  };

  const getGeminiResponse = async (userQuestion: string, subject: string) => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) throw new Error("API key missing. Add NEXT_PUBLIC_GEMINI_API_KEY.");
    const prompt = `${SUBJECT_PROMPTS[mode][subject] || ""}\n\nQuestion: ${userQuestion}\nAnswer:`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const msg = data?.error?.message || `${res.status} ${res.statusText}`;
      throw new Error(msg);
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No response from AI");
    return text;
  };

  const handleSubmit = async () => {
    setError(null);
    setTypingAnswer("");
    setAnswer("");

    if (!selectedSubject) { setError("Select a subject."); return; }
    if (!question.trim()) { setError("Enter a question."); return; }

    if (mode === "homework") {
      if (selectedSubject === "gk") {
        const q = question.trim().toLowerCase();
        const allowed = ["who","what","where","when","why","which","how","name","tell","define"];
        const ok = allowed.some(w => q.startsWith(w) || q.includes(" " + w + " "));
        if (!ok) {
          setTypingAnswer("Please ask a question related to General Knowledge.");
          setAnswer("Please ask a question related to General Knowledge.");
          return;
        }
      }
      if (selectedSubject === "test-ai") {
        setTypingAnswer("Test AI is only available in Exam mode.");
        setAnswer("Test AI is only available in Exam mode.");
        return;
      }
    }

    setIsLoading(true);
    const est = estimateDuration();
    startProgress(est);
    const t0 = Date.now();

    try {
      const aiText = await getGeminiResponse(question, selectedSubject);
      const duration = Date.now() - t0;
      const next = [...durations, duration].slice(-20);
      setDurations(next);
      cancelProgress();
      setProgress(100);

      const speed = mode === "exam" ? 6 : 16; // typing ms per char
      let cur = "";
      for (const ch of aiText) {
        cur += ch;
        setTypingAnswer(cur);
        const bump = Math.min(99, progressRef.current + 0.25);
        progressRef.current = bump;
        setProgress(Math.round(bump));
        await new Promise(r => setTimeout(r, speed));
      }
      setAnswer(aiText);
      setTypingAnswer(aiText);
      setProgress(100);
    } catch (err: any) {
      cancelProgress();
      setProgress(0);
      setError(err?.message || "Failed to get answer.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  const handleCopy = async () => {
    const text = answer || typingAnswer;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  const subjectById = (id?: string) => SUBJECTS.find(s => s.id === id);

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {/* animated blobs */}
      <motion.div className="pointer-events-none fixed inset-0 -z-10">
        <motion.div className="absolute left-0 top-24 w-72 h-72 rounded-full bg-gradient-to-br from-indigo-300 to-purple-400" animate={{ x: [-30, 30, -30], y: [0, -20, 0] }} transition={{ duration: 14, repeat: Infinity }} style={{ filter: "blur(60px)", opacity: 0.12 }} />
        <motion.div className="absolute right-0 bottom-24 w-96 h-96 rounded-full bg-gradient-to-br from-amber-200 to-pink-300" animate={{ x: [30, -30, 30], y: [10, -10, 10] }} transition={{ duration: 18, repeat: Infinity }} style={{ filter: "blur(70px)", opacity: 0.10 }} />
      </motion.div>

      <header className="text-center mb-8 relative">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }}>
          <div className="inline-block relative">
            <Sparkles size={52} className="text-indigo-400" />
            <motion.div className="absolute -right-4 -top-4 w-5 h-5 bg-white rounded-full opacity-30" animate={{ rotate: 360 }} transition={{ duration: 7, repeat: Infinity }} />
          </div>
        </motion.div>

        <motion.h1 initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2">
          AI Homework Helper
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="text-gray-600 max-w-2xl mx-auto mt-3">
          Instant, concise, and meaningful answers. Exam mode returns short, on-point answers.
        </motion.p>

        <div className="mt-4">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2.4 }} className="inline-flex items-center gap-3 px-4 py-1 rounded-lg bg-white/30 backdrop-blur-sm shadow-sm">
            <span className="text-xs text-gray-600">Made by</span>
            <motion.span key={creditText} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }} className="text-sm font-semibold tracking-wide">
              {creditText || <>&nbsp;</>}
            </motion.span>
          </motion.div>
        </div>
      </header>

      <div className="flex justify-center gap-3 mb-6">
        <Button variant={mode === "homework" ? "default" : "outline"} size="sm" onClick={() => setMode("homework")}><GraduationCap size={14} /> Homework</Button>
        <Button variant={mode === "exam" ? "default" : "outline"} size="sm" onClick={() => setMode("exam")}><Timer size={14} /> Exam</Button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-6">
        {SUBJECTS.map((sub, idx) => {
          const selected = selectedSubject === sub.id;
          return (
            <motion.div key={sub.id} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.03 * idx, type: "spring", stiffness: 220 }}>
              <Card className={cn("cursor-pointer border-0 transition-all shadow-md hover:shadow-xl", selected ? "ring-2 ring-indigo-500 scale-[1.02]" : "hover:scale-105")} onClick={() => setSelectedSubject(sub.id)} onMouseEnter={() => setHoveredSubject(sub.id)} onMouseLeave={() => setHoveredSubject(null)}>
                <CardContent className="flex flex-col items-center p-4">
                  <motion.div animate={hoveredSubject === sub.id ? { rotate: [0, 6, -6, 0], scale: [1, 1.08, 1] } : { rotate: 0, scale: 1 }} transition={{ duration: 0.8, repeat: hoveredSubject === sub.id ? Infinity : 0 }} style={{ background: sub.gradient }} className="w-16 h-16 flex items-center justify-center mb-2 rounded-xl text-white font-bold text-lg shadow-lg">
                    <span style={{ transform: "translateY(-2px)" }}>{sub.logoText}</span>
                  </motion.div>
                  <span className="text-xs font-semibold text-gray-700 text-center">{sub.name}</span>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Send className="text-indigo-600" /> Your Question</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={`Enter your ${mode} question...`} className="min-h-[120px] resize-none" maxLength={800} />
        </CardContent>
      </Card>

      <div className="mb-6">
        <div className="relative">
          <motion.button onClick={handleSubmit} disabled={isLoading} whileHover={{ scale: isLoading ? 1 : 1.02 }} whileTap={{ scale: 0.98 }} className={cn("w-full py-4 rounded-xl font-bold text-white overflow-hidden relative", "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg")} aria-label="Get Answer">
            <div className="relative z-10 flex items-center justify-center gap-3">
              <span className="flex items-center gap-2">
                <Zap size={18} />
                {isLoading ? "Thinking..." : "Get Answer"}
              </span>
            </div>
            <motion.div aria-hidden initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ ease: "linear", duration: 0.2 }} className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-400 to-green-600 opacity-50" />
          </motion.button>

          <div className="h-2 mt-2 rounded-full bg-transparent overflow-hidden">
            <motion.div style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }} transition={{ ease: "linear", duration: 0.2 }} className={cn("h-2 rounded-full", progress >= 100 ? "bg-green-500" : "bg-green-400")} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {(typingAnswer || error) && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.28 }} className="mb-8">
            <Card className="rounded-2xl shadow-2xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><Check className="text-green-600" /> AI Answer</span>
                  <div className="text-xs text-gray-500">{selectedSubject ? subjectById(selectedSubject)?.name : "—"}</div>
                </CardTitle>
              </CardHeader>

              <CardContent className="prose max-w-none text-gray-700">
                {error ? <div className="text-red-700 font-medium">{error}</div> : <div style={{ whiteSpace: "pre-wrap" }}>{typingAnswer}</div>}
              </CardContent>

              <div className="flex items-center justify-between gap-3 p-4 pt-0">
                <div className="text-sm text-gray-500">
                  {isLoading ? "Generating…" : answer ? "Done" : ""}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy} className={copied ? "scale-105" : ""}>{copied ? "Copied!" : "Copy"} <CopyIcon size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => { setQuestion(""); setTypingAnswer(""); setAnswer(""); setProgress(0); setError(null); }}>Clear</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-10 text-center text-xs text-gray-500">Built with ❤️ — animations by <span className="font-semibold">Ishfaq · Asim · talha</span></footer>
    </div>
  );
}