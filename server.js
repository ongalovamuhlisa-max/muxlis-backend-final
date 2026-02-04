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
    .catch(err => console.error("❌ MongoDB xatosi:", err));

// --- 📊 MODELLAR ---
// O'qituvchilar (Adminlar) bazasi
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

// --- 🛠 YO'LAKLAR ---

// 1. O'QITUVCHILAR RO'YXATDAN O'TISHI (BAZAGA SAQLASH)
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
        res.status(500).json({ message: "Serverda xato!" });
    }
});

// 2. O'QITUVCHILAR LOGIN QILISHI (BAZADAN TEKSHIRISH)
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Zaxira admin (ixtiyoriy)
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

// 3. Testni saqlash
app.post('/api/admin/setup', async (req, res) => {
    const { teacher, questions, duration, subjectName } = req.body;
    await Test.findOneAndUpdate(
        { teacher, subjectName },
        { questions, duration, subjectName },
        { upsert: true }
    );
    res.json({ message: "Saqlandi!" });
});

// 4. Natijalar
app.get('/api/admin/results', async (req, res) => {
    const results = await Result.find().sort({ _id: -1 });
    res.json(results);
});

// 5. O'quvchilar uchun fanlar
app.get('/api/subjects', async (req, res) => {
    const tests = await Test.find({}, { teacher: 1 });
    const activeTeachers = [...new Set(tests.map(t => t.teacher))];
    res.json(activeTeachers);
});

// 6. Testni yuklash
app.get('/api/get-teacher-test/:teacherName', async (req, res) => {
    const test = await Test.findOne({ teacher: req.params.teacherName });
    test ? res.json(test) : res.status(404).send("Topilmadi");
});

// 7. Natijani saqlash
app.post('/api/student/submit', async (req, res) => {
    const newResult = new Result(req.body);
    await newResult.save();
    res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server tayyor!`));

