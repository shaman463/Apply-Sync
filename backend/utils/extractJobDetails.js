import axios from "axios";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Helper to extract salary using regex patterns
const extractSalaryRegex = (text) => {
  if (!text) return null;
  const patterns = [
    /₹([\d,]+\.?\d*)\s*-\s*₹([\d,]+\.?\d*)(?:\s*per\s*(month|year))?/i,
    /\$([\d,]+\.?\d*)\s*-\s*\$([\d,]+\.?\d*)(?:\s*per\s*(month|year))?/i,
    /([\d,]+\.?\d*)\s*-\s*([\d,]+\.?\d*)\s*(per month|per year|monthly|yearly)/i,
    /Pay:\s*([₹\$]?[\d,.\s-]+(?:per month|per year|monthly|yearly)?)/i
  ];
  
  for (let pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      console.log("💰 Regex found salary:", match[0]);
      return match[0].trim();
    }
  }
  return null;
};

/**
 * Extract job details from description using Groq LLM
 * @param {string} description - Job description text
 * @param {object} existingData - Already extracted data (company, title, location, salary)
 * @returns {object} - Extracted/enhanced job details
 */
export const extractJobDetails = async (description, existingData = {}) => {
  const startTime = Date.now();
  try {
    console.log("🔍 Starting extraction with existing data:", existingData);
    console.log("🔑 GROQ_API_KEY exists:", !!GROQ_API_KEY);
    
    if (!GROQ_API_KEY) {
      console.warn("❌ GROQ_API_KEY not set, skipping LLM extraction");
      return existingData;
    }

    // Always extract ALL fields from description - description has the complete info
    console.log("📋 Extracting ALL fields from description (priority: Groq > existing data)");
    console.log("📝 Description length:", description?.length || 0);

    const prompt = `EXTRACT job information from this job description.

Extract EXACTLY these 4 fields:
1. "title" - The job position/role name (e.g., "React Developer", "Senior Java Engineer")
2. "company" - The company/organization hiring (e.g., "Google", "Microsoft")  
3. "location" - Work location (e.g., "New York", "Mumbai", "Remote")
4. "salary" - Salary or pay range including currency and period (e.g., "₹15,000 - ₹20,000 per month")

RULES:
- Return ONLY JSON object - no markdown, no backticks, no extra text
- For each field, extract the exact value from description
- If not found, use null
- For salary: include currency symbol and period (month/year)

Job Description:
${description}

RETURN ONLY THIS JSON (no backticks, no markdown):
{"title":"string or null","company":"string or null","location":"string or null","salary":"string or null"}`;

    console.log("🚀 Calling Groq API at:", GROQ_API_URL);
    const response = await axios.post(
      GROQ_API_URL,
      {
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "mixtral-8x7b-32768", // Fast and reliable Groq model
        temperature: 0.3, // Lower temp for consistent extraction
        max_tokens: 200,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.choices[0].message.content.trim();
    console.log("✓ Groq response received, raw content:", content);
    
    // Try to extract JSON from response (handle markdown code blocks)
    let jsonStr = content;
    if (content.includes("```json")) {
      jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (content.includes("```")) {
      jsonStr = content.replace(/```\n?/g, "");
    }
    jsonStr = jsonStr.trim();
    console.log("📦 Cleaned JSON string:", jsonStr);
    
    // Parse the JSON response
    let extracted = JSON.parse(jsonStr);
    console.log("✓ Parsed extraction:", extracted);

    // Merge with existing data, but prefer Groq extraction (it's from full description)
    const result = {
      company: extracted.company || existingData.company || null,
      title: extracted.title || existingData.title || null,
      location: extracted.location || existingData.location || null,
      salary: extracted.salary || existingData.salary || extractSalaryRegex(description) || null,
    };
    
    // Log result values for debugging
    console.log("💼 Company:", result.company);
    console.log("📌 Title:", result.title);
    console.log("📍 Location:", result.location);
    console.log("💵 Salary:", result.salary);

    const endTime = Date.now();
    console.log("✓ Extracted job details in", endTime - startTime, "ms:", result);
    return result;
  } catch (error) {
    const endTime = Date.now();
    console.error("❌ Error extracting job details from Groq in", endTime - startTime, "ms:", error.message);
    if (error.response?.status) {
      console.error("❌ HTTP Status:", error.response.status);
      console.error("❌ Response data:", error.response.data);
    }
    console.error("Full error:", error);
    // Return existing data on error - don't fail the entire request
    return existingData;
  }
};
