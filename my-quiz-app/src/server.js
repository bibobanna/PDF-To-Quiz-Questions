require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(fileUpload());

const LANGCHAIN_ENDPOINT = 'https://api.langchain.com/generate-quiz';

app.post('/upload', async (req, res) => {
    if (!req.files || !req.files.pdfFile) {
        return res.status(400).send('No PDF file was uploaded.');
    }

    const pdfFile = req.files.pdfFile;

    pdfParse(pdfFile.data).then(text => {
        axios.post(LANGCHAIN_ENDPOINT, {
            text: text.text,
            num_questions: req.body.numQuestions
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        })
        .then(apiResponse => {
            res.json({ questions: apiResponse.data.questions });
        })
        .catch(error => {
            console.error('Error calling LangChain API:', error);
            res.status(500).send('Failed to generate quiz questions');
        });
    }).catch(err => {
        console.error('PDF parsing error:', err);
        res.status(500).send('Failed to extract text from PDF');
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});