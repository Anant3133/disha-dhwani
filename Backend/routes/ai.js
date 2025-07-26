const express = require('express');
const { classifyUserRequestController, getOnboardingPromptsController, generateOnboardingMCQsController } = require('../controllers/aiController');

const router = express.Router();

// POST /api/ai/classifyUserRequest
router.post('/classifyUserRequest', classifyUserRequestController);

// GET /api/ai/onboarding-mcqs?languageCode=en
router.get('/onboarding-mcqs', generateOnboardingMCQsController);

router.get('/onboarding-prompts', getOnboardingPromptsController);

module.exports = router;
