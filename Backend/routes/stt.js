const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { transcribeAudioController } = require('../controllers/sttController');

const router = express.Router();

// Create /uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: uploadDir });

// POST /api/stt/upload-audio
router.post('/upload-audio', upload.single('audio'), transcribeAudioController);

module.exports = router;
