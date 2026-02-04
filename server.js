const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

// 1. CORS sozlamasi - Vercel bilan bog'lanish uchun
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 2. MongoDB ulanishi
const MONGO_URI = "mongodb+srv://adminmuxlis08:parol123@cluster0.dhwacv3.mongodb.net/imtihon_bazasi?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB ulandi"))
    .catch(err => console.error("❌ MongoDB xatosi:", err));

// 3. Modellar
const Teacher = mongoose.model('Teacher', new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }
}));

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

const SECRET_CODE = "MAKTAB2026";

// 4. API Yo'laklari
app.get('/', (req, res) => res.send("🚀 Server is live and running!"));

// Ro'yxatdan o'tish
app.post('/api/admin/register', async (req, res) => {
    try {
        const { username, password, secretCode } = req.body;
        if (secretCode !== SECRET_CODE) return res.status(403).json({ message: "Kod xato!" });
        const newTeacher = new Teacher({ username, password });
        await newTeacher.save();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// LOGIN QISMI (ENG MUHIMI)
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Statik kirish (Test uchun)
        if (username === "admin" && password === "123") {
            return res.json({ success: true, teacher: "admin" });
        }

        // Bazadan qidirish
        const teacher = await Teacher.findOne({ 
            username: username ? username.trim() : "", 
            password: password ? password.trim() : "" 
        });

        if (teacher) {
            res.json({ success: true, teacher: teacher.username });
        } else {
            res.status(401).json({ success: false, message: "Login yoki parol xato!" });
        }
    } catch (err) { 
        res.status(500).json({ message: "Server xatosi" }); 
    }
});

// Test saqlash
app.post('/api/admin/setup', async (req, res) => {
    try {
        const { teacher, questions, duration, subjectName } = req.body;
        await Test.findOneAndUpdate(
            { teacher, subjectName },
            { questions, duration, subjectName },
            { upsert: true, new: true }
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Natijalar
app.get('/api/admin/results', async (req, res) => {
    try {
        const results = await Result.find().sort({ _id: -1 });
        res.json(results);
    } catch (err) { res.status(500).json([]); }
});

// Ustozlar/Fanlar
app.get('/api/subjects', async (req, res) => {
    try {
        const tests = await Test.find({}, { teacher: 1 });
        const activeTeachers = [...new Set(tests.map(t => t.teacher))];
        res.json(activeTeachers);
    } catch (err) { res.status(500).json([]); }
});

// Test yuklash
app.get('/api/get-teacher-test/:teacherName', async (req, res) => {
    try {
        const test = await Test.findOne({ teacher: req.params.teacherName });
        test ? res.json(test) : res.status(404).send("Topilmadi");
    } catch (err) { res.status(500).send("Xato"); }
});

// Natija topshirish
app.post('/api/student/submit', async (

