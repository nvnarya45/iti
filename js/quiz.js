// ===== Quiz Module =====
let quizState = { questions: [], current: 0, answers: [], timer: null, timeLeft: 0, quizId: '' };

const defaultQuizzes = [
  { id: 'basic-quiz', title: 'Basic Electrical Theory Quiz', titleHi: 'बुनियादी विद्युत सिद्धांत क्विज़', questions: 5, time: 300, topic: 'basic-electrical' },
  { id: 'ohms-quiz', title: "Ohm's Law Quiz", titleHi: 'ओम का नियम क्विज़', questions: 5, time: 300, topic: 'ohms-law' },
  { id: 'circuit-quiz', title: 'AC/DC Circuit Quiz', titleHi: 'AC/DC सर्किट क्विज़', questions: 5, time: 300, topic: 'ac-dc' },
  { id: 'wiring-quiz', title: 'Wiring Diagrams Quiz', titleHi: 'वायरिंग आरेख क्विज़', questions: 5, time: 300, topic: 'wiring' },
  { id: 'motor-quiz', title: 'Motor Winding Quiz', titleHi: 'मोटर वाइंडिंग क्विज़', questions: 5, time: 300, topic: 'motor' },
  { id: 'transformer-quiz', title: 'Transformer Quiz', titleHi: 'ट्रांसफार्मर क्विज़', questions: 5, time: 300, topic: 'transformer' },
  { id: 'safety-quiz', title: 'Electrical Safety Quiz', titleHi: 'विद्युत सुरक्षा क्विज़', questions: 5, time: 300, topic: 'safety' },
  { id: 'tools-quiz', title: 'Electrical Tools Quiz', titleHi: 'विद्युत उपकरण क्विज़', questions: 5, time: 300, topic: 'electrical-tools' },
  { id: 'battery-quiz', title: 'Batteries & Cells Quiz', titleHi: 'बैटरी और सेल क्विज़', questions: 5, time: 300, topic: 'batteries' },
  { id: 'solar-quiz', title: 'Solar Energy Quiz', titleHi: 'सौर ऊर्जा क्विज़', questions: 5, time: 300, topic: 'solar-energy' },
];

