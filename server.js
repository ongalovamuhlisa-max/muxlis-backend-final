const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 1. MA'LUMOTLAR OMBORI (Vaqtinchalik RAMda)
let allTests = {}; // Fanlar papkasi
let users = {}; 
let completedResults = []; // Kim necha ball oldi

// 2. ADMINLAR RO'YXATI (Ustozlar)
const admins = {
    "matematika_ustoz": "math777",
    "ona_tili_ustoz": "tili2026",
    "fizika_ustoz": "fizik88"
};

// --- ADMIN YO'LAKLARI ---

// Login tekshirish
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (admins[username] && admins[username] === password) {
        res.json({ success: true, teacher: username });
    } else {
        res.status(401).json({ success: false, message: "Login yoki parol xato!" });
    }
});

// Testni saqlash (Fan nomi bilan)
app.post('/api/admin/setup', (req, res) => {
    const { questions, duration, subjectName } = req.body;
    if (!subjectName) return res.status(400).json({ message: "Fan nomi yo'q!" });
    
    allTests[subjectName] = { questions, duration };
    console.log(`${subjectName} fani saqlandi.`);
    res.json({ message: "Test saqlandi!" });
});

// Natijalarni ko'rish (Admin uchun)
app.get('/api/admin/results', (req, res) => {
    res.json(completedResults);
});

// --- STUDENT YO'LAKLARI ---

// Hamma faol fanlarni olish
app.get('/api/subjects', (req, res) => {
    res.json(Object.keys(allTests));
});

// Tanlangan testni yuklash
app.get('/api/tests/:subject', (req, res) => {
    const subject = req.params.subject;
    if (allTests[subject]) {
        res.json(allTests[subject]);
    } else {
        res.status(404).json({ message: "Test topilmadi" });
    }
});

// Testni tugatib natijani yuborish
app.post('/api/finish', (req, res) => {
    const { id, name, score, subject } = req.body;
    const result = {
        studentId: id,
        studentName: name,
        subject: subject,
        score: score,
        date: new Date().toLocaleString()
    };
    completedResults.push(result);
    res.json({ message: "Natija qabul qilindi!" });
});

// SERVERNI YOQISH
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🔥 Server ${PORT}-portda olov bo'lib yonayapti!`);
});
