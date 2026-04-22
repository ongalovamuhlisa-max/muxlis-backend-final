const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. MONGODB ULANISHI
// ==========================================
const db_link = "mongodb+srv://ongalovamuhlisa_db_user:12345678MUXLISA@cluster0.c9gvjbx.mongodb.net/imtihon_tizimi?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(db_link)
  .then(() => console.log("Atlas bazasiga ulanish muvaffaqiyatli! ✅"))
  .catch(err => console.error("Bazaga ulanishda xato: ❌", err.message));

// ==========================================
// 2. MODELLAR
// ==========================================
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  secretCode: { type: String, required: true }
});
const Admin = mongoose.model("Admin", adminSchema);

const testSchema = new mongoose.Schema({
  teacher: { type: String, required: true },
  subjectName: String,
  duration: Number,
  attempts: Number,
  questions: Array,
  status: { type: String, default: "active" },
  createdAt: { type: Date, default: Date.now }
});
const Test = mongoose.model("Test", testSchema);

const resultSchema = new mongoose.Schema({
  id: String, // O'quvchi IDsi
  name: String,
  score: String,
  subject: String, // Qaysi fan/nazoratdan olingan baho
  teacher: String,
  date: { type: Date, default: Date.now }
});
const Result = mongoose.model("Result", resultSchema);

// ==========================================
// 3. ADMIN YO'LLARI
// ==========================================

// Login/Register
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username, password });
    if (!admin) return res.status(400).json({ error: "Xato!" });
    res.json({ success: true, user: admin.username });
  } catch (err) { res.status(500).json({ error: "Server xatosi" }); }
});

app.post("/api/admin/register", async (req, res) => {
  try {
    const { username, password, secretCode } = req.body;
    if (secretCode !== "MAKTAB2026") return res.status(400).json({ error: "Kod xato!" });
    const newAdmin = new Admin({ username, password, secretCode });
    await newAdmin.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Xato" }); }
});

// Testni saqlash (Eskilarini arxivlab, yangisini aktiv qiladi)
app.post("/api/admin/setup", async (req, res) => {
  try {
    const { teacher } = req.body;
    await Test.updateMany({ teacher: teacher }, { $set: { status: "archive" } });
    const newTest = new Test(req.body);
    await newTest.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Saqlashda xato" }); }
});

// Arxiv: Barcha testlarni yuklash
app.get("/api/subjects/all", async (req, res) => {
  try {
    const tests = await Test.find().sort({ createdAt: -1 });
    res.json(tests);
  } catch (err) { res.status(500).json({ error: "Xato" }); }
});

// --- YANGI QO'SHILGAN FUNKSIYALAR (OCHIRISH) ---

// 1. MAXSUS BITTA TESTNI O'CHIRISH (Arxivdan o'chirish)
// Eslatma: Test o'chsa ham, o'quvchilarning Result bazasidagi baholari O'CHMAYDI!
app.delete("/api/admin/delete-test/:id", async (req, res) => {
  try {
    await Test.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Test o'chirildi, lekin baholar arxivda qoldi." });
  } catch (err) { res.status(500).json({ error: "O'chirishda xato" }); }
});

// 2. MAXSUS BITTA NATIJANI (BAHONI) O'CHIRISH
app.delete("/api/admin/delete-result/:id", async (req, res) => {
  try {
    await Result.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "O'quvchi natijasi o'chirildi." });
  } catch (err) { res.status(500).json({ error: "Natijani o'chirishda xato" }); }
});

// -----------------------------------------------

// Natijalarni olish
app.get("/api/admin/results", async (req, res) => {
  try {
    const results = await Result.find().sort({ date: -1 });
    res.json(results);
  } catch (err) { res.status(500).json({ error: "Xato" }); }
});

// Butunlay tozalash (Hamma narsani: Ham test, ham natijalar)
app.delete("/api/admin/clear-all/:teacher", async (req, res) => {
  try {
    const { teacher } = req.params;
    await Test.deleteMany({ teacher });
    await Result.deleteMany({ teacher });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Xato" }); }
});

// ==========================================
// 4. STUDENT YO'LLARI
// ==========================================

app.get("/api/subjects", async (req, res) => {
  try {
    const teachers = await Test.distinct("teacher");
    res.json(teachers);
  } catch (err) { res.status(500).json({ error: "Xato" }); }
});

app.get("/api/get-teacher-test/:teacher", async (req, res) => {
  try {
    const test = await Test.findOne({ 
      teacher: req.params.teacher, 
      status: "active" 
    }).sort({ createdAt: -1 });
    if (!test) return res.status(404).json({ error: "Hozircha aktiv test yo'q" });
    res.json(test);
  } catch (err) { res.status(500).json({ error: "Xato" }); }
});

app.post("/api/student/submit", async (req, res) => {
  try {
    const newResult = new Result(req.body);
    await newResult.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Xato" }); }
});

const PORT = 5002;
app.listen(PORT, () => console.log(`🚀 Server ${PORT} da tayyor!`));
