from flask import Flask, request, jsonify
import fitz
import docx

app = Flask(__name__)

@app.route("/")
def home():
    return "flask is working"


# -------------------------
# PDF EXTRACT FUNCTION
# -------------------------
def extract_text_from_pdf(file):
    pdf = fitz.open(stream=file.read(), filetype="pdf")
    text = ""
    for page in pdf:
        text += page.get_text()
    return text


# -------------------------
# DOCX EXTRACT FUNCTION
# -------------------------
def extract_text_from_docx(file):
    doc = docx.Document(file)
    return "\n".join([para.text for para in doc.paragraphs])



# -------------------------
# FILE UPLOAD ENDPOINT
# -------------------------
@app.route("/upload_resume", methods=["POST"])
def upload_resume():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]

    if file.filename.endswith(".pdf"):
        extracted_text = extract_text_from_pdf(file)
    elif file.filename.endswith(".docx"):
        extracted_text = extract_text_from_docx(file)
    else:
        return jsonify({"error": "Unsupported file type"}), 400

    return jsonify({
        "message": "File processed successfully",
        "extracted_text": extracted_text[:500]  # send first 500 chars
    })


# -----Resume Scoring Endpoints--------


@app.route("/score", methods=["POST"])
def score_resume():
    data = request.get_json()

    return jsonify({
        "message": "Resume received",
        "dummy_score": 75,
        "received_text": data.get("text", "")
    })

if __name__ == "__main__":
    app.run(debug=True)