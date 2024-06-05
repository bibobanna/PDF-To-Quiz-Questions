from flask import Flask, request, jsonify
from langchain.document_loaders import PyMuPDFLoader
import os

app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Save the uploaded file temporarily
    temp_path = os.path.join('/tmp', file.filename)
    file.save(temp_path)

    # Load and parse the PDF using LangChain's PDF loader
    loader = PyMuPDFLoader(temp_path)
    documents = loader.load()
    text = " ".join([doc.page_content for doc in documents])

    # Here you can call the LangChain API to generate questions
    # For simplicity, we'll just return the extracted text
    os.remove(temp_path)
    return jsonify({'text': text})

if __name__ == '__main__':
    app.run(port=5000)
