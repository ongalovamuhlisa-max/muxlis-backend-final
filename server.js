// O'qituvchilar va ularning parollari
const admins = {
    "matematika_ustoz": "math777",
    "ona_tili_ustoz": "tili2026",
    "fizika_ustoz": "fizik88"
};

// Admin login yo'lagi
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (admins[username] && admins[username] === password) {
        res.json({ success: true, teacher: username });
    } else {
        res.status(401).json({ success: false, message: "Login yoki parol xato!" });
    }
});const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// MIYA: Endi ma'lumotlar fan nomi ostida papkalarda saqlanadi
let allTests = {}; // { "Matematika": {questions, duration}, "Tarix": {...} }
let users = {}; 
let completedTests = {}; 

// --- ADMIN UCHUN: Testni fan nomi bilan saqlash ---
app.post('/api/admin/setup', (req, res) => {
    const { questions, duration, subjectName } = req.body;
    if (!subjectName) return res.status(400).json({ message: "Fan nomini yozing!" });
    
    // Fan nomi bo'yicha alohida joy ajratamiz
    allTests[subjectName] = { questions, duration };
    res.json({ message: `${subjectName} fani uchun test muvaffaqiyatli yaratildi!` });
});

// --- STUDENT UCHUN: Faol fanlar ro'yxatini olish ---
app.get('/api/subjects', (req, res) => {
    res.json(Object.keys(allTests)); // Faqat fan nomlarini yuboradi ["Matematika", "Tarix"]
});

// --- STUDENT UCHUN: Tanlangan testni yuklash ---
app.get('/api/tests/:subject', (req, res) => {
    const subject = req.params.subject;
    if (allTests[subject]) {
        res.json(allTests[subject]);
    } else {
        res.status(404).json({ message: "Test topilmadi" });
    }
});

// Auth va Finish kodlari o'sha-o'sha qoladi...
app.post('/api/auth', (req, res) => {
    const { id, name } = req.body;
    if (!users[id]) users[id] = name;
    res.json({ message: "OK", userName: users[id] });
});

app.post('/api/finish', (req, res) => {
    const { id, score, subject } = req.body;
    if (!completedTests[id]) completedTests[id] = {};
    completedTests[id][subject] = score;
    res.json({ message: "Natija saqlandi" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Miyali Server ${PORT}da ishga tushdi!`));

