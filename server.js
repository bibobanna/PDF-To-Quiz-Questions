const express = require('express');
const pdfParse = require('pdf-parse');
const fetch = require('node-fetch');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(express.json());

app.post('/quiz', upload.single('file'), async (req, res) => {
  const { numQuestions, apiKey } = req.body;
  const fileBuffer = req.file.buffer;

  try {
    const text = await pdfParse(fileBuffer);
    const questions = await generateQuestions(text.text, numQuestions, apiKey);
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate questions", error: error.message });
  }
});

async function generateQuestions(text, numQuestions, apiKey) {
  const response = await fetch('https://api.langchain.com/generate-quiz', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      text: text,
      num_questions: numQuestions
    })
  });
  const data = await response.json();
  return data.questions;
}

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
