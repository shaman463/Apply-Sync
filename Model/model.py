import json
import re
import sys
from pathlib import Path

import pdfplumber

try:
    from docx import Document
except ImportError:
    Document = None


# 1️⃣ Extract text from PDF
def extract_text_from_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            if page.extract_text():
                text += page.extract_text() + "\n"
    return text


# 2️⃣ Build structured prompt
SECTION_KEYWORDS = {
    "summary": ["summary", "professional summary", "profile", "objective"],
    "experience": ["experience", "work experience", "employment", "professional experience"],
    "education": ["education", "academics"],
    "skills": ["skills", "technical skills", "core skills"],
    "projects": ["projects", "project experience"],
    "certifications": ["certifications", "certificates", "licenses"],
}

ACTION_VERBS = {
    "built", "created", "developed", "designed", "led", "managed", "improved",
    "increased", "reduced", "optimized", "automated", "launched", "delivered",
    "implemented", "analyzed", "owned", "collaborated", "engineered", "deployed",
}

TECH_KEYWORDS = {
    "python", "javascript", "typescript", "react", "node", "express", "django",
    "flask", "java", "c#", "c++", "sql", "postgres", "mongodb", "redis",
    "aws", "azure", "gcp", "docker", "kubernetes", "git", "linux", "graphql",
    "rest", "api", "microservices", "ci/cd", "terraform", "html", "css",
}

INFORMAL_WORDS = {
    "cool", "awesome", "dude", "bro", "lol", "omg", "hey", "yo",
}


def extract_text_from_docx(file_path):
    if Document is None:
        raise RuntimeError("python-docx is required for .docx files. Install with: pip install python-docx")

    doc = Document(file_path)
    paragraphs = [p.text.strip() for p in doc.paragraphs if p.text and p.text.strip()]
    return "\n".join(paragraphs)


def extract_text(file_path):
    ext = Path(file_path).suffix.lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    if ext == ".docx":
        return extract_text_from_docx(file_path)
    raise RuntimeError("Unsupported file type. Use PDF or DOCX.")


def clamp_score(value):
    return max(0, min(100, round(value)))


def analyze_resume(resume_text):
    lines = [line.strip() for line in resume_text.splitlines() if line.strip()]
    lower_text = resume_text.lower()
    words = re.findall(r"[A-Za-z0-9+#.-]+", resume_text)
    word_count = len(words)

    email_match = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", resume_text)
    phone_match = re.search(r"(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}", resume_text)

    sections_found = set()
    for line in lines:
        cleaned = re.sub(r"[^a-z ]", "", line.lower()).strip()
        if not cleaned or len(cleaned) > 40:
            continue
        for section, keywords in SECTION_KEYWORDS.items():
            if any(cleaned == key or cleaned.startswith(f"{key} ") for key in keywords):
                sections_found.add(section)

    total_sections = len(SECTION_KEYWORDS)
    structure_score = (len(sections_found) / total_sections) * 90
    if email_match:
        structure_score += 5
    if phone_match:
        structure_score += 5
    structure_score = clamp_score(structure_score)

    bullet_lines = [line for line in lines if re.match(r"^[-*•]", line)]
    bullet_ratio = len(bullet_lines) / max(1, len(lines))
    sentences = [s.strip() for s in re.split(r"[.!?]+", resume_text) if s.strip()]
    avg_words_per_sentence = word_count / max(1, len(sentences))
    long_line_ratio = len([line for line in lines if len(line) > 120]) / max(1, len(lines))

    clarity_score = 100
    if avg_words_per_sentence > 30:
        clarity_score -= 30
    elif avg_words_per_sentence > 25:
        clarity_score -= 20
    if long_line_ratio > 0.35:
        clarity_score -= 25
    elif long_line_ratio > 0.2:
        clarity_score -= 15
    if bullet_ratio < 0.1:
        clarity_score -= 10
    elif bullet_ratio > 0.2:
        clarity_score += 5
    clarity_score = clamp_score(clarity_score)

    quantified = 0
    for line in bullet_lines:
        lower_line = line.lower()
        if re.search(r"\d", line) and any(verb in lower_line for verb in ACTION_VERBS):
            quantified += 1
    impact_score = clamp_score(20 + quantified * 12)

    found_tech = {kw for kw in TECH_KEYWORDS if kw in lower_text}
    technical_depth_score = clamp_score(20 + len(found_tech) * 5)

    informal_hits = sum(1 for word in INFORMAL_WORDS if word in lower_text)
    all_caps_words = re.findall(r"\b[A-Z]{4,}\b", resume_text)
    exclamations = resume_text.count("!")
    professionalism_score = 100 - (informal_hits * 8) - (len(all_caps_words) * 2) - (min(3, exclamations) * 5)
    professionalism_score = clamp_score(professionalism_score)

    non_alnum_ratio = len(re.findall(r"[^A-Za-z0-9\s]", resume_text)) / max(1, len(resume_text))
    ats_score = 100
    if word_count < 300:
        ats_score -= 30
    if non_alnum_ratio > 0.2:
        ats_score -= 20
    if len(sections_found) < 3:
        ats_score -= 20
    if not email_match:
        ats_score -= 10
    if not phone_match:
        ats_score -= 10
    ats_score = clamp_score(ats_score)

    overall_score = clamp_score(
        (structure_score + clarity_score + impact_score + technical_depth_score + professionalism_score + ats_score) / 6
    )

    strengths = []
    weaknesses = []
    suggestions = []

    if structure_score >= 80:
        strengths.append("Clear section structure with standard headings.")
    else:
        weaknesses.append("Missing or unclear section headings.")
        suggestions.append("Add clear headings for Experience, Skills, and Education.")

    if impact_score >= 70:
        strengths.append("Includes quantified achievements.")
    else:
        weaknesses.append("Few quantified achievements.")
        suggestions.append("Add metrics (%, $, time saved) to highlight impact.")

    if technical_depth_score >= 70:
        strengths.append("Strong technical coverage for the target role.")
    else:
        weaknesses.append("Limited technical detail.")
        suggestions.append("List key tools, frameworks, and platforms used.")

    if clarity_score >= 80:
        strengths.append("Readable layout with concise bullets.")
    else:
        weaknesses.append("Bullets or sentences are too long or inconsistent.")
        suggestions.append("Use shorter bullet points and keep sentences under 25 words.")

    if professionalism_score >= 85:
        strengths.append("Professional tone throughout.")
    else:
        weaknesses.append("Tone or formatting feels informal.")
        suggestions.append("Remove casual language and excessive punctuation.")

    if ats_score >= 80:
        strengths.append("ATS-friendly formatting and content length.")
    else:
        weaknesses.append("May not scan well in ATS systems.")
        suggestions.append("Ensure consistent headings and avoid heavy symbols or tables.")

    if not strengths:
        strengths.append("Includes core resume sections.")
    if not weaknesses:
        weaknesses.append("No critical weaknesses detected.")
    if not suggestions:
        suggestions.append("Consider tailoring skills to the target job description.")

    return {
        "overall_score": overall_score,
        "structure_score": structure_score,
        "clarity_score": clarity_score,
        "impact_score": impact_score,
        "technical_depth_score": technical_depth_score,
        "professionalism_score": professionalism_score,
        "ats_score": ats_score,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "improvement_suggestions": suggestions,
    }


# 4️⃣ Run model
if __name__ == "__main__":
    file_path = sys.argv[1] if len(sys.argv) > 1 else "resume.pdf"
    resume_text = extract_text(file_path)
    if not resume_text:
        raise SystemExit("Unable to extract text from the resume.")

    result = analyze_resume(resume_text)
    print(json.dumps(result))
