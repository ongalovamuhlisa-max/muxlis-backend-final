const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(cors());
app.use(express.json());

// --- 🔌 MONGODB ULANISHI ---
const MONGO_URI = "mongodb+srv://adminmuxlis08:parol123@cluster0.dhwacv3.mongodb.net/imtihon_bazasi?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB-ga muvaffaqiyatli ulandik!"))
    .catch(err => console.error("❌ MongoDB ulanishida xato:", err));

// --- 📊 MODELLAR ---
const Test = mongoose.model('Test', new mongoose.Schema({
    teacher: String,
    questions: Array,
    duration: Number,
    subjectName: String,
    createdAt: { type: Date, default: Date.now }
}));

const Result = mongoose.model('Result', new mongoose.Schema({
    id: String,
    name: String,
    score: String,
    subject: String,
    teacher: String,
    date: { type: String, default: () => new Date().toLocaleString('uz-UZ') }
}));

// Admin login (Vaqtinchalik)
let admins = { "admin": "123" }; 

// --- 🛠 YO'LAKLAR (ROUTES) ---

// 1. Admin Login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (admins[username] && admins[username] === password) {
        res.json({ success: true, teacher: username });
    } else {
        res.status(401).json({ success: false, message: "Login yoki parol xato!" });
    }
});

// 2. Testni saqlash (MongoDB-ga)
app.post('/api/admin/setup', async (req, res) => {
    try {
        const { teacher, questions, duration, subjectName } = req.body;
        await Test.findOneAndUpdate(
            { teacher, subjectName },
            { questions, duration, subjectName },
            { upsert: true }
        );
        res.json({ message: "Test muvaffaqiyatli saqlandi!" });
    } catch (err) {
        res.status(500).json({ error: "Saqlashda xato yuz berdi" });
    }
});

// 3. Natijalarni ko'rish (Bazadan olish)
app.get('/api/admin/results', async (req, res) => {
    try {
        const results = await Result.find().sort({ _id: -1 });
        res.json(results);
    } catch (err) {
        res.status(500).json([]);
    }
});

// 4. Faol ustozlar
app.get('/api/subjects', async (req, res) => {
    try {
        const tests = await Test.find({}, { teacher: 1 });
        const activeTeachers = [...new Set(tests.map(t => t.teacher))];
        res.json(activeTeachers);
    } catch (err) {
        res.status(500).json([]);
    }
});

// 5. Testni yuklash
app.get('/api/get-teacher-test/:teacherName', async (req, res) => {
    const test = await Test.findOne({ teacher: req.params.teacherName });
    if (test) res.json(test);
    else res.status(404).json({ message: "Test topilmadi" });
});

// 6. Natijani qabul qilish (StudentPanel-dan)
app.post('/api/student/submit', async (req, res) => {
    try {
        const newResult = new Result(req.body);
        await newResult.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// Eski manzil (Har ehtimolga qarshi)
app.post('/api/finish', async (req, res) => {
    try {
        const newResult = new Result(req.body);
        await newResult.save();
        res.json({ message: "Saqlandi" });
    } catch (err) {
        res.status(500).send("Xato");
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server ${PORT}-portda ishga tushdi!`));

