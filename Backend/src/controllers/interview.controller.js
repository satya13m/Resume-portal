const pdfParsing = require("pdf-parse");
const interviewReportModel = require("../models/interviewReport.model");
const { generateInterviewReport,generateResumePDF } = require("../services/ai.service");

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterviewReportController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "esume PDF required",
      });
    }

    //resume text extraction
    const pdfData = await new pdfParsing.PDFParse(
      Uint8Array.from(req.file.buffer),
    ).getText();
    const resumeContent = pdfData.text;

    const { selfDescription, jobDescription } = req.body;

    //generate the techquestion,taking of content to AI
    const generateReportByAI = await generateInterviewReport({
      resume: resumeContent,
      selfDescription,
      jobDescription,
    });

    //save it to mongo
    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      resume: resumeContent,
      selfDescription,
      jobDescription,
      ...generateReportByAI,
    });

    res.status(201).json({
      message: "Interview report generated successfully",
      interviewReport,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
  const { interviewId } = req.params;
  const interviewReport = await interviewReportModel.findOne({
    _id: interviewId,
    user: req.user.id,
  });

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found.",
    });
  }

  res.status(200).json({
    message: "Interview report fetched successfully.",
    interviewReport,
  });
}

/**
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
  //only to fetch the title of the report
  const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan",);

  res.status(200).json({
    message: "Interview reports fetched successfully.",
    interviewReports,
  });
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req,res){
  const {interviewReportId} = await req.params;

  const interviewReport = await interviewReportModel.findById(interviewReportId);

  if(!interviewReport){
    return res.status(404).json({
      message:"Interview report not found"
    })
  }

  //if we get reportId , then fetch resume,jd,sd
  const {resume,jobDescription,selfDescription} = interviewReport;

  const pdfBuffer = await generateResumePDF({
    resume,
    jobDescription,
    selfDescription,
  });

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
  });

  res.send(pdfBuffer)
}

module.exports = {
  generateInterviewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController
};
