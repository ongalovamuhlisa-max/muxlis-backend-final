const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let admins = { "admin": "123" }; 
let teacherTests = {}; // { "Ali_Ustoz": {questions, subject...} }
let results = []; // { teacher: "Ali_Ustoz", student: "Anvar", score: 5 }

// --- REGISTER & LOGIN ---
app.post('/api/admin/register', (req, res) => {
    const { username, password, secretCode } = req.body;
    if (secretCode !== "MAKTAB2026") return res.status(403).json({ message: "Kod xato!" });
    admins[username] = password;
    res.json({ success: true });
});

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (admins[username] === password) {
        res.json({ success: true, teacher: username });
    } else {
        res.status(401).json({ success: false, message: "Xato!" });
    }
});

// --- SHAXSIY TEST YARATISH ---
app.post('/api/admin/setup', (req, res) => {
    const { teacher, questions, duration, subjectName } = req.body;
    // Har bir ustoz uchun alohida xona ochiladi
    teacherTests[teacher] = { questions, duration, subjectName };
    res.json({ message: "Faqat sizning xonangizga saqlandi!" });
});

// --- STUDENTLAR UCHUN: Ustozning ismini yozib kiradi ---
app.get('/api/get-teacher-test/:teacherName', (req, res) => {
    const teacher = req.params.teacherName;
    if (teacherTests[teacher]) {
        res.json(teacherTests[teacher]);
    } else {
        res.status(404).json({ message: "Bu ustozda faol test yo'q!" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Xonali tizim yoqildi!`));

