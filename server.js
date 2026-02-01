const express = require('express');
const cors = require('cors');

const app = express();

// Middleware - Frontenddan kelayotgan JSON va So'rovlarni qabul qilish uchun
app.use(cors());
app.use(express.json());

// Testlar saqlanadigan massiv (Baza)
let tests = [
  {
    _id: "1",
    question: "React-da 'state' nima uchun ishlatiladi?",
    options: ["Ma'lumotlarni saqlash", "Dizayn berish", "Serverni yoqish", "Hech nima"],
    answer: "Ma'lumotlarni saqlash"
  }
];

// 1. GET - Barcha testlarni frontendga yuborish
app.get('/api/tests', (req, res) => {
  res.status(200).json(tests);
});

// 2. POST - Yangi testni qabul qilib bazaga qo'shish
app.post('/api/tests', (req, res) => {
  const { question, options, answer } = req.body;

  // Ma'lumotlar to'liqligini tekshirish (Validator)
  if (!question || !options || !answer || !Array.isArray(options)) {
    return res.status(400).json({ 
      error: "Xato! Savol, variantlar va to'g'ri javob bo'lishi shart." 
    });
  }

  // Yangi obyekt yaratish
  const newTest = {
    _id: Math.random().toString(36).substr(2, 9),
    question,
    options,
    answer
  };

  tests.push(newTest); // Massivga qo'shish
  console.log("Yangi test qo'shildi:", newTest);
  
  res.status(201).json(newTest);
});

// 3. Serverni yoqish
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT}-portda muvaffaqiyatli ishga tushdi!`);
});