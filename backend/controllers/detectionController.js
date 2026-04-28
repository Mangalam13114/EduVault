// ═══════════════════════════════════════════════════════
// Detection Controller - AI & Plagiarism Detection
// ═══════════════════════════════════════════════════════
const { analyzeAIContent } = require('../utils/aiDetection');
const { checkPlagiarism } = require('../utils/plagiarismDetection');
const { extractTextFromFile } = require('../utils/fileParser');

// @desc    Analyze text for AI content and plagiarism
// @route   POST /api/detection/analyze
// @access  Private
exports.analyzeText = async (req, res) => {
  try {
    let { text } = req.body;

    // If file was uploaded, extract text from it
    if (req.file) {
      try {
        text = await extractTextFromFile(req.file.path);
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: 'Failed to parse uploaded file'
        });
      }
    }

    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least 50 characters of text for analysis'
      });
    }

    // Run both detections in parallel
    const [aiResult, plagiarismResult] = await Promise.all([
      analyzeAIContent(text),
      checkPlagiarism(text)
    ]);

    res.json({
      success: true,
      results: {
        aiDetection: aiResult,
        plagiarism: plagiarismResult,
        textLength: text.length,
        wordCount: text.split(/\s+/).length
      }
    });
  } catch (error) {
    console.error('Detection Error:', error);
    res.status(500).json({ success: false, message: 'Detection service error' });
  }
};

// @desc    Analyze only AI content
// @route   POST /api/detection/ai
// @access  Private
exports.analyzeAI = async (req, res) => {
  try {
    let { text } = req.body;

    if (req.file) {
      text = await extractTextFromFile(req.file.path);
    }

    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least 50 characters of text'
      });
    }

    const aiResult = await analyzeAIContent(text);
    res.json({ success: true, result: aiResult });
  } catch (error) {
    res.status(500).json({ success: false, message: 'AI detection error' });
  }
};

// @desc    Check only plagiarism
// @route   POST /api/detection/plagiarism
// @access  Private
exports.checkPlag = async (req, res) => {
  try {
    let { text } = req.body;

    if (req.file) {
      text = await extractTextFromFile(req.file.path);
    }

    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least 50 characters of text'
      });
    }

    const plagResult = await checkPlagiarism(text);
    res.json({ success: true, result: plagResult });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Plagiarism detection error' });
  }
};