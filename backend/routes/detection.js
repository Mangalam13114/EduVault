// ═══════════════════════════════════════════════════════
// Detection Routes - AI & Plagiarism
// ═══════════════════════════════════════════════════════
const express = require('express');
const router = express.Router();
const { analyzeText, analyzeAI, checkPlag } = require('../controllers/detectionController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/analyze', protect, upload.single('file'), analyzeText);
router.post('/ai', protect, upload.single('file'), analyzeAI);
router.post('/plagiarism', protect, upload.single('file'), checkPlag);

module.exports = router;