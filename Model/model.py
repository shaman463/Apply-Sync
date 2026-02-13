import json
import os
import re
import time

import pdfplumber
from openai import OpenAI

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("Missing OPENAI_API_KEY environment variable.")

client = OpenAI(api_key=api_key)


# 1️⃣ Extract text from PDF
def extract_text_from_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            if page.extract_text():
                text += page.extract_text() + "\n"
    return text


# 2️⃣ Build structured prompt
def build_prompt(resume_text):
    return f"""
You are an expert resume evaluator and ATS analyzer.

Evaluate the resume strictly.

Score based on:
1. Structure
2. Clarity
3. Impact (quantifiable achievements)
4. Technical depth
5. Professional tone
6. ATS compatibility

Scoring Rules:
- Score each category from 0 to 100
- Be strict but fair
- Average resume: 60-75
- Strong resume: 80-90
- Exceptional resume: 90+

Return ONLY valid JSON in this exact format:

{{
  "overall_score": number,
  "structure_score": number,
  "clarity_score": number,
  "impact_score": number,
  "technical_depth_score": number,
  "professionalism_score": number,
  "ats_score": number,
  "strengths": [],
  "weaknesses": [],
  "improvement_suggestions": []
}}

Resume:
{resume_text}
"""


# 3️⃣ Call LLM
def extract_json_from_text(content):
    if not content:
        return None

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{[\s\S]*\}", content)
    if not match:
        return None

    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return None


def analyze_resume(resume_text, max_attempts=3, retry_delay=0.8):
    prompt = build_prompt(resume_text)

    for attempt in range(max_attempts):
        system_message = "You are a strict resume evaluator. Return ONLY valid JSON."

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )

        content = response.choices[0].message.content
        result = extract_json_from_text(content)
        if result is not None:
            return result

        if attempt < max_attempts - 1:
            time.sleep(retry_delay)

    print("⚠️ JSON parsing failed after retries. Raw output:")
    print(content)
    return None


# 4️⃣ Run model
if __name__ == "__main__":
    file_path = "resume.pdf"   # 👈 Put a resume.pdf in this folder
    resume_text = extract_text_from_pdf(file_path)

    result = analyze_resume(resume_text)

    print("\n📊 Resume Analysis Result:\n")
    print(json.dumps(result, indent=4))
