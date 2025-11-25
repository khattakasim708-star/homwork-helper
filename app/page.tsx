"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Subjects with animated shapes instead of PNGs
const SUBJECTS = [
  { id: "urdu", name: "Urdu", gradient: "linear-gradient(135deg, #10b981 0%, #0d9488 100%)", icon: <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 animate-pulse" /> },
  { id: "english", name: "English", gradient: "linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)", icon: <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 animate-bounce" /> },
  { id: "math", name: "Math", gradient: "linear-gradient(135deg, #f43f5e 0%, #db2777 100%)", icon: <div className="w-14 h-14 rounded-full bg-pink-500 animate-spin" /> },
  { id: "physics", name: "Physics", gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", icon: <div className="w-14 h-14 rounded-full bg-violet-500 animate-pulse" /> },
  { id: "chemistry", name: "Chemistry", gradient: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)", icon: <div className="w-14 h-14 rounded-full bg-amber-500 animate-bounce" /> },
  { id: "biology", name: "Biology", gradient: "linear-gradient(135deg, #22c55e 0%, #059669 100%)", icon: <div className="w-14 h-14 rounded-full bg-green-500 animate-pulse" /> },
  { id: "gk", name: "General Knowledge", gradient: "linear-gradient(135deg, #facc15 0%, #f97316 100%)", icon: <div className="w-14 h-14 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold animate-bounce">GK</div> },
  { id: "test-ai", name: "Test AI", gradient: "linear-gradient(135deg, #374151 0%, #111827 100%)", icon: <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold animate-pulse">AI</div> },
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
    math: "Solve math question fully step by step.",
    physics: "Explain physics briefly under 3 sentences.",
    chemistry: "Explain chemistry briefly under 3 sentences.",
    biology: "Explain biology briefly under 3 sentences.",
    gk: "Answer general knowledge briefly under 3 sentences.",
    "test-ai": "Test AI questions briefly."
  },
  exam: {
    urdu: "Provide concise exam-focused answer in Urdu under 2 sentences.",
    english: "Provide concise exam-focused answer in English under 2 sentences.",
    math: "Solve math question fully step by step.",
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
  const [typingAnswer, setTypingAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);
  const [mode, setMode] = useState<"homework" | "exam">("homework");
  const [answerLength, setAnswerLength] = useState<number>(3); // 1-10
  const [diagramEnabled, setDiagramEnabled] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setQuestion(SAMPLE_QUESTIONS[subjectId] || "");
    setAnswer("");
    setTypingAnswer("");
    setDiagramEnabled(false);
  };

  const getGeminiAnswer = async (q: string, subj: string) => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) throw new Error("API key missing");
    const prompt = `${SUBJECT_PROMPTS[mode][subj]}\nAnswer length: ${answerLength}\nQuestion: ${q}\nAnswer:`;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents:[{ parts:[{ text: prompt }] }] })
    });
    if (!res.ok) throw new Error("AI failed");
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
  };

  const handleSubmit = async () => {
    if (!selectedSubject || !question.trim()) return;

    if (mode === "homework") {
      if (selectedSubject === "gk" && !question.toLowerCase().includes("general")) {
        setAnswer("Please ask a question related to General Knowledge.");
        return;
      }
      if (selectedSubject === "test-ai") {
        setAnswer("Test AI is only available in Exam mode.");
        return;
      }
    }

    setIsLoading(true);
    setTypingAnswer("");
    setAnswer("");

    try {
      // Fetch AI answer
      const aiAnswer = await getGeminiAnswer(question, selectedSubject);

      // Typing animation
      let temp = "";
      for (let char of aiAnswer) {
        temp += char;
        setTypingAnswer(temp);
        await new Promise(r => setTimeout(r, 20));
      }
      setAnswer(aiAnswer);
    } catch {
      setTypingAnswer("Failed to generate answer.");
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
    <div className="min-h-screen p-4 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="text-center mb-6">
        <motion.h1 animate={{ scale:[1,1.1,1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
          AI Homework Helper
        </motion.h1>
        <motion.p animate={{ y:[0,10,0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-gray-700 mt-2">Get animated, meaningful answers</motion.p>
      </div>

      {/* Mode */}
      <div className="flex justify-center gap-2 mb-4">
        <Button variant={mode==="homework"?"default":"outline"} size="sm" onClick={()=>setMode("homework")}>Homework</Button>
        <Button variant={mode==="exam"?"default":"outline"} size="sm" onClick={()=>setMode("exam")}>Exam</Button>
      </div>

      {/* Subjects */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-4">
        {SUBJECTS.map((sub,i)=>(
          <motion.div key={sub.id} initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} transition={{delay:0.05*i}}>
            <Card className={cn("cursor-pointer shadow-md hover:shadow-xl border-0", selectedSubject===sub.id?"ring-2 ring-indigo-500":"")} onClick={()=>handleSubjectSelect(sub.id)}>
              <CardContent className="flex flex-col items-center p-3">
                <motion.div animate={hoveredSubject===sub.id ? {scale:[1,1.2,1], rotate:[0,10,-10,0]} : {}} transition={{repeat:hoveredSubject===sub.id?Infinity:0, duration:0.6}} className="w-16 h-16 flex items-center justify-center mb-2 rounded-xl shadow-lg" style={{ background: sub.gradient }}>
                  {sub.icon}
                </motion.div>
                <span className="text-xs font-semibold text-gray-700 text-center">{sub.name}</span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Question */}
      <Card className="mb-4">
        <CardHeader><CardTitle>Enter your question</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={question} onChange={(e)=>setQuestion(e.target.value)} placeholder="Type question..." maxLength={500} className="min-h-[100px]" />
        </CardContent>
      </Card>

      {/* Answer Length & Diagram Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3 items-center">
        <div className="flex items-center gap-2">
          <span>Answer Length:</span>
          <input type="number" min={1} max={10} value={answerLength} onChange={e=>setAnswerLength(Number(e.target.value))} className="w-16 border rounded p-1"/>
        </div>
        {selectedSubject==="chemistry" && <Button onClick={()=>setDiagramEnabled(!diagramEnabled)} variant={diagramEnabled?"default":"outline"} size="sm">Diagram {diagramEnabled?"ON":"OFF"}</Button>}
      </div>

      {/* Submit Button */}
      <div className="mb-4 relative">
        <motion.button onClick={handleSubmit} disabled={isLoading} whileTap={{scale:0.95}} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg flex justify-center items-center gap-2">
          {isLoading ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span> : "Get Answer"}
        </motion.button>
        {/* Green progress line */}
        {isLoading && <motion.div className="absolute bottom-0 left-0 h-1 bg-green-400" animate={{width:["0%","100%"]}} transition={{duration:1, repeat: Infinity}} />}
      </div>

      {/* Answer */}
      <AnimatePresence>
        {typingAnswer && (
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="mb-4">
            <Card className="shadow-xl rounded-2xl bg-white">
              <CardHeader><CardTitle>AI Answer</CardTitle></CardHeader>
              <CardContent className="prose max-w-none text-gray-700">
                {typingAnswer}
                {diagramEnabled && selectedSubject==="chemistry" && (
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-sm">C  O{"\n"}_._Valency  _._Valency{"\n"}_._swap   _._swap</pre>
                )}
              </CardContent>
              <div className="flex justify-end p-3">
                <Button variant="outline" size="sm" onClick={handleCopy}>{copied?"Copied!":"Copy"}</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Credits Animation */}
      <div className="flex justify-center gap-4 mt-6">
        {["Ishfaq","Asim","Talha"].map((name,i)=>(
          <motion.span key={i} animate={{y:[0,-10,0], opacity:[0.5,1,0.5]}} transition={{repeat: Infinity, duration:3, delay:i*0.3}} className="text-indigo-600 font-bold text-lg">
            {name.split("").map((char,j)=>(
              <motion.span key={j} animate={{opacity:[0,1], y:[-5,0]}} transition={{delay:j*0.05}}>{char}</motion.span>
            ))}
          </motion.span>
        ))}
      </div>
    </div>
  );
    }((sub, i) => (
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
