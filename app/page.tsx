"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Send, Copy, RotateCcw, Sparkles, Check, Zap, GraduationCap, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Subjects including GK and Test AI
const SUBJECTS = [
  { 
    id: "urdu", 
    name: "Urdu", 
    color: "from-emerald-500 to-teal-600", 
    gradient: "linear-gradient(135deg, #10b981 0%, #0d9488 100%)",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-12 h-12">
        <defs>
          <linearGradient id="urduGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="35" fill="url(#urduGradient)" />
        <path fill="white" d="M40 35c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm20 0c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm-25 25c0-2.8 2.2-5 5-5s5 2.2 5 5-2.2 5-5 5-5-2.2-5-5zm25 0c0-2.8 2.2-5 5-5s5 2.2 5 5-2.2 5-5 5-5-2.2-5-5z" />
        <path fill="white" d="M50 65c-8.3 0-15-6.7-15-15s6.7-15 15-15 15 6.7 15 15-6.7 15-15 15zm0-20c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5z" />
      </svg>
    )
  },
  { 
    id: "english", 
    name: "English", 
    color: "from-blue-500 to-indigo-600", 
    gradient: "linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-12 h-12">
        <defs>
          <linearGradient id="englishGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="35" fill="url(#englishGradient)" />
        <path fill="white" d="M40 35h5v5h-5v-5zm15 0h5v5h-5v-5zm-15 10h5v5h-5v-5zm15 0h5v5h-5v-5zm-15 10h5v5h-5v-5zm15 0h5v5h-5v-5z" />
        <path fill="white" d="M50 65c-8.3 0-15-6.7-15-15s6.7-15 15-15 15 6.7 15 15-6.7 15-15 15zm0-20c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5z" />
      </svg>
    )
  },
  { id: "math", name: "Math", color: "from-rose-500 to-pink-600", gradient: "linear-gradient(135deg, #f43f5e 0%, #db2777 100%)", icon: <div className="w-12 h-12 rounded-full bg-pink-500 animate-pulse" /> },
  { id: "physics", name: "Physics", color: "from-violet-500 to-purple-600", gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", icon: <div className="w-12 h-12 rounded-full bg-violet-500 animate-pulse" /> },
  { id: "chemistry", name: "Chemistry", color: "from-amber-500 to-orange-600", gradient: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)", icon: <div className="w-12 h-12 rounded-full bg-amber-500 animate-pulse" /> },
  { id: "biology", name: "Biology", color: "from-green-500 to-emerald-600", gradient: "linear-gradient(135deg, #22c55e 0%, #059669 100%)", icon: <div className="w-12 h-12 rounded-full bg-green-500 animate-pulse" /> },
  { id: "gk", name: "General Knowledge", color: "from-yellow-400 to-orange-500", gradient: "linear-gradient(135deg, #facc15 0%, #f97316 100%)", icon: <div className="w-12 h-12 bg-yellow-400 rounded-full animate-pulse flex items-center justify-center text-white font-bold">GK</div> },
  { id: "test-ai", name: "Test AI", color: "from-gray-700 to-gray-900", gradient: "linear-gradient(135deg, #374151 0%, #111827 100%)", icon: <div className="w-12 h-12 rounded-full bg-gray-800 animate-pulse flex items-center justify-center text-white font-bold">AI</div> },
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
  "test-ai": "Ask any question you want to test AI capabilities."
};

// Prompts for AI
const SUBJECT_PROMPTS: Record<string, any> = {
  homework: {
    urdu: "You are a helpful Urdu tutor. Answer in Urdu script under 3 sentences.",
    english: "You are a helpful English tutor. Answer under 3 sentences.",
    math: "You are a math tutor. Solve step by step (under 4 steps).",
    physics: "Explain physics simply under 3 sentences.",
    chemistry: "Explain chemistry briefly under 3 sentences.",
    biology: "Explain biology briefly under 3 sentences.",
    gk: "Answer general knowledge questions briefly under 3 sentences.",
    "test-ai": "Answer AI test questions briefly."
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

export default function HomeworkHelper() {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [mode, setMode] = useState<"homework" | "exam">("homework");
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setQuestion(SAMPLE_QUESTIONS[subjectId] || "");
    setAnswer("");
    setError(null);
  };

  const getGeminiResponse = async (userQuestion: string, subject: string) => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) throw new Error("API key missing.");
    const prompt = `${SUBJECT_PROMPTS[mode][subject]}\n\nQuestion: ${userQuestion}\nAnswer:`;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents:[{parts:[{text: prompt}]}] }) }
    );
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || "AI failed");
    }
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";
  };

  const handleSubmit = async () => {
    if (!selectedSubject || !question.trim()) {
      setError("Select subject and enter question");
      return;
    }

    // Restrictions in homework mode
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
    setError(null);
    setAnswer("");

    try {
      const aiResponse = await getGeminiResponse(question, selectedSubject);
      setAnswer(aiResponse.trim());
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

  const handleRetry = () => { if (question) handleSubmit(); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.header initial={{ opacity:0,y:-30 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.6 }} className="text-center mb-8">
          <motion.div initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ delay:0.2,type:"spring",stiffness:300 }} className="flex items-center justify-center gap-3 mb-3">
            <motion.div animate={{ rotate:360 }} transition={{ duration:8, repeat:Infinity, ease:"linear" }}><Sparkles className="text-indigo-600" size={32} /></motion.div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI Homework Helper</h1>
          </motion.div>
          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }} className="text-gray-600 max-w-md mx-auto">
            Get instant, concise answers to your homework questions
          </motion.p>
        </motion.header>

        {/* Subject Selection */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.2 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><BookOpen className="text-indigo-600" size={20} /><h2 className="text-lg font-semibold text-gray-800">Select Subject</h2></div>
            <div className="flex gap-2">
              <Button variant={mode==="homework"?"default":"outline"} size="sm" onClick={()=>setMode("homework")} className="flex items-center gap-1"><GraduationCap size={16} />Homework</Button>
              <Button variant={mode==="exam"?"default":"outline"} size="sm" onClick={()=>setMode("exam")} className="flex items-center gap-1"><Timer size={16} />Exam Prep</Button>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {SUBJECTS.map((subject,index)=>(
              <motion.div key={subject.id} initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{duration:0.3,delay:0.05*index}} whileHover={{y:-8}} onHoverStart={()=>setHoveredSubject(subject.id)} onHoverEnd={()=>setHoveredSubject(null)}>
                <Card className={cn("cursor-pointer transition-all duration-300 border-0 shadow-md hover:shadow-lg", selectedSubject===subject.id?"ring-2 ring-indigo-500 bg-indigo-50":"hover:bg-gray-50")} onClick={()=>handleSubjectSelect(subject.id)}>
                  <CardContent className="p-4 flex flex-col items-center">
                    <motion.div animate={hoveredSubject===subject.id?{scale:[1,1.1,1],rotate:[0,5,-5,0]}:{}} transition={{duration:0.5,repeat:hoveredSubject===subject.id?Infinity:0}} className="w-14 h-14 rounded-xl flex items-center justify-center mb-2" style={{background:subject.gradient}}>
                      {subject.icon}
                    </motion.div>
                    <span className="text-xs font-medium text-gray-700 text-center">{subject.name}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Question */}
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{duration:0.5,delay:0.3}} className="mb-6">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-gray-800"><Send className="text-indigo-600" size={20} /><span className="text-lg">Your Question</span></CardTitle>
                <span className={`text-xs font-medium px-2 py-1 rounded ${question.length>450?'bg-red-100 text-red-700':'bg-gray-100 text-gray-700'}`}>{question.length}/500</span>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea value={question} onChange={(e)=>setQuestion(e.target.value)} placeholder={`Enter your ${mode} question here...`} className="min-h-[120px] resize-none border-gray-200 focus:ring-1 focus:ring-indigo-500 text-gray-700" maxLength={500}/>
            </CardContent>
          </Card>
        </motion.div>

        {/* Submit / Retry */}
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{duration:0.5,delay:0.4}} className="flex flex-col sm:flex-row gap-3 mb-8">
          <Button onClick={handleSubmit} disabled={isLoading} className="flex-1 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
            {isLoading ? <motion.div animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:"linear"}} className="flex items-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" /><span>Thinking...</span></motion.div> : <div className="flex items-center"><Zap className="mr-2" size={20} />Get {mode==="exam"?"Exam-Focused":"Homework"} Answer</div>}
          </Button>
          {error && <Button variant="outline" onClick={handleRetry} className="flex items-center border-indigo-300 text-indigo-700 hover:bg-indigo-50"><RotateCcw className="mr-2" size={16}/>Retry</Button>}
        </motion.div>
       
        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 rounded bg-red-100 text-red-700"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer Display */}
        {answer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Check className="text-green-600" size={20} />
                  AI Answer
                </CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none text-gray-700">
                {answer}
              </CardContent>
              <div className="flex justify-end p-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={handleCopy}
                >
                  {copied ? "Copied!" : "Copy"}
                  <Copy size={16} />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}