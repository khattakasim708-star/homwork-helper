"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ------------------------ SUBJECTS ------------------------
const SUBJECTS = [
  { id: "urdu", name: "Urdu", color: "from-green-500 to-teal-500" },
  { id: "english", name: "English", color: "from-blue-500 to-indigo-600" },
  { id: "math", name: "Math", color: "from-pink-500 to-rose-500" },
  { id: "physics", name: "Physics", color: "from-violet-500 to-purple-600" },
  { id: "chemistry", name: "Chemistry", color: "from-amber-400 to-orange-500" },
  { id: "biology", name: "Biology", color: "from-green-600 to-emerald-500" },
  { id: "gk", name: "General Knowledge", color: "from-yellow-400 to-orange-400" },
  { id: "test-ai", name: "Test AI", color: "from-gray-700 to-gray-900" }
];

// ------------------------ SAMPLE QUESTIONS ------------------------
const SAMPLE_QUESTIONS: Record<string, string> = {
  urdu: "اردو کے مشہور شعرا کے نام بتائیے",
  english: "Explain metaphor in short",
  math: "Solve 2x+3=7 step by step",
  physics: "Explain gravity briefly",
  chemistry: "Draw water molecule diagram",
  biology: "Explain photosynthesis",
  gk: "Who is the president of USA?",
  "test-ai": "Test AI capabilities"
};

// ------------------------ PROMPTS ------------------------
const SUBJECT_PROMPTS: Record<string, any> = {
  homework: {
    urdu: "Answer in Urdu under 3 sentences.",
    english: "Answer English question under 3 sentences.",
    math: "Solve math question step by step in full.",
    physics: "Explain physics briefly under 3 sentences.",
    chemistry: "Explain chemistry briefly under 3 sentences.",
    biology: "Explain biology briefly under 3 sentences.",
    gk: "Answer general knowledge briefly under 3 sentences.",
    "test-ai": "Test AI questions briefly."
  },
  exam: {
    urdu: "Provide concise exam-focused answer in Urdu under 2 sentences.",
    english: "Provide concise exam-focused answer in English under 2 sentences.",
    math: "Solve math question fully with steps.",
    physics: "Provide concise exam-focused answer under 2 sentences.",
    chemistry: "Provide concise exam-focused answer under 2 sentences.",
    biology: "Provide concise exam-focused answer under 2 sentences.",
    gk: "Answer general knowledge questions briefly under 2 sentences.",
    "test-ai": "Answer any question fully."
  }
};

