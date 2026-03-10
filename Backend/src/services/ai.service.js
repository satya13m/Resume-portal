const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .describe(
      "A score between 0 and 100 indicating how well the candidate's profile matches the job describe",
    ),
  technicalQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question can be asked in the interview"),
        intention: z
          .string()
          .describe("The intention of interviewer behind asking this question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take etc.",
          ),
      }),
    )
    .describe(
      "Technical questions that can be asked in the interview along with their intention and how to answer them",
    ),

  behavioralQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question can be asked in the interview"),
        intention: z
          .string()
          .describe("The intention of interviewer behind asking this question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take etc.",
          ),
      }),
    )
    .describe(
      "Behavioral questions that can be asked in the interview along with their intention and how to answer them",
    ),

  skillGaps: z
    .array(
      z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z
          .enum(["low", "medium", "high"])
          .describe(
            "The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances",
          ),
      }),
    )
    .describe(
      "List of skill gaps in the candidate's profile along with their severity",
    ),
  preparationPlan: z
    .array(
      z.object({
        day: z
          .number()
          .describe("The day number in the preparation plan, starting from 1"),
        focus: z
          .string()
          .describe(
            "The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc.",
          ),
        tasks: z
          .array(z.string())
          .describe(
            "List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.",
          ),
      }),
    )
    .describe(
      "A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively",
    ),
  title: z
    .string()
    .describe(
      "The title of the job for which the interview report is generated",
    ),
});

// async function generateInterviewReport({resume,jobDescription,selfDescription}){

//    const prompt = `
// You are an expert technical interviewer.

// Analyze the candidate's resume, self description, and job description.

// Generate a detailed interview preparation report.

// Requirements:
// - Give a matchScore between 0 and 100
// - Generate at least 5 technical interview questions
// - Generate at least 3 behavioral interview questions
// - Identify skill gaps
// - Generate a 5 day preparation plan

// Candidate Resume:
// ${resume}

// Self Description:
// ${selfDescription}

// Job Description:
// ${jobDescription}
// `;

//    const response = await ai.models.generateContent({
//      model: "gemini-2.5-flash",
//      contents: prompt,
//      config: {
//        responseMimeType: "application/json",
//        responseSchema: zodToJsonSchema(interviewReportSchema),
//      },
//    });

//    let parsed;
//    try {
//      parsed = JSON.parse(response.text);
//    } catch (e) {
//      throw new Error("AI returned invalid JSON: " + response.text);
//    }

//    // Validate against Zod schema before returning
//    const result = interviewReportSchema.safeParse(parsed);
//    if (!result.success) {
//      throw new Error(
//        "AI response failed schema validation: " +
//          JSON.stringify(result.error.errors),
//      );
//    }

//    return result.data;
// }

// async function generateInterviewReport({
//   resume,
//   jobDescription,
//   selfDescription,
// }) {
//   const prompt = `
// You are an expert technical interviewer.

// Analyze the candidate's resume, self description, and job description.

// Generate a detailed interview preparation report.

// Requirements:
// - Give a matchScore between 0 and 100
// - Generate at least 5 technical interview questions
// - Generate at least 3 behavioral interview questions
// - Identify skill gaps
// - Generate a 5 day preparation plan

// Candidate Resume:
// ${resume}

// Self Description:
// ${selfDescription}

// Job Description:
// ${jobDescription}
// `;

//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: prompt,
//     config: {
//       responseMimeType: "application/json",
//       responseSchema: zodToJsonSchema(interviewReportSchema),
//     },
//   });

//   console.log("Raw Gemini response:", response.text); // 👈 Add this to see what AI actually returns

//   let parsed;
//   try {
//     parsed = JSON.parse(response.text);
//   } catch (e) {
//     throw new Error("AI returned invalid JSON: " + response.text);
//   }

//   console.log("Parsed AI response:", JSON.stringify(parsed, null, 2)); // 👈 See parsed structure

//   const result = interviewReportSchema.safeParse(parsed);
//   if (!result.success) {
//     // Fix: properly serialize Zod errors
//     throw new Error(
//       "AI response failed schema validation: " +
//         JSON.stringify(result.error.flatten()),
//     );
//   }

//   return result.data;
// }

