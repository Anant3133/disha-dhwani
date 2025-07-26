const { classifyUserRequest, generateSimpleTextResponse, generateMCQs, generateOnboardingMCQs, getOnboardingPrompts } = require('../services/aiService');

async function classifyUserRequestController(req, res) {
  const { userText, language } = req.body;
  if (!userText) {
    return res.status(400).json({ error: 'userText is required' });
  }

  try {
    const classification = await classifyUserRequest(userText, language);
    res.json(classification);
  } catch (error) {
    console.error('[AI Controller Error]:', error);
    res.status(500).json({ error: 'Failed to classify user request' });
  }
}

async function generateOnboardingMCQsController(req, res) {
  const languageCode = req.query.languageCode || 'en';

  try {
    const mcqs = await generateOnboardingMCQs(languageCode);
    res.json(mcqs);
  } catch (error) {
    console.error('[AI Controller MCQs Error]:', error);
    res.status(500).json({ error: 'Failed to generate onboarding MCQs' });
  }
}

async function getOnboardingPromptsController(req, res) {
    const languageCode = req.query.languageCode || 'en';

    try {
        const prompts = await getOnboardingPrompts(languageCode);
        res.json(prompts);
    } catch (error) {
        console.error('[AI Controller Prompts Error]:', error);
        res.status(500).json({ error: 'Failed to get onboarding prompts' });
    }
}

module.exports = {
  classifyUserRequestController,
  getOnboardingPromptsController,
  generateOnboardingMCQsController,
};