const defaultQuestions = {
  'basic-quiz': [
    { q: 'What is the unit of electrical resistance?', qHi: 'विद्युत प्रतिरोध की इकाई क्या है?', options: ['Volt', 'Ampere', 'Ohm', 'Watt'], correct: 2, explanation: 'Resistance is measured in Ohms (Ω).' },
    { q: 'Which particle carries electric current?', qHi: 'कौन सा कण विद्युत धारा वहन करता है?', options: ['Proton', 'Neutron', 'Electron', 'Photon'], correct: 2, explanation: 'Electrons flow to create electric current.' },
    { q: 'What is the SI unit of current?', qHi: 'करंट की SI इकाई क्या है?', options: ['Volt', 'Ampere', 'Ohm', 'Farad'], correct: 1, explanation: 'Current is measured in Amperes (A).' },
    { q: 'A conductor has ___ resistance.', qHi: 'चालक में ___ प्रतिरोध होता है।', options: ['High', 'Low', 'Zero', 'Infinite'], correct: 1, explanation: 'Conductors have low resistance.' },
    { q: 'EMF stands for?', qHi: 'EMF का पूरा नाम?', options: ['Electric Motor Force', 'Electromotive Force', 'Electromagnetic Flux', 'Electric Magnetic Field'], correct: 1, explanation: 'EMF = Electromotive Force, measured in Volts.' },
  ],
  'ohms-quiz': [
    { q: "What is Ohm's Law formula?", qHi: 'ओम के नियम का सूत्र?', options: ['V = IR', 'P = VI', 'V = I/R', 'R = VI'], correct: 0, explanation: "V = I × R" },
    { q: 'If V=12V, R=4Ω, what is I?', qHi: 'V=12V, R=4Ω, तो I?', options: ['2A', '3A', '4A', '48A'], correct: 1, explanation: 'I = V/R = 12/4 = 3A' },
    { q: 'Resistance is directly proportional to?', qHi: 'प्रतिरोध किसके समानुपाती है?', options: ['Length', 'Area', 'Current', 'Voltage'], correct: 0, explanation: 'R = ρL/A, R increases with length.' },
    { q: 'Unit of resistivity is?', qHi: 'प्रतिरोधकता की इकाई?', options: ['Ohm', 'Ohm-meter', 'Ohm/meter', 'Siemens'], correct: 1, explanation: 'Resistivity is measured in Ω·m.' },
    { q: "Power formula from Ohm's law?", qHi: 'ओम के नियम से शक्ति सूत्र?', options: ['P = V²/R', 'P = IR', 'P = V/I', 'P = R/V'], correct: 0, explanation: 'P = V²/R, from P=VI and V=IR.' },
  ],
  'circuit-quiz': [
    { q: 'In a series circuit, total resistance is?', qHi: 'श्रेणी परिपथ में कुल प्रतिरोध?', options: ['Sum of all R', 'Product of all R', 'Average of R', 'Smallest R'], correct: 0, explanation: 'R_total = R1 + R2 + R3...' },
    { q: 'Frequency of AC supply in India?', qHi: 'भारत में AC आपूर्ति की आवृत्ति?', options: ['40 Hz', '50 Hz', '60 Hz', '100 Hz'], correct: 1, explanation: 'India uses 50 Hz AC supply.' },
    { q: 'RMS value of AC = ___ × Peak value', qHi: 'AC का RMS मान = ___ × शिखर मान', options: ['0.5', '0.637', '0.707', '1.414'], correct: 2, explanation: 'V_rms = V_peak / √2 = 0.707 × V_peak' },
    { q: 'Line voltage in 3-phase star = ?', qHi: '3-फेज स्टार में लाइन वोल्टेज?', options: ['V_ph', '√3 × V_ph', '2 × V_ph', 'V_ph / √3'], correct: 1, explanation: 'V_L = √3 × V_Ph in star connection.' },
    { q: 'Power factor is cos of?', qHi: 'पावर फैक्टर किसका cos है?', options: ['Voltage angle', 'Current angle', 'Phase angle (φ)', 'Frequency'], correct: 2, explanation: 'Power Factor = cos φ.' },
  ],
  'wiring-quiz': [
    { q: 'Phase wire color in India?', qHi: 'भारत में फेज तार का रंग?', options: ['Green', 'Black', 'Red', 'Blue'], correct: 2, explanation: 'Red/Brown wire = Phase (Live).' },
    { q: 'Which wiring is most common today?', qHi: 'आजकल कौन सी वायरिंग सबसे आम है?', options: ['Cleat', 'Casing capping', 'Conduit', 'Batten'], correct: 2, explanation: 'Conduit wiring (surface/concealed) is standard.' },
    { q: 'Wire size for lighting circuit?', qHi: 'लाइटिंग सर्किट के लिए तार का आकार?', options: ['1.0 sq mm', '1.5 sq mm', '2.5 sq mm', '4 sq mm'], correct: 1, explanation: '1.5 sq mm is standard for lighting.' },
    { q: 'Two-way switch is used in?', qHi: 'टू-वे स्विच कहाँ उपयोग होता है?', options: ['Kitchen', 'Bathroom', 'Staircase', 'Garden'], correct: 2, explanation: 'Staircase wiring uses two-way switches.' },
    { q: 'Earth wire color?', qHi: 'अर्थ तार का रंग?', options: ['Red', 'Black', 'Green', 'Blue'], correct: 2, explanation: 'Green or Green-Yellow = Earth wire.' },
  ],
  'motor-quiz': [
    { q: 'Speed of 4-pole motor at 50Hz?', qHi: '4-पोल मोटर की स्पीड 50Hz पर?', options: ['3000 RPM', '1500 RPM', '1000 RPM', '750 RPM'], correct: 1, explanation: 'N = 120f/P = 120×50/4 = 1500 RPM.' },
    { q: 'Capacitor start motor is?', qHi: 'कैपेसिटर स्टार्ट मोटर है?', options: ['DC motor', '3-phase motor', 'Single phase motor', 'Stepper motor'], correct: 2, explanation: 'Capacitor start is a single phase induction motor.' },
    { q: 'Motor humming but not running means?', qHi: 'मोटर गुनगुना रही पर चल नहीं रही?', options: ['Overload', 'Bad capacitor', 'Low voltage', 'All of these'], correct: 3, explanation: 'All these can cause motor to hum without running.' },
    { q: 'DOL starter is used for motors up to?', qHi: 'DOL स्टार्टर किस तक की मोटर के लिए?', options: ['1 HP', '5 HP', '10 HP', '50 HP'], correct: 1, explanation: 'DOL is used for motors up to 5 HP.' },
    { q: 'Star-Delta starter reduces starting current by?', qHi: 'स्टार-डेल्टा स्टार्टर शुरुआती करंट कम करता है?', options: ['1/2', '1/3', '1/4', '2/3'], correct: 1, explanation: 'Star-delta reduces starting current to 1/3.' },
  ],
  'transformer-quiz': [
    { q: 'Transformer works on?', qHi: 'ट्रांसफार्मर किस सिद्धांत पर कार्य करता है?', options: ['Coulombs law', 'Ohms law', 'Electromagnetic induction', 'Newtons law'], correct: 2, explanation: 'Transformer works on Faraday\'s law of electromagnetic induction.' },
    { q: 'Step-up transformer increases?', qHi: 'स्टेप-अप ट्रांसफार्मर क्या बढ़ाता है?', options: ['Current', 'Voltage', 'Power', 'Frequency'], correct: 1, explanation: 'Step-up transformer increases voltage.' },
    { q: 'Core of transformer is made of?', qHi: 'ट्रांसफार्मर का कोर किसका बना होता है?', options: ['Copper', 'Aluminium', 'Silicon steel', 'Iron rod'], correct: 2, explanation: 'CRGO silicon steel laminations reduce eddy current loss.' },
    { q: 'Copper loss in transformer = ?', qHi: 'ट्रांसफार्मर में कॉपर लॉस = ?', options: ['I²R', 'V²/R', 'VI', 'IR'], correct: 0, explanation: 'Copper loss = I²R (heat in windings).' },
    { q: 'Transformer does NOT change?', qHi: 'ट्रांसफार्मर क्या नहीं बदलता?', options: ['Voltage', 'Current', 'Frequency', 'Impedance'], correct: 2, explanation: 'Frequency remains same: input freq = output freq.' },
  ],
  'safety-quiz': [
    { q: 'Fatal current for human body?', qHi: 'मानव शरीर के लिए घातक करंट?', options: ['1 mA', '10 mA', '100 mA', '1 A'], correct: 2, explanation: '100-300 mA causes heart fibrillation (fatal).' },
    { q: 'MCB stands for?', qHi: 'MCB का पूरा नाम?', options: ['Main Circuit Board', 'Miniature Circuit Breaker', 'Motor Control Box', 'Manual Circuit Breaker'], correct: 1, explanation: 'MCB = Miniature Circuit Breaker.' },
    { q: 'ELCB protects against?', qHi: 'ELCB किससे सुरक्षा करता है?', options: ['Overload', 'Short circuit', 'Earth leakage', 'Overvoltage'], correct: 2, explanation: 'ELCB detects earth leakage current and trips.' },
    { q: 'First step if someone gets electric shock?', qHi: 'बिजली का झटका लगने पर पहला कदम?', options: ['Pour water', 'Touch the person', 'Switch off power', 'Call doctor'], correct: 2, explanation: 'Always switch off power source first.' },
    { q: 'Insulated tools have ___ handle.', qHi: 'इंसुलेटेड टूल्स में ___ हैंडल होता है।', options: ['Metal', 'Wood', 'Rubber/Plastic', 'Glass'], correct: 2, explanation: 'Insulated tools have rubber/plastic handles.' },
  ],
  'tools-quiz': [
    { q: 'Megger is used to measure?', qHi: 'मेगर किसे मापने के लिए?', options: ['Voltage', 'Current', 'Insulation resistance', 'Power'], correct: 2, explanation: 'Megger measures insulation resistance in MΩ.' },
    { q: 'Clamp meter measures without?', qHi: 'क्लैंप मीटर बिना किसके मापता है?', options: ['Touching wire', 'Breaking circuit', 'Power supply', 'Battery'], correct: 1, explanation: 'Clamp meter measures current without breaking the circuit.' },
    { q: 'Soldering iron temperature is about?', qHi: 'सोल्डरिंग आयरन का तापमान लगभग?', options: ['100°C', '200°C', '350°C', '500°C'], correct: 2, explanation: 'Soldering iron operates around 300-400°C.' },
    { q: 'Wire stripper is used to?', qHi: 'वायर स्ट्रिपर किसलिए?', options: ['Cut wire', 'Join wire', 'Remove insulation', 'Test wire'], correct: 2, explanation: 'Wire stripper removes insulation from wire.' },
    { q: 'Multimeter can measure?', qHi: 'मल्टीमीटर क्या माप सकता है?', options: ['Only voltage', 'Only current', 'V, I, and R', 'Only resistance'], correct: 2, explanation: 'Multimeter measures Voltage, Current, and Resistance.' },
  ],
  'battery-quiz': [
    { q: 'Voltage of one lead-acid cell?', qHi: 'एक लेड-एसिड सेल का वोल्टेज?', options: ['1.5V', '2V', '3.7V', '6V'], correct: 1, explanation: 'One lead-acid cell = 2V. A 12V battery has 6 cells.' },
    { q: 'Specific gravity of fully charged battery?', qHi: 'पूरी चार्ज बैटरी की विशिष्ट गुरुत्व?', options: ['1.10', '1.15', '1.28', '1.50'], correct: 2, explanation: 'Fully charged = 1.28, discharged = 1.15.' },
    { q: 'Distilled water is added to battery to?', qHi: 'बैटरी में आसुत जल क्यों डालते हैं?', options: ['Increase voltage', 'Maintain electrolyte level', 'Clean plates', 'Reduce weight'], correct: 1, explanation: 'Distilled water maintains electrolyte level.' },
    { q: '2 batteries of 12V in series give?', qHi: '12V की 2 बैटरी श्रेणी में = ?', options: ['6V', '12V', '24V', '48V'], correct: 2, explanation: 'Series: voltages add. 12+12 = 24V.' },
    { q: 'Lithium-ion cell voltage?', qHi: 'लिथियम-आयन सेल वोल्टेज?', options: ['1.2V', '1.5V', '2.0V', '3.7V'], correct: 3, explanation: 'Li-ion cell = 3.7V nominal.' },
  ],
  'solar-quiz': [
    { q: 'Solar cell converts?', qHi: 'सोलर सेल क्या बदलता है?', options: ['Heat to electricity', 'Light to electricity', 'Wind to electricity', 'Sound to electricity'], correct: 1, explanation: 'Solar cell converts sunlight to electricity (photovoltaic effect).' },
    { q: 'Solar panel produces?', qHi: 'सोलर पैनल क्या उत्पन्न करता है?', options: ['AC power', 'DC power', 'Both', 'Neither'], correct: 1, explanation: 'Solar panels produce DC power. Inverter converts to AC.' },
    { q: 'MPPT stands for?', qHi: 'MPPT का पूरा नाम?', options: ['Maximum Power Point Tracker', 'Minimum Power Point Tracker', 'Motor Power Protection Timer', 'Main Power Panel Tester'], correct: 0, explanation: 'MPPT = Maximum Power Point Tracking (charge controller type).' },
    { q: 'On-grid solar system needs?', qHi: 'ऑन-ग्रिड सोलर सिस्टम को चाहिए?', options: ['Battery only', 'Grid connection', 'Generator', 'Wind turbine'], correct: 1, explanation: 'On-grid system is connected to power grid, no battery needed.' },
    { q: '1 kW solar system generates daily?', qHi: '1 kW सोलर सिस्टम दैनिक उत्पादन?', options: ['1-2 units', '4-5 units', '10-12 units', '20 units'], correct: 1, explanation: '1 kW system generates approximately 4-5 kWh/day in India.' },
  ],
};

