from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_community.document_loaders import PyMuPDFLoader
import openai
import os

app = Flask(__name__)
CORS(app)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    temp_path = os.path.join('/tmp', file.filename)
    file.save(temp_path)
    loader = PyMuPDFLoader(temp_path)
    documents = loader.load()
    text = " ".join([doc.page_content for doc in documents])
    os.remove(temp_path)

    client = openai.OpenAI(api_key=request.form['apiKey'])

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an assistant that generates school-style quiz questions."},
                {"role": "user", "content": f"Generate {request.form['numQuestions']} school-style quiz questions from the following text:\n\n{text}"}
            ]
        )
        questions = response.choices[0].message['content'].strip().split('\n')
        return jsonify({'questions': questions})
    except openai.RateLimitError as e:
        return jsonify({'error': 'Rate limit exceeded, please check your OpenAI usage quota.'}), 429

if __name__ == '__main__':
    app.run(port=5000)
