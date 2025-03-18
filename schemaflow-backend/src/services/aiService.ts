import axios, { AxiosResponse } from "axios";
import logger from "../utils/logger";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_URL = process.env.GEMINI_API_URL;
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  logger.error("Missing GEMINI_API_KEY in environment variables.");
  throw new Error("Missing GEMINI_API_KEY in environment variables.");
}

const extractTextFromResponse = (response: AxiosResponse<any, any>) => {
  try {
    if (!response?.data) {
      throw new Error("No data in response");
    }

    const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      logger.warn("Gemini AI returned an empty response.");
      throw new Error("Invalid response format from Gemini AI.");
    }
    return text;
  } catch (error) {
    logger.error("Error extracting text from response: ", { error });
    throw new Error("Failed to parse AI response.");
  }
};

export const generateGuidedQuestions = async (type: string) => {
  try {
    logger.info("Sending request to Gemini AI...");

    const prompt = `You are a database design assistant. Ask me 5 questions to help me design a ${type} database. Focus on understanding the purpose, entities, relationships, and scalability needs.`;

    const requestPayload = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    logger.info("Request Payload:", JSON.stringify(requestPayload, null, 2));

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${API_KEY}`,
      requestPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    logger.info(
      "Received response from Gemini AI:",
      JSON.stringify(response.data, null, 2)
    );

    if (
      !response.data ||
      !response.data.candidates ||
      response.data.candidates.length === 0
    ) {
      throw new Error("Invalid response structure from Gemini API");
    }

    const generatedText = extractTextFromResponse(response);
    logger.info("Generated Questions: ", generatedText);

    return generatedText
      .split("\n")
      .map((q: string) => q.trim())
      .filter(Boolean);
  } catch (error: any) {
    logger.error("API Request Error Details:", {
      message: error.message,
      response: error.response ? error.response.data : null,
      stack: error.stack,
    });
    return ["What is the main purpose of your database?"];
  }
};

export const generateSchemaFromAnswers = async (
  name: string,
  type: string,
  answers: any
) => {
  try {
    logger.info(`Generating ${type} database schema for project: ${name}`);

    const prompt = `Using the following user responses, generate a ${type} database schema for a project named "${name}":
        ${JSON.stringify(answers)}
        - If SQL, provide CREATE TABLE statements.
        - If NoSQL, define JSON schema with collections.`;

    logger.info("Sending request to Gemini AI...");
    const response = await axios.post(`${GEMINI_API_URL}?key=${API_KEY}`, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    logger.info("Received response from Gemini AI.");
    const generatedSchema = extractTextFromResponse(response);

    logger.info("Successfully generated database schema.");
    return generatedSchema;
  } catch (error: any) {
    logger.error(
      "API Request Error: ",
      error.response ? error.response.data : error.message
    );
    return "AI did not return a valid schema.";
  }
};
