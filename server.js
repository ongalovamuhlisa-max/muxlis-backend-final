const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// BAZA (Vaqtinchalik xotira)
let users = {}; // { "ID": "Ism" }
let completedTests = {}; // { "ID": { "Fan": Ball } }
let testSettings = {
    questions: [],
    duration: 45,
    subjectName: "Matematika" // Admin buni o'zgartira oladi
};

// --- STUDENTLAR UCHUN ---

// Login (ID va Ismni "muhrlash")
app.post('/api/auth', (req, res) => {
    const { id, name } = req.body;
    const currentSubject = testSettings.subjectName;

    if (!id || !name) return res.status(400).json({ message: "ID va Ismni yozing!" });

    // 1. Ism va ID mosligini tekshirish
    if (users[id]) {
        if (users[id] !== name) {
            return res.status(403).json({ message: `Bu ID ${users[id]}ga tegishli!` });
        }
    } else {
        users[id] = name; // Yangi o'quvchini ro'yxatga olish
    }

    // 2. Shu fandan topshirganini tekshirish
    if (completedTests[id] && completedTests[id][currentSubject] !== undefined) {
        return res.status(403).json({ message: `Siz ${currentSubject}dan topshirib bo'lgansiz!` });
    }

    res.json({ message: "Xush kelibsiz", userName: users[id], subject: currentSubject });
});

// Test ma'lumotlarini olish
app.get('/api/tests', (req, res) => res.json(testSettings));

// Natijani saqlash
app.post('/api/finish', (req, res) => {
    const { id, score } = req.body;
    const currentSubject = testSettings.subjectName;
    if (!completedTests[id]) completedTests[id] = {};
    completedTests[id][currentSubject] = score;
    res.json({ message: "Saqlandi" });
});

// --- ADMIN UCHUN ---

// Savollarni, Vaqtni va FAN NOMINI yangilash
app.post('/api/admin/setup', (req, res) => {
    const { questions, duration, subjectName } = req.body;
    testSettings = { questions, duration, subjectName };
    res.json({ message: "Hammasi yangilandi!" });
});

// Barcha natijalarni ko'rish
app.get('/api/admin/results', (req, res) => {
    res.json({ students: users, grades: completedTests });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ${PORT}-portda tayyor!`));

