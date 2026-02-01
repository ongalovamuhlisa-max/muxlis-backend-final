const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// --- 🧠 MA'LUMOTLAR OMBORI (RAM) ---
let admins = { "admin": "123" }; 
let teacherTests = {}; 
let completedResults = []; 

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

// 3. Testni saqlash
app.post('/api/admin/setup', (req, res) => {
    const { teacher, questions, duration, subjectName } = req.body;
    if (!teacher || !subjectName) return res.status(400).json({ message: "Ma'lumot to'liq emas!" });
    
    teacherTests[teacher] = { 
        questions, 
        duration, 
        subjectName,
        createdAt: new Date() 
    };
    console.log(`Test saqlandi: Ustoz - ${teacher}, Fan - ${subjectName}`);
    res.json({ message: "Shaxsiy kabinetingizga saqlandi!" });
});

// 4. NATIJALARNI ADMINGA YUBORISH (Shu qism yetishmayotgan edi)
app.get('/api/admin/results', (req, res) => {
    res.json(completedResults);
});

// --- 🎓 STUDENT YO'LAKLARI ---

// 1. Faol ustozlar ro'yxati
app.get('/api/subjects', (req, res) => {
    const activeTeachers = Object.keys(teacherTests);
    res.json(activeTeachers);
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

// 3. Natijani qabul qilish (StudentPanel'dan keladi)
app.post('/api/finish', (req, res) => {
    const { id, name, score, subject, teacher } = req.body;
    completedResults.push({ id, name, score, subject, teacher, date: new Date().toLocaleString() });
    console.log(`Natija keldi: ${name} - ${score}`);
    res.json({ message: "Natija qabul qilindi!" });
});

// Natijalarni qabul qilish uchun qo'shimcha (Alternativ yo'lak)
app.post('/api/student/submit', (req, res) => {
    const { id, name, score, subject, teacher, date } = req.body;
    completedResults.push({ id, name, score, subject, teacher, date: date || new Date().toLocaleString() });
    res.json({ success: true });
});

// Serverni yoqish
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server ${PORT}-portda ishga tushdi!`);
});