async function renderQuizList() {
  const lang = document.getElementById('lang-toggle').checked;
  let quizzes = [...defaultQuizzes];
  try {
    const snap = await db.ref('quizzes').once('value');
    if (snap.exists()) {
      const data = snap.val();
      const fbQuizzes = Object.keys(data).map(k => ({ id: k, ...data[k] }));
      quizzes = [...quizzes, ...fbQuizzes.filter(f => !quizzes.find(q => q.id === f.id))];
    }
  } catch(e) {}

  const el = document.getElementById('view-quiz');
  el.innerHTML = `
    <h3 class="section-title"><i class="fas fa-clipboard-check" style="color:var(--accent)"></i> ${lang ? 'क्विज़ और टेस्ट' : 'Quizzes & Tests'}</h3>
    <p class="section-subtitle">${lang ? 'अपना ज्ञान परखें' : 'Test your knowledge with MCQ quizzes'}</p>
    ${quizzes.map(q => `
      <div class="quiz-card" onclick="startQuiz('${q.id}')">
        <div class="quiz-card-body">
          <h3>${lang ? (q.titleHi || q.title) : q.title}</h3>
          <p>${lang ? 'बहुविकल्पीय प्रश्न' : 'Multiple choice questions'}</p>
          <div class="quiz-meta">
            <span><i class="fas fa-question-circle"></i> ${q.questions || 5} ${lang ? 'प्रश्न' : 'Qs'}</span>
            <span><i class="fas fa-clock"></i> ${Math.floor((q.time || 300) / 60)} ${lang ? 'मिनट' : 'min'}</span>
            <span><i class="fas fa-bolt"></i> ${lang ? 'इलेक्ट्रीशियन' : 'Electrician'}</span>
          </div>
        </div>
      </div>
    `).join('')}
  `;
}

