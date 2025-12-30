import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { extractTextFromFile } from './pdfRead';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    const resumePath = path.join(__dirname, 'data_files', 'resume.pdf');
    const resumeText = await extractTextFromFile(resumePath);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/devstral-2512:free",
        messages: [
          {
            role: "assistant",
            content: "You are a helpful assistant that helps me parse my resume in JSON format. Only show the JSON data in your response, wrapped in markdown triple backticks. The JSON should have the following structure: {\"name\": \"\", \"email\": \"\", \"phone\": \"\", \"skills\": [\"\", \"\"], \"experience\": [{\"company\": \"\", \"role\": \"\", \"duration\": \"\", \"responsibilities\": [\"\", \"\"]}], \"education\": [{\"institution\": \"\", \"degree\": \"\", \"year\": \"\"}] }"
          },
          {
            role: "user",
            content: "The following are the contents from my resume: " + resumeText
          }
        ]
      })
    });

    const data = await response.json();

    const rawContent = (data as any)?.choices?.[0]?.message?.content ?? '';
    const cleanedContent = rawContent.replace(/^```json|\n```$/g, "").trim();
    const parsedData = JSON.parse(cleanedContent);

    const filePath = path.join(__dirname, 'data_files', 'resume.json');
    await fs.promises.writeFile(filePath, JSON.stringify(parsedData, null, 2), 'utf8');

    console.log(`File saved successfully as ${filePath}`);
  } catch (err) {
    console.error("Error:", err);
  }
}

main();