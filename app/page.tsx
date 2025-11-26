"use client";

import { useState, useEffect, useRef, MutableRefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import Lenis from "@studio-freight/lenis";
import autoAnimate from "@formkit/auto-animate";

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
    biology: "Explain photosynthesis briefly under 3 sentences.",
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

  // refs for animations
  const lenisRef = useRef<Lenis | null>(null);
  const subjectsRef = useRef<HTMLDivElement | null>(null);
  const answerContainerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const creditsRef = useRef<HTMLDivElement | null>(null);

  // ------------------------ HANDLE SUBJECT ------------------------
  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setQuestion(SAMPLE_QUESTIONS[subject] || "");
    setAnswer("");
    setProgress(0);

    // subtle focus animation
    const card = cardRefs.current[subject];
    if (card) {
      gsap.fromTo(card, { scale: 0.96, boxShadow: "0 6px 10px rgba(0,0,0,0.06)" }, { scale: 1, boxShadow: "0 18px 40px rgba(2,6,23,0.12)", duration: 0.45, ease: "power3.out" });
    }
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

      // Smooth progress animation
      for (let i = 0; i <= 100; i += 5) {
        setProgress(i);
        // micro pause to feel smooth
        await new Promise((r) => setTimeout(r, 24));
      }

      // Generate answer (simulate API)
      let ans = `✨ Answer for "${question}" in ${selectedSubject.toUpperCase()} (${mode})`;
      if (selectedSubject === "chemistry" && showDiagram) {
        ans += "\n\nDiagram: \n  H - O - H\n (Hydrogen) (Oxygen)";
      }
      if (answerLength === 1 && ans.split("\n").length > 1) {
        ans = "⚠️ Cannot generate 1-line meaningful answer. Increase answer length.";
      }

      // typewriter-like reveal using GSAP in answer container (we set state then animate reveal)
      setAnswer(ans);
      await new Promise((r) => setTimeout(r, 60));
      if (answerContainerRef.current) {
        gsap.fromTo(answerContainerRef.current, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" });
      }
    } catch (e) {
      setAnswer("Failed to generate answer.");
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  // ------------------------ CREDIT ANIMATION ------------------------
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

  // ------------------------ LENIS smooth scroll ------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (lenisRef.current) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // buttery curve
      smooth: true,
      direction: "vertical",
      gestureDirection: "vertical",
      wheelMultiplier: 1,
      smoothTouch: true
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // ------------------------ AUTO-ANIMATE for answer transitions ------------------------
  useEffect(() => {
    if (answerContainerRef.current) {
      autoAnimate(answerContainerRef.current, { duration: 450, easing: "cubic-bezier(.2,.9,.3,1)" });
    }
  }, [answerContainerRef]);

  // ------------------------ Entrance animations ------------------------
  useEffect(() => {
    // subtle page entrance
    gsap.from("header .hero", { opacity: 0, y: 18, stagger: 0.08, duration: 0.7, ease: "power3.out" });
    gsap.from(".subject-card", { opacity: 0, y: 18, stagger: 0.04, duration: 0.6, ease: "power3.out", delay: 0.12 });
    gsap.from(".controls", { opacity: 0, y: 10, duration: 0.6, ease: "power3.out", delay: 0.18 });
    gsap.from(".question-card", { opacity: 0, y: 14, duration: 0.6, ease: "power3.out", delay: 0.22 });
    gsap.from(".submit-row", { opacity: 0, y: 10, duration: 0.6, ease: "power3.out", delay: 0.26 });
    gsap.from(".credits-glow", { opacity: 0, y: 6, duration: 0.7, ease: "sine.out", delay: 0.3 });
  }, []);

  // ------------------------ 3D tilt hover for cards ------------------------
  const handleCardPointer = (e: React.PointerEvent, id: string) => {
    const el = cardRefs.current[id];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotX = (-y * 8).toFixed(2);
    const rotY = (x * 10).toFixed(2);
    gsap.to(el, { rotateX: rotX + "deg", rotateY: rotY + "deg", scale: 1.03, transformPerspective: 800, transformOrigin: "center", duration: 0.25, ease: "power3.out" });
  };
  const resetCardTransform = (id: string) => {
    const el = cardRefs.current[id];
    if (!el) return;
    gsap.to(el, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.45, ease: "elastic.out(1, 0.6)" });
  };

  // ------------------------ RENDER ------------------------
  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-slate-50 to-blue-50 selection:bg-indigo-200">
      {/* Header */}
      <header className="text-center mb-6 relative">
        <div className="hero">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            AI Homework Helper
          </motion.h1>
          <motion.p className="mt-2 text-gray-600" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}>
            Instant, meaningful answers with buttery-smooth animations.
          </motion.p>
        </div>
      </header>

      {/* Mode */}
      <div className="flex justify-center gap-2 mb-4 controls">
        <Button variant={mode === "homework" ? "default" : "outline"} onClick={() => setMode("homework")}>
          Homework
        </Button>
        <Button variant={mode === "exam" ? "default" : "outline"} onClick={() => setMode("exam")}>
          Exam
        </Button>
      </div>

      {/* Subjects */}
      <div ref={subjectsRef} className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-4">
        {SUBJECTS.map((sub) => {
          // background gradient inline (keep colors from your config)
          const colors = sub.color.split(" ");
          const bgStyle = { background: `linear-gradient(135deg, var(--from), var(--to))` } as any;
          // We'll set CSS vars inline for better gradient control
          return (
            <motion.div
              key={sub.id}
              className="cursor-pointer subject-card perspective"
              whileHover={{ scale: 1.02 }}
              onClick={() => handleSubjectSelect(sub.id)}
              onPointerMove={(e) => handleCardPointer(e, sub.id)}
              onPointerLeave={() => resetCardTransform(sub.id)}
              style={{ perspective: 800 }}
            >
              <Card
                ref={(el: HTMLDivElement | null) => (cardRefs.current[sub.id] = el)}
                className={cn(
                  "shadow-md p-2 transform-gpu transition-transform will-change-transform",
                  selectedSubject === sub.id ? "ring-2 ring-indigo-500" : ""
                )}
              >
                <CardContent
                  className="flex flex-col items-center p-3 rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${tailwindColorToHex(colors[0])}, ${tailwindColorToHex(colors[2])})`
                  }}
                >
                  <div className="w-14 h-14 flex items-center justify-center text-white font-bold text-lg rounded-full glass-blur">{sub.name[0]}</div>
                  <span className="text-xs mt-1 font-semibold text-gray-100">{sub.name}</span>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Answer Length Selector */}
      <div className="flex items-center gap-2 mb-4 justify-center controls">
        <span className="text-sm font-semibold">Answer Length:</span>
        {[1, 2, 3, 4].map((n) => (
          <Button key={n} variant={answerLength === n ? "default" : "outline"} onClick={() => setAnswerLength(n)}>
            {n}
          </Button>
        ))}
      </div>

      {/* Chemistry Diagram Toggle */}
      {selectedSubject === "chemistry" && (
        <div className="flex justify-center mb-4 controls">
          <Button variant={showDiagram ? "default" : "outline"} onClick={() => setShowDiagram(!showDiagram)}>
            {showDiagram ? "Diagram Enabled" : "Diagram Disabled"}
          </Button>
        </div>
      )}

      {/* Question */}
      <Card className="mb-4 question-card">
        <CardHeader>
          <CardTitle>Your Question</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question..."
            onFocus={(e) => gsap.to(e.target, { boxShadow: "0 10px 30px rgba(2,6,23,0.06)", duration: 0.35 })}
            onBlur={(e) => gsap.to(e.target, { boxShadow: "none", duration: 0.35 })}
          />
        </CardContent>
      </Card>

      {/* Submit / Progress */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center submit-row">
        <motion.button
          onClick={handleSubmit}
          whileHover={{ scale: 1.02, boxShadow: "0 12px 28px rgba(99,102,241,0.12)" }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg"
        >
          {isLoading ? `Generating... ${progress}%` : "Get Answer"}
        </motion.button>
      </div>

      {/* Progress bar */}
      {isLoading && (
        <div className="h-1 w-full bg-gray-300 rounded-full mb-4">
          <div
            className="h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
            style={{ width: `${progress}%`, transition: "width 0.16s linear" }}
          />
        </div>
      )}

      {/* Answer */}
      <div ref={answerContainerRef} className="mb-6">
        <AnimatePresence>
          {answer && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6">
              <Card className="shadow-xl p-4 rounded-2xl bg-white">
                <CardHeader>
                  <CardTitle>AI Answer</CardTitle>
                </CardHeader>
                <CardContent className="whitespace-pre-wrap">{answer}</CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Credits */}
      <motion.div
        ref={creditsRef}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 text-sm font-bold text-indigo-600 credits-glow"
        initial={{ y: 6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ repeat: Infinity, repeatType: "mirror", duration: 2.6, ease: "sine.inOut" }}
        style={{ textShadow: "0 6px 24px rgba(99,102,241,0.08)" }}
      >
        {credits}
      </motion.div>
    </div>
  );
}

/**
 * Helper to convert a few common tailwind color tokens to hex for inline gradients.
 * This is a lightweight mapping for the tokens used above. Add more if you use other tokens.
 */
function tailwindColorToHex(token: string) {
  switch (token) {
    case "from-green-500":
    case "green-500":
      return "#10B981";
    case "to-teal-500":
    case "teal-500":
      return "#14B8A6";
    case "from-blue-500":
    case "blue-500":
      return "#3B82F6";
    case "to-indigo-600":
    case "indigo-600":
      return "#4F46E5";
    case "from-pink-500":
    case "pink-500":
      return "#EC4899";
    case "to-rose-500":
    case "rose-500":
      return "#F43F5E";
    case "from-violet-500":
    case "violet-500":
      return "#7C3AED";
    case "to-purple-600":
    case "purple-600":
      return "#6D28D9";
    case "from-amber-400":
    case "amber-400":
      return "#F59E0B";
    case "to-orange-500":
    case "orange-500":
      return "#F97316";
    case "from-green-600":
    case "green-600":
      return "#16A34A";
    case "to-emerald-500":
    case "emerald-500":
      return "#10B981";
    case "from-yellow-400":
    case "yellow-400":
      return "#FBBF24";
    case "to-orange-400":
    case "orange-400":
      return "#FB923C";
    case "from-gray-700":
    case "gray-700":
      return "#374151";
    case "to-gray-900":
    case "gray-900":
      return "#111827";
    default:
      // fallback
      return "#111827";
  }
  }
