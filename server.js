const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// --- 🧠 MA'LUMOTLAR OMBORI (RAM) ---
let admins = { "admin": "123" }; // { "login": "parol" }
let teacherTests = {}; // { "Ustoz_Ismi": { questions, duration, subjectName } }
let completedResults = []; // Studentlar natijalari

// Ro'yxatdan o'tish uchun maxfiy kod
const SECRET_CODE = "MAKTAB2026";

// --- 🛠 ADMIN YO'LAKLARI ---

// 1. Ro'yxatdan o'tish
app.post('/api/admin/register', (req, res) => {
    const { username, password, secretCode } = req.body;
    if (secretCode !== SECRET_CODE) return res.status(403).json({ message: "Maxfiy kod xato!" });
    if (admins[username]) return res.status(400).json({ message: "Bu login band!" });
    
    admins[username] = password;
    res.json({ success: true });
});

// 2. Login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (admins[username] && admins[username] === password) {
        res.json({ success: true, teacher: username });
    } else {
        res.status(401).json({ success: false, message: "Login yoki parol xato!" });
    }
});

// 3. Testni saqlash (Har bir ustoz uchun alohida xonaga)
app.post('/api/admin/setup', (req, res) => {
    const { teacher, questions, duration, subjectName } = req.body;
    if (!teacher || !subjectName) return res.status(400).json({ message: "Ma'lumot to'liq emas!" });
    
    // Ma'lumotni ustozning ismi bilan "shkaf"ga joylaymiz
    teacherTests[teacher] = { 
        questions, 
        duration, 
        subjectName,
        createdAt: new Date() 
    };
    console.log(`Test saqlandi: Ustoz - ${teacher}, Fan - ${subjectName}`);
    res.json({ message: "Shaxsiy kabinetingizga saqlandi!" });
});

// --- 🎓 STUDENT YO'LAKLARI ---

// 1. Faol ustozlar ro'yxatini olish (Student panelda tugma bo'lib chiqadi)
app.get('/api/subjects', (req, res) => {
    const activeTeachers = Object.keys(teacherTests);
    res.json(activeTeachers); // ["Muxlis", "Ali_Ustoz"]
});

// 2. Tanlangan ustozning testini yuklash
app.get('/api/get-teacher-test/:teacherName', (req, res) => {
    const teacher = req.params.teacherName;
    if (teacherTests[teacher]) {
        res.json(teacherTests[teacher]);
    } else {
        res.status(404).json({ message: "Test topilmadi!" });
    }
});

// 3. Natijani yuborish
app.post('/api/finish', (req, res) => {
    const { id, name, score, subject, teacher } = req.body;
    completedResults.push({ id, name, score, subject, teacher, date: new Date().toLocaleString() });
    res.json({ message: "Natija qabul qilindi!" });
});

// Serverni yoqish
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server 5000-portda ishga tushdi!`);
});
