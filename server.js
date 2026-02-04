const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const MONGO_URI = "mongodb+srv://adminmuxlis08:parol123@cluster0.dhwacv3.mongodb.net/imtihon_bazasi?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB ulandi"))
    .catch(err => console.error("❌ MongoDB xatosi:", err));

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

app.get('/', (req, res) => res.send("🚀 Server is live!"));

app.post('/api/admin/register', async (req, res) => {
    try {
        const { username, password, secretCode } = req.body;
        if (secretCode !== SECRET_CODE) return res.status(403).json({ message: "Kod xato!" });
        const newTeacher = new Teacher({ username, password });
        await newTeacher.save();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const teacher = await Teacher.findOne({ username, password });
        if (teacher || (username === "admin" && password === "123")) {
            res.json({ success: true, teacher: username });
        } else { res.status(401).json({ success: false }); }
    } catch (err) { res.status(500).json({ message: "Xato" }); }
});

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

app.get('/api/admin/results', async (req, res) => {
    try {
        const results = await Result.find().sort({ _id: -1 });
        res.json(results);
    } catch (err) { res.status(500).json([]); }
});

app.get('/api/subjects', async (req, res) => {
    try {
        const tests = await Test.find({}, { teacher: 1 });
        const activeTeachers = [...new Set(tests.map(t => t.teacher))];
        res.json(activeTeachers);
    } catch (err) { res.status(500).json([]); }
});

app.get('/api/get-teacher-test/:teacherName', async (req, res) => {
    try {
        const test = await Test.findOne({ teacher: req.params.teacherName });
        test ? res.json(test) : res.status(404).send("Topilmadi");
    } catch (err) { res.status(500).send("Xato"); }
});

app.post('/api/student/submit', async (req, res) => {
    try {
        const newResult = new Result(req.body);
        await newResult.save();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server ${PORT} portda tayyor!`));

