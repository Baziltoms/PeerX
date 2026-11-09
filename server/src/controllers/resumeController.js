import { Resume, ResumeFeedback } from '../models/index.js';
import {
  checkResumeEligibility,
  compileStudentResumeData,
  generateStudentResume,
  updateStudentResume,
  resetStudentResume,
} from '../services/resumeService.js';

export const getResumeEligibility = async (req, res, next) => {
  try {
    const status = await checkResumeEligibility(req.user._id);
    return res.status(200).json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
};

export const previewResume = async (req, res, next) => {
  try {
    const { fresh } = req.query;
    if (fresh !== 'true') {
      const existing = await Resume.findOne({ student: req.user._id });
      if (existing) {
        return res.status(200).json({
          success: true,
          data: existing,
        });
      }
    }

    const data = await compileStudentResumeData(req.user._id);
    const existing = await Resume.findOne({ student: req.user._id });

    return res.status(200).json({
      success: true,
      data: {
        ...data,
        templateId: existing?.templateId || 'modern_tech',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const generateResume = async (req, res, next) => {
  try {
    const { templateId = 'modern_tech', resumeData } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';

    const result = await generateStudentResume(req.user._id, templateId, ipAddress, resumeData);

    return res.status(200).json({
      success: true,
      message: 'Resume generated successfully. Stored in your academic portfolio.',
      data: result,
    });
  } catch (error) {
    if (error.statusCode === 429) {
      return res.status(429).json({
        success: false,
        message: error.message,
        nextEligibleAt: error.nextEligibleAt,
      });
    }
    next(error);
  }
};

export const updateResume = async (req, res, next) => {
  try {
    const resume = await updateStudentResume(req.user._id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Resume customized and saved successfully.',
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

export const resetResume = async (req, res, next) => {
  try {
    const resume = await resetStudentResume(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Resume reset to academic profile defaults successfully.',
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

export const getMySavedResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ student: req.user._id });
    if (!resume) {
      // Return compiled preview data if not yet officially generated
      const data = await compileStudentResumeData(req.user._id);
      return res.status(200).json({
        success: true,
        data: {
          ...data,
          templateId: 'modern_tech',
          isDraft: true,
        },
      });
    }

    return res.status(200).json({ success: true, data: resume });
  } catch (error) {
    next(error);
  }
};

export const submitResumeFeedback = async (req, res, next) => {
  try {
    const { rating = 5, suggestions = '', templateId = 'modern_tech' } = req.body;
    const numRating = Number(rating);

    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.',
      });
    }

    const feedback = await ResumeFeedback.create({
      student: req.user._id,
      rating: Math.round(numRating),
      suggestions: typeof suggestions === 'string' ? suggestions.trim() : '',
      templateUsed: templateId,
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for your rating and suggestions!',
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

export const getResumeFeedback = async (req, res, next) => {
  try {
    const feedbacks = await ResumeFeedback.find({ student: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    next(error);
  }
};
