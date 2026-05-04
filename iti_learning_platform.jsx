import { useState, useEffect, useRef, useCallback } from "react";

const TRADES = [
  { id: "electrician", name: "Electrician", icon: "⚡", color: "#F59E0B", lessons: 12, enrolled: 234 },
  { id: "fitter", name: "Fitter", icon: "🔧", color: "#3B82F6", lessons: 15, enrolled: 189 },
  { id: "welder", name: "Welder", icon: "🔥", color: "#EF4444", lessons: 10, enrolled: 156 },
  { id: "turner", name: "Turner", icon: "⚙️", color: "#8B5CF6", lessons: 11, enrolled: 142 },
  { id: "copa", name: "COPA", icon: "💻", color: "#10B981", lessons: 18, enrolled: 267 },
  { id: "plumber", name: "Plumber", icon: "🔩", color: "#06B6D4", lessons: 9, enrolled: 98 },
];

const INITIAL_LESSONS = {
  electrician: [
    { id: "e1", title: "Basic Electrical Theory", type: "video", duration: "45 min", content: "https://www.youtube.com/embed/mc979OhitAg", description: "Ohm's Law, voltage, current, resistance fundamentals." },
    { id: "e2", title: "Safety Standards Manual", type: "pdf", duration: "30 min", content: "https://www.africau.edu/images/default/sample.pdf", description: "IS:732 electrical safety guidelines for ITI students." },
    { id: "e3", title: "Wiring Diagram Reference", type: "image", duration: "20 min", content: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Single-line_diagram.svg/800px-Single-line_diagram.svg.png", description: "Standard house wiring diagrams and symbols." },
    { id: "e4", title: "AC/DC Circuits", type: "video", duration: "55 min", content: "https://www.youtube.com/embed/X4EITSQSPkk", description: "Series and parallel circuits explained with examples." },
    { id: "e5", title: "Motor Winding Basics", type: "pdf", duration: "40 min", content: "https://www.africau.edu/images/default/sample.pdf", description: "Single-phase and three-phase motor winding techniques." },
  ],
  fitter: [
    { id: "f1", title: "Measurement & Gauging", type: "video", duration: "50 min", content: "https://www.youtube.com/embed/JL9gK20lGYM", description: "Using vernier caliper, micrometer, and other precision tools." },
    { id: "f2", title: "Blueprint Reading", type: "pdf", duration: "35 min", content: "https://www.africau.edu/images/default/sample.pdf", description: "Engineering drawing symbols and interpretation." },
    { id: "f3", title: "Lathe Operations", type: "video", duration: "60 min", content: "https://www.youtube.com/embed/pvVJFsWp6f4", description: "Turning, facing, and threading on lathe machine." },
  ],
  copa: [
    { id: "c1", title: "Operating System Basics", type: "video", duration: "45 min", content: "https://www.youtube.com/embed/26QPDBe-NB8", description: "Windows and Linux OS fundamentals for beginners." },
    { id: "c2", title: "MS Office Complete Guide", type: "pdf", duration: "50 min", content: "https://www.africau.edu/images/default/sample.pdf", description: "Word, Excel, PowerPoint practical exercises." },
    { id: "c3", title: "Internet & Networking", type: "video", duration: "40 min", content: "https://www.youtube.com/embed/3QhU9jd03a0", description: "Basic networking concepts and internet usage." },
  ],
  welder: [
    { id: "w1", title: "Arc Welding Fundamentals", type: "video", duration: "55 min", content: "https://www.youtube.com/embed/oAR1UdJSKhg", description: "SMAW process, electrode selection, joint preparation." },
    { id: "w2", title: "Welding Safety Manual", type: "pdf", duration: "25 min", content: "https://www.africau.edu/images/default/sample.pdf", description: "PPE requirements and hazard precautions." },
  ],
  turner: [
    { id: "t1", title: "Center Lathe Operations", type: "video", duration: "60 min", content: "https://www.youtube.com/embed/pvVJFsWp6f4", description: "Setting up and operating a center lathe machine." },
    { id: "t2", title: "Grinding Operations", type: "pdf", duration: "35 min", content: "https://www.africau.edu/images/default/sample.pdf", description: "Surface and cylindrical grinding techniques." },
  ],
  plumber: [
    { id: "p1", title: "Pipe Fitting Basics", type: "video", duration: "40 min", content: "https://www.youtube.com/embed/example", description: "Types of pipes, fittings, and joining methods." },
    { id: "p2", title: "Plumbing Drawing", type: "pdf", duration: "30 min", content: "https://www.africau.edu/images/default/sample.pdf", description: "Reading plumbing layout drawings and schematics." },
  ],
};

const QUIZZES = {
  electrician: [
    {
      id: "eq1", title: "Basic Electrical Theory", lessonId: "e1", timeLimit: 600,
      questions: [
        { id: 1, q: "Ohm's Law states that V = ?", options: ["I × R", "I / R", "I + R", "I - R"], answer: 0, explanation: "Voltage = Current × Resistance (V = I × R)" },
        { id: 2, q: "The unit of electrical resistance is:", options: ["Ampere", "Volt", "Ohm", "Watt"], answer: 2, explanation: "Resistance is measured in Ohms (Ω), named after Georg Ohm." },
        { id: 3, q: "Which of the following is a conductor?", options: ["Rubber", "Glass", "Copper", "Wood"], answer: 2, explanation: "Copper is an excellent electrical conductor due to its low resistivity." },
        { id: 4, q: "What does 'EMF' stand for in electrical terms?", options: ["Electromotive Force", "Electrical Magnetic Field", "Energy Measurement Factor", "Electronic Motor Function"], answer: 0, explanation: "EMF stands for Electromotive Force, the energy per charge supplied by a source." },
        { id: 5, q: "In a parallel circuit, the voltage across each component is:", options: ["Different", "The same", "Zero", "Double"], answer: 1, explanation: "In a parallel circuit, all components share the same voltage." },
      ]
    },
    {
      id: "eq2", title: "AC/DC Circuits", lessonId: "e4", timeLimit: 480,
      questions: [
        { id: 1, q: "AC stands for:", options: ["Alternating Current", "Adjusted Current", "Applied Current", "Active Circuit"], answer: 0, explanation: "AC means Alternating Current, which periodically reverses direction." },
        { id: 2, q: "Frequency of AC supply in India is:", options: ["50 Hz", "60 Hz", "100 Hz", "25 Hz"], answer: 0, explanation: "India uses 50 Hz AC frequency (50 cycles per second)." },
        { id: 3, q: "In a series circuit, the current through each component is:", options: ["Different", "Zero", "The same", "Doubled"], answer: 2, explanation: "In a series circuit, the same current flows through all components." },
      ]
    }
  ],
  copa: [
    {
      id: "cq1", title: "Operating System Quiz", lessonId: "c1", timeLimit: 480,
      questions: [
        { id: 1, q: "OS stands for:", options: ["Optional Software", "Operating System", "Output Source", "Open Service"], answer: 1, explanation: "OS stands for Operating System, the main system software." },
        { id: 2, q: "Which is NOT an Operating System?", options: ["Windows", "Linux", "Android", "Chrome Browser"], answer: 3, explanation: "Chrome Browser is an application, not an OS." },
        { id: 3, q: "The brain of a computer is:", options: ["RAM", "Hard Disk", "CPU", "Monitor"], answer: 2, explanation: "CPU (Central Processing Unit) is the brain of the computer." },
        { id: 4, q: "RAM stands for:", options: ["Random Access Memory", "Read Access Module", "Rapid Array Memory", "Remote Access Machine"], answer: 0, explanation: "RAM is Random Access Memory, temporary working memory." },
      ]
    }
  ],
  fitter: [
    {
      id: "fq1", title: "Measurement Tools Quiz", lessonId: "f1", timeLimit: 540,
      questions: [
        { id: 1, q: "Least count of a vernier caliper is typically:", options: ["0.1 mm", "0.01 mm", "0.001 mm", "1 mm"], answer: 1, explanation: "Standard vernier calipers have a least count of 0.02 mm or 0.05 mm, commonly 0.02 mm." },
        { id: 2, q: "A micrometer screw gauge measures:", options: ["Length only", "Very small dimensions", "Angles", "Weight"], answer: 1, explanation: "Micrometer measures very small dimensions with high precision (0.01 mm or 0.001 mm)." },
        { id: 3, q: "Dial gauge is used for:", options: ["Measuring angles", "Checking flatness and runout", "Measuring weight", "Drilling holes"], answer: 1, explanation: "Dial gauge is used for checking flatness, runout, and comparative measurements." },
      ]
    }
  ],
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const getFileIcon = (type) => {
  if (type === "video") return "▶";
  if (type === "pdf") return "📄";
  if (type === "image") return "🖼";
  return "📁";
};

const getTypeColor = (type) => {
  if (type === "video") return { bg: "#1D4ED8", text: "#fff" };
  if (type === "pdf") return { bg: "#DC2626", text: "#fff" };
  if (type === "image") return { bg: "#059669", text: "#fff" };
  return { bg: "#7C3AED", text: "#fff" };
};

export default function ITILearningPlatform() {
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizState, setQuizState] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [lessons, setLessons] = useState(INITIAL_LESSONS);
  const [quizzes, setQuizzes] = useState(QUIZZES);
  const [uploadView, setUploadView] = useState("list");
  const [uploadForm, setUploadForm] = useState({ title: "", trade: "electrician", type: "video", description: "", file: null });
  const [uploads, setUploads] = useState([]);
  const [progress, setProgress] = useState({});
  const [quizTab, setQuizTab] = useState("take");
  const [newQuiz, setNewQuiz] = useState({ title: "", trade: "electrician", lessonId: "", timeLimit: 600, questions: [] });
  const [newQuestion, setNewQuestion] = useState({ q: "", options: ["", "", "", ""], answer: 0, explanation: "" });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  const showNotification = useCallback((msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("iti_progress");
    if (saved) setProgress(JSON.parse(saved));
  }, []);

  const markComplete = (tradeId, lessonId) => {
    const updated = { ...progress, [`${tradeId}_${lessonId}`]: true };
    setProgress(updated);
    localStorage.setItem("iti_progress", JSON.stringify(updated));
    showNotification("Lesson marked as complete!");
  };

  useEffect(() => {
    if (quizState?.running) {
      timerRef.current = setInterval(() => {
        setQuizState(prev => {
          if (!prev || prev.timeLeft <= 1) {
            clearInterval(timerRef.current);
            finishQuiz(prev);
            return { ...prev, running: false, timeLeft: 0 };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [quizState?.running]);

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setQuizResult(null);
    setQuizState({
      currentQ: 0,
      answers: Array(quiz.questions.length).fill(null),
      timeLeft: quiz.timeLimit,
      running: true,
      showExplanation: false,
    });
  };

  const answerQuestion = (optionIndex) => {
    setQuizState(prev => {
      const newAnswers = [...prev.answers];
      newAnswers[prev.currentQ] = optionIndex;
      return { ...prev, answers: newAnswers };
    });
  };

  const nextQuestion = () => {
    setQuizState(prev => {
      const isLast = prev.currentQ === activeQuiz.questions.length - 1;
      if (isLast) {
        clearInterval(timerRef.current);
        const result = calcResult({ ...prev });
        setQuizResult(result);
        return { ...prev, running: false };
      }
      return { ...prev, currentQ: prev.currentQ + 1, showExplanation: false };
    });
  };

  const calcResult = (state) => {
    let correct = 0;
    activeQuiz.questions.forEach((q, i) => {
      if (state.answers[i] === q.answer) correct++;
    });
    return { correct, total: activeQuiz.questions.length, percentage: Math.round((correct / activeQuiz.questions.length) * 100) };
  };

  const finishQuiz = (state) => {
    if (!state || !activeQuiz) return;
    const result = calcResult(state);
    setQuizResult(result);
    showNotification(`Quiz completed! Score: ${result.percentage}%`);
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    const entry = {
      id: Date.now().toString(),
      ...uploadForm,
      fileName: file.name,
      fileSize: (file.size / 1024).toFixed(1) + " KB",
      date: new Date().toLocaleDateString("en-IN"),
      url: URL.createObjectURL(file),
    };
    setUploads(prev => [entry, ...prev]);
    const newLesson = {
      id: `upload_${entry.id}`,
      title: entry.title || file.name,
      type: entry.type,
      duration: "—",
      content: entry.url,
      description: entry.description,
    };
    setLessons(prev => ({
      ...prev,
      [entry.trade]: [...(prev[entry.trade] || []), newLesson],
    }));
    setUploadForm({ title: "", trade: "electrician", type: "video", description: "", file: null });
    setUploadView("list");
    showNotification("Content uploaded successfully!");
  };

  const addQuizQuestion = () => {
    if (!newQuestion.q || newQuestion.options.some(o => !o)) {
      showNotification("Fill all question fields", "error"); return;
    }
    setNewQuiz(prev => ({ ...prev, questions: [...prev.questions, { ...newQuestion, id: Date.now() }] }));
    setNewQuestion({ q: "", options: ["", "", "", ""], answer: 0, explanation: "" });
  };

  const saveQuiz = () => {
    if (!newQuiz.title || newQuiz.questions.length === 0) {
      showNotification("Add title and at least one question", "error"); return;
    }
    const q = { ...newQuiz, id: `custom_${Date.now()}` };
    setQuizzes(prev => ({ ...prev, [newQuiz.trade]: [...(prev[newQuiz.trade] || []), q] }));
    setNewQuiz({ title: "", trade: "electrician", lessonId: "", timeLimit: 600, questions: [] });
    showNotification("Quiz created!");
    setQuizTab("take");
  };

  const allLessons = Object.entries(lessons).flatMap(([trade, ls]) => ls.map(l => ({ ...l, trade })));
  const filteredLessons = searchQuery ? allLessons.filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.trade.toLowerCase().includes(searchQuery.toLowerCase())) : [];

  const totalLessons = Object.values(lessons).reduce((a, b) => a + b.length, 0);
  const completedCount = Object.keys(progress).filter(k => progress[k]).length;
  const totalQuizzes = Object.values(quizzes).reduce((a, b) => a + b.length, 0);

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: "⊞" },
    { id: "subjects", label: "Subjects", icon: "📚" },
    { id: "lessons", label: "All Lessons", icon: "▶" },
    { id: "quiz", label: "Tests & Quizzes", icon: "✏" },
    { id: "upload", label: "Upload Content", icon: "↑" },
    { id: "progress", label: "My Progress", icon: "◉" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0F172A", fontFamily: "'Barlow', 'Segoe UI', sans-serif", color: "#E2E8F0", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700;800&family=Barlow+Condensed:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #1E293B; } ::-webkit-scrollbar-thumb { background: #F97316; border-radius: 4px; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.15s; color: #94A3B8; }
        .nav-item:hover { background: #1E293B; color: #F97316; }
        .nav-item.active { background: #F97316; color: #fff; }
        .card { background: #1E293B; border-radius: 12px; border: 1px solid #334155; }
        .btn-primary { background: #F97316; color: #fff; border: none; padding: 8px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: 'Barlow', sans-serif; }
        .btn-primary:hover { background: #EA6B0E; transform: translateY(-1px); }
        .btn-secondary { background: transparent; color: #94A3B8; border: 1px solid #334155; padding: 8px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.15s; font-family: 'Barlow', sans-serif; }
        .btn-secondary:hover { border-color: #F97316; color: #F97316; }
        .stat-card { background: #1E293B; border-radius: 12px; border: 1px solid #334155; padding: 20px; }
        .lesson-item { background: #1E293B; border: 1px solid #334155; border-radius: 10px; padding: 14px 16px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 14px; }
        .lesson-item:hover { border-color: #F97316; transform: translateX(4px); }
        .quiz-option { background: #0F172A; border: 2px solid #334155; border-radius: 10px; padding: 14px 18px; cursor: pointer; transition: all 0.15s; font-size: 15px; }
        .quiz-option:hover { border-color: #F97316; }
        .quiz-option.selected { border-color: #F97316; background: rgba(249,115,22,0.1); }
        .quiz-option.correct { border-color: #22C55E; background: rgba(34,197,94,0.15); }
        .quiz-option.wrong { border-color: #EF4444; background: rgba(239,68,68,0.15); }
        .tag { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.5px; text-transform: uppercase; }
        .input-field { background: #0F172A; border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; color: #E2E8F0; font-size: 14px; width: 100%; outline: none; font-family: 'Barlow', sans-serif; }
        .input-field:focus { border-color: #F97316; }
        .input-field option { background: #1E293B; }
        .drop-zone { border: 2px dashed #334155; border-radius: 12px; padding: 48px 24px; text-align: center; cursor: pointer; transition: all 0.2s; }
        .drop-zone:hover, .drop-zone.drag-over { border-color: #F97316; background: rgba(249,115,22,0.05); }
        .tab-btn { padding: 8px 20px; border-radius: 8px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: 'Barlow', sans-serif; }
        .trade-card { background: #1E293B; border: 1px solid #334155; border-radius: 14px; padding: 20px; cursor: pointer; transition: all 0.2s; }
        .trade-card:hover { transform: translateY(-4px); border-color: #F97316; }
        .progress-bar-wrap { background: #0F172A; border-radius: 100px; height: 8px; overflow: hidden; }
        .progress-bar-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, #F97316, #FBBF24); transition: width 0.5s ease; }
        .notification { position: fixed; top: 20px; right: 20px; z-index: 999; padding: 12px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; animation: slideIn 0.3s ease; }
        @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .content-viewer { width: 100%; border-radius: 10px; background: #000; }
        label { font-size: 12px; color: #94A3B8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px; }
        .section-title { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 700; color: #F1F5F9; letter-spacing: 0.5px; }
      `}</style>

      {notification && (
        <div className="notification" style={{ background: notification.type === "error" ? "#DC2626" : "#16A34A", color: "#fff" }}>
          {notification.type === "error" ? "✗" : "✓"} {notification.msg}
        </div>
      )}

      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? 220 : 60, background: "#0A1628", borderRight: "1px solid #1E293B", display: "flex", flexDirection: "column", transition: "width 0.25s", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid #1E293B", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <div style={{ width: 36, height: 36, background: "#F97316", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>⚙</div>
          {sidebarOpen && <div><div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: 1 }}>ITI VIDYA</div><div style={{ fontSize: 10, color: "#64748B", letterSpacing: 0.5 }}>LEARNING PORTAL</div></div>}
        </div>
        <nav style={{ padding: "12px 8px", flex: 1 }}>
          {NAV.map(n => (
            <div key={n.id} className={`nav-item ${activeView === n.id ? "active" : ""}`} onClick={() => { setActiveView(n.id); setSelectedTrade(null); setSelectedLesson(null); setActiveQuiz(null); }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{n.icon}</span>
              {sidebarOpen && <span style={{ whiteSpace: "nowrap" }}>{n.label}</span>}
            </div>
          ))}
        </nav>
        {sidebarOpen && (
          <div style={{ padding: "16px", borderTop: "1px solid #1E293B" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#F97316", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15 }}>S</div>
              <div><div style={{ fontSize: 13, fontWeight: 600 }}>Student</div><div style={{ fontSize: 11, color: "#64748B" }}>Electrician Trade</div></div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ background: "#0A1628", borderBottom: "1px solid #1E293B", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 700, color: "#F1F5F9" }}>
              {activeView === "dashboard" && "Dashboard"}
              {activeView === "subjects" && (selectedTrade ? (selectedLesson ? selectedLesson.title : TRADES.find(t => t.id === selectedTrade)?.name + " — Lessons") : "All Subjects")}
              {activeView === "lessons" && "All Lessons"}
              {activeView === "quiz" && (activeQuiz ? activeQuiz.title : "Tests & Quizzes")}
              {activeView === "upload" && "Upload Content"}
              {activeView === "progress" && "My Progress"}
            </div>
            <div style={{ fontSize: 12, color: "#64748B" }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input className="input-field" style={{ width: 220 }} placeholder="🔍 Search lessons..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={() => setActiveView("lessons")} />
          </div>
        </div>

        <div style={{ flex: 1, padding: "24px 28px", overflow: "auto" }}>

          {/* ── DASHBOARD ── */}
          {activeView === "dashboard" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
                {[
                  { label: "Total Lessons", value: totalLessons, icon: "▶", color: "#3B82F6" },
                  { label: "Completed", value: completedCount, icon: "✓", color: "#22C55E" },
                  { label: "Total Quizzes", value: totalQuizzes, icon: "✏", color: "#F97316" },
                  { label: "Subjects", value: TRADES.length, icon: "📚", color: "#8B5CF6" },
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div><div style={{ fontSize: 12, color: "#64748B", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div><div style={{ fontSize: 32, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", color: "#F1F5F9" }}>{s.value}</div></div>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: s.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{s.icon}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                <div className="card" style={{ padding: 20 }}>
                  <div className="section-title" style={{ marginBottom: 16, fontSize: 16 }}>Quick Access — Trades</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {TRADES.map(t => (
                      <div key={t.id} onClick={() => { setSelectedTrade(t.id); setActiveView("subjects"); }} style={{ padding: "12px 14px", background: "#0F172A", borderRadius: 10, border: "1px solid #334155", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s" }} onMouseEnter={e => e.currentTarget.style.borderColor = t.color} onMouseLeave={e => e.currentTarget.style.borderColor = "#334155"}>
                        <span style={{ fontSize: 22 }}>{t.icon}</span>
                        <div><div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div><div style={{ fontSize: 11, color: "#64748B" }}>{(lessons[t.id] || []).length} lessons</div></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card" style={{ padding: 20 }}>
                  <div className="section-title" style={{ marginBottom: 16, fontSize: 16 }}>Progress Overview</div>
                  {TRADES.map(t => {
                    const total = (lessons[t.id] || []).length;
                    const done = (lessons[t.id] || []).filter(l => progress[`${t.id}_${l.id}`]).length;
                    const pct = total ? Math.round((done / total) * 100) : 0;
                    return (
                      <div key={t.id} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, color: "#94A3B8" }}>{t.icon} {t.name}</span>
                          <span style={{ fontSize: 12, color: "#F97316", fontWeight: 600 }}>{done}/{total}</span>
                        </div>
                        <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: `${pct}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card" style={{ padding: 20 }}>
                <div className="section-title" style={{ marginBottom: 16, fontSize: 16 }}>Recent Uploads</div>
                {uploads.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px", color: "#64748B", fontSize: 14 }}>No uploads yet. <span style={{ color: "#F97316", cursor: "pointer" }} onClick={() => setActiveView("upload")}>Upload content →</span></div>
                ) : (
                  uploads.slice(0, 4).map(u => (
                    <div key={u.id} className="lesson-item" style={{ marginBottom: 8 }}>
                      <span style={{ ...getTypeColor(u.type), padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{u.type.toUpperCase()}</span>
                      <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600 }}>{u.title}</div><div style={{ fontSize: 12, color: "#64748B" }}>{TRADES.find(t => t.id === u.trade)?.name} • {u.date}</div></div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── SUBJECTS ── */}
          {activeView === "subjects" && !selectedTrade && (
            <div>
              <div style={{ marginBottom: 20 }}><p style={{ color: "#64748B", fontSize: 14 }}>Select a trade to view lessons, quizzes, and study material.</p></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {TRADES.map(t => {
                  const total = (lessons[t.id] || []).length;
                  const done = (lessons[t.id] || []).filter(l => progress[`${t.id}_${l.id}`]).length;
                  return (
                    <div key={t.id} className="trade-card" onClick={() => setSelectedTrade(t.id)}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>{t.icon}</div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{t.name}</div>
                      <div style={{ fontSize: 13, color: "#64748B", marginBottom: 14 }}>{total} lessons • {t.enrolled} students</div>
                      <div className="progress-bar-wrap" style={{ marginBottom: 10 }}>
                        <div className="progress-bar-fill" style={{ width: `${total ? Math.round((done / total) * 100) : 0}%` }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                        <span style={{ color: "#64748B" }}>{done} completed</span>
                        <span style={{ color: t.color, fontWeight: 700 }}>Open →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeView === "subjects" && selectedTrade && !selectedLesson && (
            <div>
              <button className="btn-secondary" style={{ marginBottom: 20, fontSize: 13 }} onClick={() => setSelectedTrade(null)}>← Back to Subjects</button>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
                <div>
                  <div className="section-title" style={{ marginBottom: 14 }}>Lessons</div>
                  {(lessons[selectedTrade] || []).map((l, i) => {
                    const done = progress[`${selectedTrade}_${l.id}`];
                    const tc = getTypeColor(l.type);
                    return (
                      <div key={l.id} className="lesson-item" style={{ marginBottom: 10, opacity: 1 }} onClick={() => setSelectedLesson({ ...l, trade: selectedTrade })}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: tc.bg + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{getFileIcon(l.type)}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: done ? "#22C55E" : "#F1F5F9" }}>{l.title} {done && "✓"}</div>
                          <div style={{ fontSize: 12, color: "#64748B" }}>{l.description}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                          <span className="tag" style={{ background: tc.bg, color: tc.text }}>{l.type}</span>
                          <span style={{ fontSize: 11, color: "#64748B" }}>{l.duration}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <div className="section-title" style={{ marginBottom: 14 }}>Quizzes</div>
                  {(quizzes[selectedTrade] || []).map(q => (
                    <div key={q.id} className="card" style={{ padding: 16, marginBottom: 10 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{q.title}</div>
                      <div style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>{q.questions.length} questions • {formatTime(q.timeLimit)}</div>
                      <button className="btn-primary" style={{ fontSize: 13, padding: "6px 16px" }} onClick={() => { setActiveQuiz(q); setActiveView("quiz"); startQuiz(q); }}>Start Quiz</button>
                    </div>
                  ))}
                  {!(quizzes[selectedTrade] || []).length && <div style={{ color: "#64748B", fontSize: 13, padding: 16, background: "#1E293B", borderRadius: 10 }}>No quizzes yet for this trade.</div>}
                </div>
              </div>
            </div>
          )}

          {activeView === "subjects" && selectedTrade && selectedLesson && (
            <LessonViewer lesson={selectedLesson} onBack={() => setSelectedLesson(null)} onComplete={() => markComplete(selectedLesson.trade, selectedLesson.id)} isComplete={!!progress[`${selectedLesson.trade}_${selectedLesson.id}`]} />
          )}

          {/* ── ALL LESSONS ── */}
          {activeView === "lessons" && (
            <div>
              <div style={{ marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {["all", ...TRADES.map(t => t.id)].map(f => (
                  <button key={f} className="tab-btn" style={{ background: "#1E293B", color: "#94A3B8", border: "1px solid #334155", padding: "6px 16px" }} onClick={() => setSearchQuery(f === "all" ? "" : f)}>{f === "all" ? "All" : TRADES.find(t => t.id === f)?.name}</button>
                ))}
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {(searchQuery ? filteredLessons : allLessons).map(l => {
                  const tc = getTypeColor(l.type);
                  const trade = TRADES.find(t => t.id === l.trade);
                  const done = progress[`${l.trade}_${l.id}`];
                  return (
                    <div key={l.id} className="lesson-item" onClick={() => { setSelectedTrade(l.trade); setSelectedLesson(l); setActiveView("subjects"); }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: tc.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{getFileIcon(l.type)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: done ? "#22C55E" : "#F1F5F9" }}>{l.title} {done && "✓"}</div>
                        <div style={{ fontSize: 12, color: "#64748B" }}>{l.description}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 12, background: trade?.color + "22", color: trade?.color, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>{trade?.name}</span>
                        <span className="tag" style={{ background: tc.bg, color: tc.text }}>{l.type}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── QUIZ ── */}
          {activeView === "quiz" && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <button className="tab-btn" style={{ background: quizTab === "take" ? "#F97316" : "#1E293B", color: quizTab === "take" ? "#fff" : "#94A3B8", border: "1px solid " + (quizTab === "take" ? "#F97316" : "#334155") }} onClick={() => { setQuizTab("take"); setActiveQuiz(null); setQuizResult(null); setQuizState(null); }}>Take Quiz</button>
                <button className="tab-btn" style={{ background: quizTab === "create" ? "#F97316" : "#1E293B", color: quizTab === "create" ? "#fff" : "#94A3B8", border: "1px solid " + (quizTab === "create" ? "#F97316" : "#334155") }} onClick={() => setQuizTab("create")}>Create Quiz</button>
              </div>

              {quizTab === "take" && !activeQuiz && (
                <div>
                  {TRADES.map(t => {
                    const qs = quizzes[t.id] || [];
                    if (!qs.length) return null;
                    return (
                      <div key={t.id} style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: t.color, marginBottom: 10 }}>{t.icon} {t.name}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                          {qs.map(q => (
                            <div key={q.id} className="card" style={{ padding: 18 }}>
                              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{q.title}</div>
                              <div style={{ fontSize: 13, color: "#64748B", marginBottom: 14 }}>{q.questions.length} questions • Time: {formatTime(q.timeLimit)}</div>
                              <button className="btn-primary" onClick={() => startQuiz(q)}>▶ Start Test</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {quizTab === "take" && activeQuiz && !quizResult && quizState && (
                <QuizEngine quiz={activeQuiz} state={quizState} onAnswer={answerQuestion} onNext={nextQuestion} />
              )}

              {quizTab === "take" && quizResult && (
                <QuizResult result={quizResult} quiz={activeQuiz} state={quizState} onRetry={() => startQuiz(activeQuiz)} onBack={() => { setActiveQuiz(null); setQuizResult(null); setQuizState(null); }} />
              )}

              {quizTab === "create" && (
                <CreateQuiz newQuiz={newQuiz} setNewQuiz={setNewQuiz} newQuestion={newQuestion} setNewQuestion={setNewQuestion} addQuestion={addQuizQuestion} saveQuiz={saveQuiz} lessons={lessons} />
              )}
            </div>
          )}

          {/* ── UPLOAD ── */}
          {activeView === "upload" && (
            <UploadContent uploadForm={uploadForm} setUploadForm={setUploadForm} uploads={uploads} onUpload={handleFileUpload} uploadView={uploadView} setUploadView={setUploadView} fileInputRef={fileInputRef} />
          )}

          {/* ── PROGRESS ── */}
          {activeView === "progress" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
                <div className="stat-card" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 48, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", color: "#F97316" }}>{completedCount}</div>
                  <div style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>Lessons Completed</div>
                </div>
                <div className="stat-card" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 48, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", color: "#3B82F6" }}>{totalLessons - completedCount}</div>
                  <div style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>Remaining</div>
                </div>
                <div className="stat-card" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 48, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", color: "#22C55E" }}>{totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0}%</div>
                  <div style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>Overall Progress</div>
                </div>
              </div>
              {TRADES.map(t => {
                const ls = lessons[t.id] || [];
                const done = ls.filter(l => progress[`${t.id}_${l.id}`]).length;
                const pct = ls.length ? Math.round((done / ls.length) * 100) : 0;
                return (
                  <div key={t.id} className="card" style={{ padding: 20, marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ fontSize: 28 }}>{t.icon}</span>
                        <div><div style={{ fontWeight: 700, fontSize: 16 }}>{t.name}</div><div style={{ fontSize: 12, color: "#64748B" }}>{done} of {ls.length} completed</div></div>
                      </div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 700, color: pct === 100 ? "#22C55E" : "#F97316" }}>{pct}%</div>
                    </div>
                    <div className="progress-bar-wrap" style={{ marginBottom: 14 }}><div className="progress-bar-fill" style={{ width: `${pct}%` }} /></div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
                      {ls.map(l => (
                        <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#0F172A", borderRadius: 8, border: "1px solid " + (progress[`${t.id}_${l.id}`] ? "#22C55E44" : "#334155") }}>
                          <span style={{ fontSize: 14, color: progress[`${t.id}_${l.id}`] ? "#22C55E" : "#334155" }}>{progress[`${t.id}_${l.id}`] ? "✓" : "○"}</span>
                          <span style={{ fontSize: 12, color: progress[`${t.id}_${l.id}`] ? "#22C55E" : "#94A3B8" }}>{l.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function LessonViewer({ lesson, onBack, onComplete, isComplete }) {
  return (
    <div>
      <button className="btn-secondary" style={{ marginBottom: 20, fontSize: 13 }} onClick={onBack}>← Back to Lessons</button>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <div>
          <div style={{ background: "#000", borderRadius: 12, overflow: "hidden", marginBottom: 16, border: "1px solid #334155" }}>
            {lesson.type === "video" && (
              <iframe src={lesson.content} style={{ width: "100%", height: 380, border: "none" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={lesson.title} />
            )}
            {lesson.type === "pdf" && (
              <iframe src={lesson.content} style={{ width: "100%", height: 500, border: "none" }} title={lesson.title} />
            )}
            {lesson.type === "image" && (
              <img src={lesson.content} alt={lesson.title} style={{ width: "100%", maxHeight: 460, objectFit: "contain", background: "#111" }} />
            )}
          </div>
          <div style={{ background: "#1E293B", borderRadius: 12, padding: 20, border: "1px solid #334155" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ fontSize: 22, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, marginBottom: 8 }}>{lesson.title}</h2>
                <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.6 }}>{lesson.description}</p>
              </div>
              <div style={{ ...getTypeColor(lesson.type), padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{lesson.type.toUpperCase()}</div>
            </div>
          </div>
        </div>
        <div>
          <div style={{ background: "#1E293B", borderRadius: 12, padding: 20, border: "1px solid #334155" }}>
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Lesson Details</div>
            {[["Type", lesson.type.toUpperCase()], ["Duration", lesson.duration], ["Trade", lesson.trade.toUpperCase()]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #0F172A", fontSize: 14 }}>
                <span style={{ color: "#64748B" }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 20 }}>
              {isComplete ? (
                <div style={{ background: "#16A34A22", border: "1px solid #22C55E44", borderRadius: 8, padding: "12px 16px", color: "#22C55E", fontSize: 14, fontWeight: 600, textAlign: "center" }}>✓ Lesson Completed</div>
              ) : (
                <button className="btn-primary" style={{ width: "100%" }} onClick={onComplete}>Mark as Complete</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizEngine({ quiz, state, onAnswer, onNext }) {
  const q = quiz.questions[state.currentQ];
  const answered = state.answers[state.currentQ] !== null;
  const pct = Math.round((state.timeLeft / quiz.timeLimit) * 100);

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "#64748B" }}>Question {state.currentQ + 1} of {quiz.questions.length}</div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 700, color: state.timeLeft < 60 ? "#EF4444" : "#F97316" }}>⏱ {formatTime(state.timeLeft)}</div>
      </div>
      <div style={{ background: "#1E293B", borderRadius: 4, height: 6, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ width: `${((state.currentQ) / quiz.questions.length) * 100}%`, height: "100%", background: "#F97316", transition: "width 0.3s" }} />
      </div>
      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.5, marginBottom: 24 }}>{q.q}</div>
        <div style={{ display: "grid", gap: 10 }}>
          {q.options.map((opt, i) => (
            <div key={i} className={`quiz-option ${state.answers[state.currentQ] === i ? "selected" : ""}`} onClick={() => !answered && onAnswer(i)}>
              <span style={{ fontWeight: 700, color: "#F97316", marginRight: 10 }}>{String.fromCharCode(65 + i)}.</span> {opt}
            </div>
          ))}
        </div>
        {answered && (
          <div style={{ marginTop: 16, padding: "12px 16px", background: "#0F172A", borderRadius: 8, border: "1px solid #334155", fontSize: 13, color: "#94A3B8" }}>
            <span style={{ color: "#FBBF24", fontWeight: 600 }}>💡 </span>{q.explanation}
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn-primary" disabled={!answered} onClick={onNext} style={{ opacity: answered ? 1 : 0.4 }}>
          {state.currentQ === quiz.questions.length - 1 ? "Finish Quiz →" : "Next Question →"}
        </button>
      </div>
    </div>
  );
}

function QuizResult({ result, quiz, state, onRetry, onBack }) {
  const isPassing = result.percentage >= 50;
  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div className="card" style={{ padding: 32, textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>{result.percentage >= 80 ? "🏆" : result.percentage >= 50 ? "✅" : "📚"}</div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 64, fontWeight: 800, color: isPassing ? "#22C55E" : "#EF4444", lineHeight: 1 }}>{result.percentage}%</div>
        <div style={{ fontSize: 18, fontWeight: 600, margin: "12px 0 4px" }}>{isPassing ? "Well Done!" : "Keep Practicing!"}</div>
        <div style={{ color: "#64748B", fontSize: 14 }}>{result.correct} correct out of {result.total} questions</div>
      </div>
      <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
        {quiz.questions.map((q, i) => {
          const userAns = state.answers[i];
          const isCorrect = userAns === q.answer;
          return (
            <div key={q.id} className="card" style={{ padding: 16, borderLeft: `4px solid ${isCorrect ? "#22C55E" : "#EF4444"}` }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{i + 1}. {q.q}</div>
              <div style={{ fontSize: 13, color: "#64748B" }}>Your answer: <span style={{ color: isCorrect ? "#22C55E" : "#EF4444", fontWeight: 600 }}>{q.options[userAns] || "—"}</span></div>
              {!isCorrect && <div style={{ fontSize: 13, color: "#22C55E" }}>Correct: <strong>{q.options[q.answer]}</strong></div>}
              <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 6 }}>💡 {q.explanation}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn-primary" onClick={onRetry}>↩ Retry Quiz</button>
        <button className="btn-secondary" onClick={onBack}>← All Quizzes</button>
      </div>
    </div>
  );
}

function CreateQuiz({ newQuiz, setNewQuiz, newQuestion, setNewQuestion, addQuestion, saveQuiz, lessons }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <div>
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 16 }}>Quiz Info</div>
          <div style={{ marginBottom: 14 }}>
            <label>Quiz Title</label>
            <input className="input-field" value={newQuiz.title} onChange={e => setNewQuiz(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Basic Electrical Theory" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label>Trade</label>
              <select className="input-field" value={newQuiz.trade} onChange={e => setNewQuiz(p => ({ ...p, trade: e.target.value }))}>
                {TRADES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label>Time Limit (sec)</label>
              <input className="input-field" type="number" value={newQuiz.timeLimit} onChange={e => setNewQuiz(p => ({ ...p, timeLimit: +e.target.value }))} />
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 16 }}>Add Question</div>
          <div style={{ marginBottom: 12 }}>
            <label>Question</label>
            <textarea className="input-field" style={{ resize: "vertical", minHeight: 72 }} value={newQuestion.q} onChange={e => setNewQuestion(p => ({ ...p, q: e.target.value }))} placeholder="Enter question text..." />
          </div>
          {newQuestion.options.map((opt, i) => (
            <div key={i} style={{ marginBottom: 8, display: "flex", gap: 8, alignItems: "center" }}>
              <input type="radio" name="answer" checked={newQuestion.answer === i} onChange={() => setNewQuestion(p => ({ ...p, answer: i }))} style={{ accentColor: "#F97316" }} />
              <input className="input-field" style={{ flex: 1 }} placeholder={`Option ${String.fromCharCode(65 + i)}`} value={opt} onChange={e => { const o = [...newQuestion.options]; o[i] = e.target.value; setNewQuestion(p => ({ ...p, options: o })); }} />
            </div>
          ))}
          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <label>Explanation</label>
            <input className="input-field" value={newQuestion.explanation} onChange={e => setNewQuestion(p => ({ ...p, explanation: e.target.value }))} placeholder="Correct answer explanation..." />
          </div>
          <button className="btn-secondary" onClick={addQuestion}>+ Add Question</button>
        </div>
      </div>
      <div>
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Questions ({newQuiz.questions.length})</div>
          {newQuiz.questions.length === 0 ? <div style={{ color: "#64748B", fontSize: 13 }}>No questions added yet.</div> : (
            newQuiz.questions.map((q, i) => (
              <div key={q.id} style={{ padding: "10px 0", borderBottom: "1px solid #0F172A", fontSize: 13 }}>
                <div style={{ fontWeight: 600 }}>{i + 1}. {q.q}</div>
                <div style={{ color: "#22C55E", marginTop: 4 }}>✓ {q.options[q.answer]}</div>
              </div>
            ))
          )}
        </div>
        <button className="btn-primary" style={{ width: "100%", padding: "14px" }} onClick={saveQuiz}>💾 Save Quiz</button>
      </div>
    </div>
  );
}

function UploadContent({ uploadForm, setUploadForm, uploads, onUpload, uploadView, setUploadView, fileInputRef }) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button className="tab-btn" style={{ background: uploadView === "upload" ? "#F97316" : "#1E293B", color: uploadView === "upload" ? "#fff" : "#94A3B8", border: "1px solid " + (uploadView === "upload" ? "#F97316" : "#334155") }} onClick={() => setUploadView("upload")}>+ Upload New</button>
        <button className="tab-btn" style={{ background: uploadView === "list" ? "#F97316" : "#1E293B", color: uploadView === "list" ? "#fff" : "#94A3B8", border: "1px solid " + (uploadView === "list" ? "#F97316" : "#334155") }} onClick={() => setUploadView("list")}>📁 Uploaded Files ({uploads.length})</button>
      </div>

      {uploadView === "upload" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 16 }}>Content Details</div>
              <div style={{ marginBottom: 14 }}>
                <label>Title</label>
                <input className="input-field" value={uploadForm.title} onChange={e => setUploadForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Chapter 1: Ohm's Law" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label>Trade / Subject</label>
                  <select className="input-field" value={uploadForm.trade} onChange={e => setUploadForm(p => ({ ...p, trade: e.target.value }))}>
                    {TRADES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label>Content Type</label>
                  <select className="input-field" value={uploadForm.type} onChange={e => setUploadForm(p => ({ ...p, type: e.target.value }))}>
                    <option value="video">Video</option>
                    <option value="pdf">PDF Document</option>
                    <option value="image">Image</option>
                  </select>
                </div>
              </div>
              <div>
                <label>Description</label>
                <textarea className="input-field" style={{ resize: "vertical", minHeight: 80 }} value={uploadForm.description} onChange={e => setUploadForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of the content..." />
              </div>
            </div>
          </div>
          <div>
            <div className="drop-zone" style={{ borderColor: dragging ? "#F97316" : "#334155" }} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Drop file here or click to browse</div>
              <div style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>Supports: MP4, PDF, PNG, JPG, GIF</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {[{ t: "video", icon: "▶", c: "#1D4ED8" }, { t: "pdf", icon: "📄", c: "#DC2626" }, { t: "image", icon: "🖼", c: "#059669" }].map(b => (
                  <span key={b.t} style={{ background: b.c + "22", color: b.c, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{b.icon} {b.t.toUpperCase()}</span>
                ))}
              </div>
              <input ref={fileInputRef} type="file" accept="video/*,.pdf,image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
            </div>
          </div>
        </div>
      )}

      {uploadView === "list" && (
        <div>
          {uploads.length === 0 ? (
            <div className="card" style={{ padding: 48, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
              <div style={{ fontSize: 16, color: "#64748B" }}>No uploads yet</div>
              <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setUploadView("upload")}>+ Upload First File</button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {uploads.map(u => {
                const tc = getTypeColor(u.type);
                return (
                  <div key={u.id} className="lesson-item">
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: tc.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{getFileIcon(u.type)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{u.title || u.fileName}</div>
                      <div style={{ fontSize: 12, color: "#64748B" }}>{u.description || "—"}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#64748B" }}>{u.fileSize}</span>
                      <span style={{ fontSize: 11, background: "#1E293B", padding: "3px 10px", borderRadius: 20, color: "#64748B" }}>{TRADES.find(t => t.id === u.trade)?.name}</span>
                      <span className="tag" style={{ background: tc.bg, color: tc.text }}>{u.type}</span>
                      <span style={{ fontSize: 11, color: "#334155" }}>{u.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
