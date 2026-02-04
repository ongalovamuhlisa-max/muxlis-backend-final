
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

// --- 🛡️ CORS SOZLAMASINI TO'G'IRLADIK ---
// Bu blok Vercel va Render o'rtasidagi "urush"ni to'xtatadi
app.use(cors({
    origin: '*', // Hamma domendan so'rovlarni qabul qiladi
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- 🔌 MONGODB ULANISHI ---
const MONGO_URI = "mongodb+srv://adminmuxlis08:parol123@cluster0.dhwacv3.mongodb.net/imtihon_bazasi?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB-ga muvaffaqiyatli ulandik!"))
    .catch(err => {
        console.error("❌ MongoDB xatosi:", err);
        // Agar baza ulanmasa, xato sababini ko'rish uchun:
        process.exit(1); 
    });

// --- 📊 MODELLAR ---
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

// --- 🛠 YO'LAKLAR (ROUTES) ---

// 1. Ro'yxatdan o'tish
app.post('/api/admin/register', async (req, res) => {
    try {
        const { username, password, secretCode } = req.body;
        if (secretCode !== SECRET_CODE) return res.status(403).json({ message: "Maxfiy kod xato!" });

        const existingTeacher = await Teacher.findOne({ username });
        if (existingTeacher) return res.status(400).json({ message: "Bu login band!" });

        const newTeacher = new Teacher({ username, password });
        await newTeacher.save();
        res.json({ success: true, message: "Ro'yxatdan o'tdingiz!" });
    } catch (err) {
        res.status(500).json({ message: "Serverda xato!", error: err.message });
    }
});

// 2. Login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (username === "admin" && password === "123") {
            return res.json({ success: true, teacher: username });
        }
        const teacher = await Teacher.findOne({ username, password });
        if (teacher) {
            res.json({ success: true, teacher: username });
        } else {
            res.status(401).json({ success: false, message: "Login yoki parol xato!" });
        }
    } catch (err) {
        res.status(500).json({ message: "Serverda xato!" });
    }
});

// 3. Testni saqlash (Xatolar to'g'rilandi)
app.post('/api/admin/setup', async (req, res) => {
    try {
        const { teacher, questions, duration, subjectName } = req.body;
        if (!teacher || !questions) return res.status(400).json({ message: "Ma'lumotlar to'liq emas!" });

        await Test.findOneAndUpdate(
            { teacher, subjectName },
            { questions, duration, subjectName },
            { upsert: true, new: true }
        );
        res.json({ success: true, message: "Saqlandi!" });
    } catch (err) {
        console.error("Test saqlashda xato:", err);
        res.status(500).json({ message: "Saqlashda xato bo'ldi!", error: err.message });
    }
});

// 4. Natijalar
app.get('/api/admin/results', async (req, res) => {
    try {
        const results = await Result.find().sort({ _id: -1 });
        res.json(results);
    } catch (err) {
        res.status(500).json([]);
    }
});

// 5. Ustozlar ro'yxati
app.get('/api/subjects', async (req, res) => {
    try {
        const tests = await Test.find({}, { teacher: 1 });
        const activeTeachers = [...new Set(tests.map(t => t.teacher))];
        res.json(activeTeachers);
    } catch (err) {
        res.status(500).json([]);
    }
});

// 6. Testni yuklash
app.get('/api/get-teacher-test/:teacherName', async (req, res) => {
    try {
        const test = await Test.findOne({ teacher: req.params.teacherName });
        test ? res.json(test) : res.status(404).send("Topilmadi");
    } catch (err) {
        res.status(500).send("Xato");
    }
});

// 7. Natijani topshirish
app.post('/api/student/submit', async (req, res) => {
    try {
        const newResult = new Result(req.body);
        await newResult.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// Port sozlamasi (Render uchun muhim)
const