// ------------------------ MAIN PAGE ------------------------
export default function Page() {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [mode, setMode] = useState<"homework" | "exam">("homework");
  const [answerLength, setAnswerLength] = useState<number>(2); // default 2 lines
  const [showDiagram, setShowDiagram] = useState<boolean>(true);
  const [credits, setCredits] = useState<string>("Ishfaq, Asim, Talha");

  // ------------------------ HANDLE SUBJECT ------------------------
  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setQuestion(SAMPLE_QUESTIONS[subject] || "");
    setAnswer("");
    setProgress(0);
  };

  // ------------------------ SIMULATED API CALL ------------------------
  const handleSubmit = async () => {
    if (!selectedSubject || !question.trim()) return;
    if (mode === "homework") {
      if (selectedSubject === "gk" && !question.toLowerCase().includes("general")) {
        setAnswer("Please ask a General Knowledge related question.");
        return;
      }
      if (selectedSubject === "test-ai") {
        setAnswer("Test AI is only available in Exam mode.");
        return;
      }
    }

    setIsLoading(true);
    setAnswer("");
    setProgress(0);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API key missing");

      // Simulate progress
      for (let i = 0; i <= 100; i += 5) {
        setProgress(i);
        await new Promise(r => setTimeout(r, 30));
      }

      // Generate answer (simulate API)
      let ans = `✨ Answer for "${question}" in ${selectedSubject.toUpperCase()} (${mode})`;
      if (selectedSubject === "chemistry" && showDiagram) {
        ans += "\n\nDiagram: C(carbon) O(oxygen)\n  _.Valency  _.Valency\n  _.swap.   _.swap.";
      }
      if (answerLength === 1 && ans.split("\n").length > 1) {
        ans = "⚠️ Cannot generate 1-line meaningful answer. Increase answer length.";
      }

      setAnswer(ans);
    } catch (e) {
      setAnswer("Failed to generate answer.");
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  // ------------------------ CREDITS ANIMATION ------------------------
  useEffect(() => {
    let idx = 0;
    const creditsArr = ["Ishfaq", "Asim", "Talha"];
    const interval = setInterval(() => {
      let display = "";
      for (let i = 0; i <= idx; i++) display += creditsArr[i] + (i < idx ? ", " : "");
      setCredits(display);
      idx = (idx + 1) % creditsArr.length;
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // ------------------------ RENDER ------------------------
  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="text-center mb-6 relative">
        <motion.h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-bounce">
          AI Homework Helper
        </motion.h1>
        <motion.p className="mt-2 text-gray-600 animate-fadeIn">Instant, meaningful answers with animations!</motion.p>
      </header>

      {/* Mode */}
      <div className="flex justify-center gap-2 mb-4">
        <Button variant={mode === "homework" ? "default" : "outline"} onClick={() => setMode("homework")}>Homework</Button>
        <Button variant={mode === "exam" ? "default" : "outline"} onClick={() => setMode("exam")}>Exam</Button>
      </div>

      {/* Subjects */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-4">
        {SUBJECTS.map((sub) => (
          <motion.div key={sub.id} whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }} className="cursor-pointer" onClick={() => handleSubjectSelect(sub.id)}>
            <Card className={cn("shadow-md p-2", selectedSubject === sub.id ? "ring-2 ring-indigo-500" : "")}>
              <CardContent className="flex flex-col items-center p-3 rounded-lg bg-gradient-to-br " style={{ background: `linear-gradient(135deg, ${sub.color.split(" ")[0]}, ${sub.color.split(" ")[2]})` }}>
                <div className="w-14 h-14 flex items-center justify-center text-white font-bold text-lg rounded-full">{sub.name[0]}</div>
                <span className="text-xs mt-1 font-semibold text-gray-100">{sub.name}</span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Answer Length Selector */}
      <div className="flex items-center gap-2 mb-4 justify-center">
        <span className="text-sm font-semibold">Answer Length:</span>
        {[1,2,3,4].map(n => (
          <Button key={n} variant={answerLength === n ? "default" : "outline"} onClick={() => setAnswerLength(n)}>{n}</Button>
        ))}
      </div>

      {/* Chemistry Diagram Toggle */}
      {selectedSubject === "chemistry" && (
        <div className="flex justify-center mb-4">
          <Button variant={showDiagram ? "default" : "outline"} onClick={() => setShowDiagram(!showDiagram)}>
            {showDiagram ? "Diagram Enabled" : "Diagram Disabled"}
          </Button>
        </div>
      )}

      {/* Question */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Your Question</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Type your question..." />
        </CardContent>
      </Card>

      {/* Submit / Progress */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center">
        <motion.button onClick={handleSubmit} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg">
          {isLoading ? `Generating... ${progress}%` : "Get Answer"}
        </motion.button>
      </div>

      {/* Progress bar */}
      {isLoading && <div className="h-1 w-full bg-gray-300 rounded-full mb-4">
        <div className="h-1 bg-green-500 rounded-full" style={{ width: `${progress}%`, transition: "width 0.1s" }} />
      </div>}

      {/* Answer */}
      {answer && (
        <AnimatePresence>
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} className="mb-6">
            <Card className="shadow-xl p-4 rounded-2xl bg-white">
              <CardHeader>
                <CardTitle>AI Answer</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-wrap">{answer}</CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Credits */}
      <motion.div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-sm font-bold text-indigo-600 animate-bounce">{credits}</motion.div>
    </div>
  );
}
