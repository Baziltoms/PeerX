import { processAIQuery } from '../services/aiService.js';

export const handleAIChat = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a question or prompt for the AI assistant.',
      });
    }

    const response = await processAIQuery({
      user: req.user,
      prompt,
    });

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};