async function startQuiz(quizId) {
  showLoading(true);
  const lang = document.getElementById('lang-toggle').checked;
  let questions = [];
  let timeLimit = 300;

  // Try Firebase first
  try {
    const snap = await db.ref('quizQuestions/' + quizId).once('value');
    if (snap.exists()) {
      const data = snap.val();
      questions = Object.values(data);
    }
    const qSnap = await db.ref('quizzes/' + quizId + '/time').once('value');
    if (qSnap.exists()) timeLimit = qSnap.val();
  } catch(e) {}

  // Fallback to defaults
  if (questions.length === 0 && defaultQuestions[quizId]) {
    questions = defaultQuestions[quizId];
  }
  if (questions.length === 0) { showLoading(false); showToast(lang ? 'प्रश्न उपलब्ध नहीं' : 'No questions available'); return; }

  quizState = { questions, current: 0, answers: new Array(questions.length).fill(-1), timer: null, timeLeft: timeLimit, quizId };
  renderQuizQuestion();
  startQuizTimer();
  navigateTo('quiz-play');
  showLoading(false);
}

function renderQuizQuestion() {
  const lang = document.getElementById('lang-toggle').checked;
  const { questions, current, answers } = quizState;
  const q = questions[current];
  const letters = ['A', 'B', 'C', 'D'];

  const el = document.getElementById('view-quiz-play');
  el.innerHTML = `
    <div class="quiz-header">
      <div class="quiz-progress-text">${lang ? 'प्रश्न' : 'Question'} ${current + 1}/${questions.length}</div>
      <div class="quiz-timer" id="quiz-timer-display"><i class="fas fa-clock"></i> <span id="timer-text">${formatTime(quizState.timeLeft)}</span></div>
    </div>
    <div class="progress-wrap" style="margin-bottom:16px;">
      <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${((current + 1) / questions.length) * 100}%"></div></div>
    </div>
    <div class="quiz-question-card">
      <h3>${lang ? (q.qHi || q.q) : q.q}</h3>
      ${q.options.map((opt, i) => `
        <div class="quiz-option ${answers[current] === i ? 'selected' : ''}" onclick="selectAnswer(${i})">
          <div class="quiz-option-letter">${letters[i]}</div>
          <span>${opt}</span>
        </div>
      `).join('')}
    </div>
    <div class="quiz-nav">
      ${current > 0 ? `<button class="btn-outline" onclick="quizNav(-1)"><i class="fas fa-arrow-left"></i> ${lang ? 'पिछला' : 'Previous'}</button>` : '<div></div>'}
      ${current < questions.length - 1
        ? `<button class="btn-filled" onclick="quizNav(1)">${lang ? 'अगला' : 'Next'} <i class="fas fa-arrow-right"></i></button>`
        : `<button class="btn-filled" onclick="submitQuiz()" style="background:var(--success);box-shadow:0 4px 12px rgba(48,209,88,.3);">${lang ? 'जमा करें' : 'Submit'} <i class="fas fa-check"></i></button>`}
    </div>
  `;
}

