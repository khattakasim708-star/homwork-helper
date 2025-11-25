"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Subjects with code-based logos
const SUBJECTS = [
  { id: "urdu", name: "Urdu", gradient: "linear-gradient(135deg,#10b981,#0d9488)", icon: <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">اردو</div> },
  { id: "english", name: "English", gradient: "linear-gradient(135deg,#3b82f6,#4f46e5)", icon: <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">EN</div> },
  { id: "math", name: "Math", gradient: "linear-gradient(135deg,#f43f5e,#db2777)", icon: <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold">π</div> },
  { id: "physics", name: "Physics", gradient: "linear-gradient(135deg,#8b5cf6,#7c3aed)", icon: <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">Φ</div> },
  { id: "chemistry", name: "Chemistry", gradient: "linear-gradient(135deg,#f59e0b,#ea580c)", icon: <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">H₂O</div> },
  { id: "biology", name: "Biology", gradient: "linear-gradient(135deg,#22c55e,#059669)", icon: <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">DNA</div> },
  { id: "gk", name: "General Knowledge", gradient: "linear-gradient(135deg,#facc15,#f97316)", icon: <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white font-bold">GK</div> },
  { id: "test-ai", name: "Test AI", gradient: "linear-gradient(135deg,#374151,#111827)", icon: <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold">AI</div> },
];

// Sample questions
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

// Prompts
const SUBJECT_PROMPTS: Record<string, any> = {
  homework: {
    urdu: "Answer in Urdu under 3 sentences.",
    english: "Answer English question under 3 sentences.",
    math: "Solve math question step by step under 4 steps.",
    physics: "Explain physics briefly under 3 sentences.",
    chemistry: "Explain chemistry briefly under 3 sentences.",
    biology: "Explain biology briefly under 3 sentences.",
    gk: "Answer general knowledge briefly under 3 sentences.",
    "test-ai": "Test AI questions briefly."
  },
  exam: {
    urdu: "Provide concise exam-focused answer in Urdu under 2 sentences.",
    english: "Provide concise exam-focused answer in English under 2 sentences.",
    math: "Solve math question briefly under 3 steps.",
    physics: "Provide concise exam-focused answer under 2 sentences.",
    chemistry: "Provide concise exam-focused answer under 2 sentences.",
    biology: "Provide concise exam-focused answer under 2 sentences.",
    gk: "Answer general knowledge questions briefly under 2 sentences.",
    "test-ai": "Answer any question."
  }
};

export default function Page() {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"homework" | "exam">("homework");
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);
  const [typingAnswer, setTypingAnswer] = useState<string>("");

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setQuestion(SAMPLE_QUESTIONS[subjectId] || "");
    setAnswer("");
    setTypingAnswer("");
    setError(null);
  };

  const getGeminiResponse = async (userQuestion: string, subject: string) => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) throw new Error("API key missing.");
    const prompt = `${SUBJECT_PROMPTS[mode][subject]}\n\nQuestion: ${userQuestion}\nAnswer:`;
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents:[{parts:[{text: prompt}]}] })
      }
    );
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error?.message || "AI failed");
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";
  };

  const handleSubmit = async () => {
    if (!selectedSubject || !question.trim()) {
      setError("Select subject and enter question");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnswer("");
    setTypingAnswer("");

    try {
      const aiResponse = await getGeminiResponse(question, selectedSubject);

      // Typing animation
      let current = "";
      for (let char of aiResponse) {
        current += char;
        setTypingAnswer(current);
        await new Promise(r => setTimeout(r, 20));
      }
      setAnswer(aiResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get answer.");
    } finally { setIsLoading(false); }
  };

  const handleCopy = () => {
    if (answer) {
      navigator.clipboard.writeText(answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="text-center mb-8 relative">
        <motion.div className="absolute -top-5 left-1/2 -translate-x-1/2">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8 }} className="w-16 h-16 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-xl opacity-50"></motion.div>
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-bounce">AI Homework Helper</h1>
        <p className="text-gray-600 max-w-md mx-auto mt-3 animate-fadeIn">Instant, concise, meaningful answers with animated effects!</p>
      </header>

      {/* Mode */}
      <div className="flex justify-center gap-2 mb-6">
        <Button variant={mode==="homework"?"default":"outline"} size="sm" onClick={()=>setMode("homework")}>Homework</Button>
        <Button variant={mode==="exam"?"default":"outline"} size="sm" onClick={()=>setMode("exam")}>Exam</Button>
      </div>

      {/* Subjects */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-6">
        {SUBJECTS.map((sub, i) => (
          <motion.div key={sub.id} initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay: 0.05*i }}>
            <Card
              className={cn("cursor-pointer shadow-md border-0 transition-all hover:shadow-xl hover:scale-105", selectedSubject===sub.id?"ring-2 ring-indigo-500":"hover:ring-1 hover:ring-indigo-300")}
              onClick={() => handleSubjectSelect(sub.id)}
              onMouseEnter={() => setHoveredSubject(sub.id)}
              onMouseLeave={() => setHoveredSubject(null)}
            >
              <CardContent className="flex flex-col items-center p-4">
                <motion.div
                  animate={hoveredSubject===sub.id ? { scale:[1,1.2,1], rotate:[0,10,-10,0] } : {}}
                  transition={{ duration:0.6, repeat: hoveredSubject===sub.id?Infinity:0 }}
                  style={{ background: sub.gradient }}
                  className="w-16 h-16 flex items-center justify-center mb-2 rounded-xl shadow-lg"
                >
                  {sub.icon}
                </motion.div>
                <span className="text-xs font-semibold text-gray-700 text-center">{sub.name}</span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Question */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Question</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea value={question} onChange={(e)=>setQuestion(e.target.value)} placeholder={`Enter your ${mode} question...`} className="min-h-[120px] resize-none" maxLength={500}/>
        </CardContent>
      </Card>

      {/* Submit with progress animation */}
      <motion.div className="relative mb-6">
        <motion.button
          onClick={handleSubmit}
          disabled={isLoading}
          className="relative w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl overflow-hidden"
        >
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-yellow-400 opacity-40"
            animate={{ width: isLoading ? ["0%", "100%"] : "0%" }}
            transition={{ duration: 2, repeat: isLoading ? Infinity : 0 }}
          />
          <span className="relative z-10">{isLoading ? "Thinking..." : "Get Answer"}</span>
        </motion.button>
      </motion.div>

      {/* Answer */}
      <AnimatePresence>
        {typingAnswer && (
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="mb-8">
            <Card className="shadow-xl border-0 rounded-2xl bg-white hover:shadow-2xl animate-pulse">
              <CardHeader>
                <CardTitle>AI Answer</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none text-gray-700">{typingAnswer}</CardContent>
              <div className="flex justify-end p-4">
                <Button variant="outline" size="sm" onClick={handleCopy} className="hover:scale-110 transition-transform">{copied?"Copied!":"Copy"}</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="mb-4 p-3 rounded bg-red-100 text-red-700">
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}