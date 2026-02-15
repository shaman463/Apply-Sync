import axios from "axios";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

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

    // Only request fields that are missing or not provided
    const missingFields = [];
    if (!existingData.company) missingFields.push("Company Name");
    if (!existingData.title) missingFields.push("Job Title");
    if (!existingData.location) missingFields.push("Location");
    if (!existingData.salary) missingFields.push("Salary Range");

    if (missingFields.length === 0) {
      console.log("✓ All fields provided, skipping extraction");
      return existingData;
    }
    
    console.log("📋 Missing fields to extract:", missingFields);
    console.log("📝 Description length:", description?.length || 0);

    const prompt = `Extract the following information from this job description. Return ONLY valid JSON with these exact keys. If a field is not found, use null.

Required fields: ${missingFields.join(", ")}

Job Description:
${description}

Return ONLY this JSON format (no markdown, no extra text):
{
  "company": "string or null",
  "title": "string or null",
  "location": "string or null",
  "salary": "string or null"
}`;

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
    console.log("✓ Groq response received, content:", content);
    
    // Parse the JSON response
    let extracted = JSON.parse(content);
    console.log("✓ Parsed extraction:", extracted);

    // Merge with existing data, preferring existing values
    const result = {
      company: existingData.company || extracted.company,
      title: existingData.title || extracted.title,
      location: existingData.location || extracted.location,
      salary: existingData.salary || extracted.salary,
    };

    const endTime = Date.now();
    console.log("✓ Extracted job details in", endTime - startTime, "ms:", result);
    return result;
  } catch (error) {
    const endTime = Date.now();
    console.error("❌ Error extracting job details from Groq in", endTime - startTime, "ms:", error.message);
    console.error("Error details:", error.response?.data || error);
    // Return existing data on error - don't fail the entire request
    return existingData;
  }
};