function selectAnswer(idx) {
  quizState.answers[quizState.current] = idx;
  renderQuizQuestion();
}

function quizNav(dir) {
  quizState.current += dir;
  renderQuizQuestion();
}

function startQuizTimer() {
  if (quizState.timer) clearInterval(quizState.timer);
  quizState.timer = setInterval(() => {
    quizState.timeLeft--;
    const te = document.getElementById('timer-text');
    if (te) te.textContent = formatTime(quizState.timeLeft);
    if (quizState.timeLeft <= 0) { clearInterval(quizState.timer); submitQuiz(); }
  }, 1000);
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

async function submitQuiz() {
  if (quizState.timer) clearInterval(quizState.timer);
  const lang = document.getElementById('lang-toggle').checked;
  const { questions, answers, quizId } = quizState;
  let correct = 0;
  questions.forEach((q, i) => { if (answers[i] === q.correct) correct++; });
  const score = Math.round((correct / questions.length) * 100);

  // Save result
  const uid = getUID();
  if (uid) {
    try {
      await db.ref('users/' + uid + '/quizResults/' + quizId).set({ score, correct, total: questions.length, date: Date.now() });
    } catch(e) {}
  }

  renderQuizResult(score, correct, questions, answers, lang);
  navigateTo('quiz-result');
}

function renderQuizResult(score, correct, questions, answers, lang) {
  const total = questions.length;
  const wrong = total - correct;
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)';

  const el = document.getElementById('view-quiz-result');
  el.innerHTML = `
    <div style="text-align:center;margin-bottom:12px;">
      <h3 class="section-title" style="justify-content:center;">${score >= 70 ? '🎉' : '📝'} ${lang ? 'परिणाम' : 'Quiz Result'}</h3>
    </div>
    <div class="result-circle">
      <svg viewBox="0 0 160 160"><circle class="bg-circle" cx="80" cy="80" r="70"/><circle class="fg-circle" cx="80" cy="80" r="70" style="stroke:${color};stroke-dasharray:${circumference};stroke-dashoffset:${offset}"/></svg>
      <div class="result-score">${score}%</div>
    </div>
    <div class="result-summary">
      <div class="result-item"><div class="val" style="color:var(--success)">${correct}</div><div class="lbl">${lang ? 'सही' : 'Correct'}</div></div>
      <div class="result-item"><div class="val" style="color:var(--danger)">${wrong}</div><div class="lbl">${lang ? 'गलत' : 'Wrong'}</div></div>
      <div class="result-item"><div class="val">${total}</div><div class="lbl">${lang ? 'कुल' : 'Total'}</div></div>
    </div>
    <h3 class="section-title" style="margin-top:20px;"><i class="fas fa-list-check" style="color:var(--accent)"></i> ${lang ? 'उत्तर व्याख्या' : 'Answer Explanations'}</h3>
    ${questions.map((q, i) => {
      const isCorrect = answers[i] === q.correct;
      const letters = ['A','B','C','D'];
      return `<div class="explanation-card">
        <h4>${i + 1}. ${lang ? (q.qHi || q.q) : q.q}</h4>
        <p><span class="${isCorrect ? 'correct-tag' : 'wrong-tag'}">${isCorrect ? '✅ Correct' : '❌ Wrong'}</span>
        ${!isCorrect ? ` — Your answer: ${letters[answers[i]] || 'None'}, Correct: ${letters[q.correct]}` : ''}</p>
        <p style="margin-top:6px;">${lang ? (q.explanationHi || q.explanation || '') : (q.explanation || '')}</p>
      </div>`;
    }).join('')}
    <button class="btn-primary" onclick="navigateTo('quiz')" style="margin-top:16px;">
      <i class="fas fa-redo"></i> ${lang ? 'और क्विज़ दें' : 'Take Another Quiz'}
    </button>
    ${score >= 80 ? `<button class="btn-complete" onclick="navigateTo('certificate')" style="margin-top:10px;background:linear-gradient(135deg,#d4a843,#f5d77a);color:#333;">
      <i class="fas fa-certificate"></i> ${lang ? 'प्रमाणपत्र देखें' : 'View Certificate'}
    </button>` : ''}
  `;
}
