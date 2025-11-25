// Path: homwork-helper/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Copy, RotateCcw, Sparkles, Check, Zap, GraduationCap, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DiagramAnswerProps {
  content: string[][];
  visible: boolean;
}

function DiagramAnswer({ content, visible }: DiagramAnswerProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.8 }}
          className="p-4 bg-gray-50 rounded-xl shadow-inner overflow-auto my-4"
        >
          <pre className="font-mono text-sm text-gray-800">
            {content.map((row) => row.map(cell => cell.padEnd(10, " ")).join("")).join("\n")}
          </pre>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const SUBJECTS = [
  { id: "urdu", name: "Urdu", gradient: "linear-gradient(135deg,#10b981 0%,#0d9488 100%)", icon: <div className="w-12 h-12 rounded-full bg-green-500 animate-pulse flex items-center justify-center text-white font-bold">اردو</div> },
  { id: "english", name: "English", gradient: "linear-gradient(135deg,#3b82f6 0%,#4f46e5 100%)", icon: <div className="w-12 h-12 rounded-full bg-blue-500 animate-pulse flex items-center justify-center text-white font-bold">EN</div> },
  { id: "math", name: "Math", gradient: "linear-gradient(135deg,#f43f5e 0%,#db2777 100%)", icon: <div className="w-12 h-12 rounded-full bg-pink-500 animate-pulse text-white font-bold">M</div> },
  { id: "physics", name: "Physics", gradient: "linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%)", icon: <div className="w-12 h-12 rounded-full bg-violet-500 animate-pulse text-white font-bold">P</div> },
  { id: "chemistry", name: "Chemistry", gradient: "linear-gradient(135deg,#f59e0b 0%,#ea580c 100%)", icon: <div className="w-12 h-12 rounded-full bg-amber-500 animate-pulse text-white font-bold">C</div> },
  { id: "biology", name: "Biology", gradient: "linear-gradient(135deg,#22c55e 0%,#059669 100%)", icon: <div className="w-12 h-12 rounded-full bg-green-600 animate-pulse text-white font-bold">B</div> },
  { id: "gk", name: "General Knowledge", gradient: "linear-gradient(135deg,#facc15 0%,#f97316 100%)", icon: <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">GK</div> },
  { id: "test-ai", name: "Test AI", gradient: "linear-gradient(135deg,#374151 0%,#111827 100%)", icon: <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold">AI</div> },
];

const SAMPLE_QUESTIONS: Record<string, string> = {
  urdu: "اردو کے مشہور شعرا کے نام بتائیے",
  english: "What is a metaphor?",
  math: "What is the Pythagorean theorem?",
  physics: "What is gravity?",
  chemistry: "Draw a water molecule diagram",
  biology: "Show DNA double helix structure",
  gk: "Who is the current president of the USA?",
  "test-ai": "Ask any question to test AI capabilities."
};

const SUBJECT_PROMPTS: Record<string, any> = {
  homework: {
    urdu: "Answer in Urdu under 3 sentences.",
    english: "Answer English question under 3 sentences.",
    math: "Solve math question fully step by step.",
    physics: "Explain physics briefly under 3 sentences.",
    chemistry: "Explain chemistry briefly under 3 sentences. Provide diagram if applicable.",
    biology: "Explain biology briefly under 3 sentences. Provide diagram if applicable.",
    gk: "Answer general knowledge briefly under 3 sentences.",
    "test-ai": "Test AI questions briefly."
  },
  exam: {
    urdu: "Provide concise exam-focused answer in Urdu under 2 sentences.",
    english: "Provide concise exam-focused answer in English under 2 sentences.",
    math: "Solve math question fully step by step.",
    physics: "Provide concise exam-focused answer under 2 sentences.",
    chemistry: "Provide concise exam-focused answer with diagram if needed.",
    biology: "Provide concise exam-focused answer with diagram if needed.",
    gk: "Answer general knowledge questions briefly under 2 sentences.",
    "test-ai": "Answer any question."
  }
};

// Animated Credits Component
function AnimatedCredits() {
  const [text, setText] = useState("");
  const names = ["Ishfaq", "Asim", "Talha"];
  const [currentNameIndex, setCurrentNameIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fullText = names[currentNameIndex];
    timer = setTimeout(() => {
      if (!isDeleting) {
        setText(fullText.substring(0, text.length + 1));
        if (text.length + 1 === fullText.length) setIsDeleting(true);
      } else {
        setText(fullText.substring(0, text.length - 1));
        if (text.length === 0) {
          setIsDeleting(false);
          setCurrentNameIndex((prev) => (prev + 1) % names.length);
        }
      }
    }, isDeleting ? 150 : 250);

    return () => clearTimeout(timer);
  }, [text, isDeleting, currentNameIndex]);

  return (
    <motion.div
      className="text-2xl font-bold text-indigo-600 text-center my-6"
      animate={{ y: [0, -10, 0] }}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      {text}
    </motion.div>
  );
}

export default function Page() {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [diagramContent, setDiagramContent] = useState<string[][] | null>(null);
  const [showDiagram, setShowDiagram] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"homework" | "exam">("homework");
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);
  const [typingAnswer, setTypingAnswer] = useState<string>("");
  const [answerLength, setAnswerLength] = useState<number>(2); // default
  const [warningText, setWarningText] = useState<string>("");

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setQuestion(SAMPLE_QUESTIONS[subjectId] || "");
    setAnswer("");
    setTypingAnswer("");
    setDiagramContent(null);
    setError(null);
    setWarningText("");
  };

  const generateAIAnswer = async (q: string, subject: string, length:number) => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) throw new Error("API key missing");

    let prompt = `${SUBJECT_PROMPTS[mode][subject]}\nAnswer length: ${length}.\nQuestion: ${q}\nAnswer:`;

    const simulatedAnswer = `${subject.toUpperCase()} Answer for "${q}" with length ${length} lines.`.repeat(length>1?length:1);

    return simulatedAnswer;
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
    setDiagramContent(null);
    setWarningText("");
    setProgress(0);

    try {
      if (answerLength === 1 && selectedSubject !== "math") {
        setWarningText("⚠️ Can't generate full meaningful answer in 1 line!");
      }

      const aiResponse = await generateAIAnswer(question, selectedSubject, answerLength);

      if (selectedSubject === "chemistry" && question.toLowerCase().includes("diagram")) {
        setDiagramContent([
          ["C","O"],
          ["_.Valency","_.Valency"],
          ["_.Swap","_.Swap"]
        ]);
      }

      let current = "";
      for (let i = 0; i < aiResponse.length; i++) {
        current += aiResponse[i];
        setTypingAnswer(current);
        setProgress(((i + 1) / aiResponse.length) * 100);
        await new Promise(r => setTimeout(r, 15));
      }

      setAnswer(aiResponse);
      setProgress(100);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get answer.");
    } finally {
      setIsLoading(false);
    }
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
        <motion.div className="absolute -top-5 left-1/2 -translate-x-1/2" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <Sparkles size={48} className="text-indigo-400 animate-pulse" />
        </motion.div>
        <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-bounce">
          AI Homework Helper
        </h1>
        <p className="text-gray-600 max-w-md mx-auto mt-3 animate-fadeIn">
          Instant animated answers with adjustable length & diagrams!
        </p>
      </header>

      <AnimatedCredits /> {/* Credit Animation */}

      {/* Mode */}
      <div className="flex justify-center gap-2 mb-6">
        <Button variant={mode==="homework"?"default":"outline"} size="sm" onClick={()=>setMode("homework")}><GraduationCap size={16}/> Homework</Button>
        <Button variant={mode==="exam"?"default":"outline"} size="sm" onClick={()=>setMode("exam")}><Timer size={16}/> Exam</Button>
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

      {/* Answer length selector */}
      <div className="flex gap-3 items-center mb-4">
        <span className="font-semibold text-gray-700">Answer Length:</span>
        {[1,2,3,4,5].map(num => (
          <Button
            key={num}
            size="sm"
            variant={answerLength===num?"default":"outline"}
            onClick={()=>setAnswerLength(num)}
          >{num}</Button>
        ))}
      </div>

      {/* Chemistry diagram toggle */}
      {selectedSubject==="chemistry" && (
        <div className="flex gap-3 items-center mb-6">
          <span className="font-semibold text-gray-700">Diagram:</span>
          <Button size="sm" variant={showDiagram?"default":"outline"} onClick={()=>setShowDiagram(!showDiagram)}>
            {showDiagram?"Enabled":"Disabled"}
          </Button>
        </div>
      )}

      {/* Question */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Send className="text-indigo-600"/> Your Question</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea value={question} onChange={(e)=>setQuestion(e.target.value)} placeholder={`Enter your ${mode} question...`} className="min-h-[120px] resize-none" maxLength={500}/>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <motion.button
          onClick={handleSubmit}
          disabled={isLoading}
          whileHover={{ scale: 1.05, rotate: [0, 2, -2, 0] }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl flex justify-center items-center gap-2 relative overflow-hidden"
        >
          {isLoading ? <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat: Infinity }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"/> : <Zap size={20}/> } Get Answer
          <motion.div style={{ width: `${progress}%` }} className="absolute bottom-0 left-0 h-1 bg-green-400 transition-all"></motion.div>
        </motion.button>
        {warningText && <span className="text-red-500 font-semibold animate-pulse">{warningText}</span>}
      </div>

      {/* Answer */}
      <AnimatePresence>
        {typingAnswer && (
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="mb-4">
            <Card className="shadow-xl border-0 rounded-2xl bg-white p-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Check className="text-green-600"/> AI Answer</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none text-gray-700">{typingAnswer}</CardContent>
              <div className="flex justify-end p-4">
                <Button variant="outline" size="sm" onClick={handleCopy}>{copied?"Copied!":"Copy"} <Copy size={16}/></Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diagram */}
      {selectedSubject==="chemistry" && diagramContent && <DiagramAnswer content={diagramContent} visible={showDiagram} />}

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