async function generateInterviewReport({
  resume,
  jobDescription,
  selfDescription,
}) {
  const prompt = `
You are an expert technical interviewer.

Analyze the candidate's resume, self description, and job description.

Generate a detailed interview preparation report as a JSON object with EXACTLY this structure:
{
  "title": "Job title extracted from the job description",
  "matchScore": <number 0-100>,
  "technicalQuestions": [
    {
      "question": "the question text",
      "intention": "why interviewer asks this",
      "answer": "how to answer it"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "the question text",
      "intention": "why interviewer asks this",
      "answer": "how to answer it"
    }
  ],
  "skillGaps": [
    {
      "skill": "skill name",
      "severity": "low" | "medium" | "high"
    }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "main topic for the day",
      "tasks": ["task 1", "task 2"]
    }
  ]
}

Requirements:
- Give a matchScore between 0 and 100
- Generate at least 5 technical interview questions, each with question, intention, and answer fields
- Generate at least 3 behavioral interview questions, each with question, intention, and answer fields
- Identify at least 3 skill gaps, each with skill and severity (only "low", "medium", or "high")
- Generate a 5 day preparation plan, each with day (number), focus, and tasks (array of strings)
- Extract the job title from the job description for the title field
- Return ONLY the JSON object, no extra text

Candidate Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  let parsed;
  try {
    parsed = JSON.parse(response.text);
  } catch (e) {
    throw new Error("AI returned invalid JSON: " + response.text);
  }

  // Validate with Zod
  const result = interviewReportSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      "AI response failed schema validation: " +
        JSON.stringify(result.error.flatten()),
    );
  }

  return result.data;
}

async function generatePDFfromHTML(htmlContent) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, {
    waitUntil: "networkidle2",
  });
  // Saves the PDF to hn.pdf.
  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm",
    },
  });

  await browser.close();
  return pdfBuffer;
}

//generate a html form uisng ai by taking the resume text and jd text
async function generateResumePDF({ resume, selfDescription, jobDescription }) {
  const resumePdfSchema = z.object({
    html: z
      .string()
      .describe(
        "The HTML content of the resume which can be converted to PDF using any library like puppeteer",
      ),
  });

  const prompt = `You are a professional resume designer. Generate a SINGLE PAGE resume in HTML that fills the COMPLETE A4 page.

Candidate Details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

STRICT PAGE REQUIREMENTS:
1. Return ONLY a JSON object: {"html": "..."}
2. The resume MUST fill the ENTIRE A4 page - no empty white space at bottom
3. Page: exactly 794px wide, exactly 1123px tall, overflow hidden
4. The content div must have min-height: 1083px (1123px - 40px margins)
5. ATS-friendly content only

HTML/CSS REQUIREMENTS:
- Inline styles ONLY
- Wrapper: width:794px; height:1123px; overflow:hidden; background:#fff; font-family:Arial,sans-serif;
- Inner padding: 30px 40px
- Base font-size: 10.5px
- Line-height: 1.4
- Color scheme: #1a3a5c for name and headings
- Section headings: font-size:11px; font-weight:bold; text-transform:uppercase; color:#1a3a5c; border-bottom:1.5px solid #1a3a5c; padding-bottom:2px; margin:10px 0 5px 0;
- Bullet points: margin:3px 0; padding-left:15px; font-size:10.5px
- Space between sections: margin-bottom:8px

CONTENT REQUIREMENTS:
- Name: centered, 18px, bold, color:#1a3a5c, margin-bottom:3px
- Contact: centered, 9.5px, color:#444, margin-bottom:10px
- Summary: 3-4 lines, job-tailored, no "I" start
- Education: both entries with dates aligned right using flex justify-between
- Skills: TWO rows of inline chip-style tags
  (background:#e8f0fe; border-radius:3px; padding:2px 7px; margin:2px; font-size:9.5px; display:inline-block)
- Projects: 3 most relevant projects, 3-4 bullets each
  (each bullet must be a full sentence, not too short)
- Certifications & Achievements: 2 lines
- Extracurricular: 1-2 lines

FILL THE PAGE STRATEGY:
- Projects section should take up most space (3 projects x 3-4 bullets)
- Each bullet point should be descriptive and 1.5-2 lines long
- Add a "Key Achievements" or "Extracurricular" section if space remains
- Skills section should have 2 rows of tags
- Summary should be 3-4 complete sentences

Return format — ONLY this, no markdown:
{"html": "<complete html string>"}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      // responseSchema: zodToJsonSchema(resumePdfSchema),
    },
  });

  const jsonContent = JSON.parse(response.text);
  const pdfBuffer = await generatePDFfromHTML(jsonContent.html);

  return pdfBuffer;
}

module.exports = { generateInterviewReport, generateResumePDF };
