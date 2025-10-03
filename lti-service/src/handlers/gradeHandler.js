const { logger } = require('../utils/logger');

function gradeHandler(lti) {
  return async (req, res) => {
    try {
      const { sessionId, score, comment } = req.body;

      // Retrieve LTI token from session
      const ltiToken = req.session.ltiToken;

      if (!ltiToken) {
        return res.status(401).json({ error: 'No LTI session found' });
      }

      // Send grade back to LMS using LTI Advantage Grade Services
      const gradeService = lti.Grade;
      const lineItemService = lti.LineItem;

      // Get or create line item
      const lineItem = {
        scoreMaximum: 100,
        label: 'DockerIDE Assignment',
        resourceLinkId: ltiToken.resource?.id
      };

      try {
        // Create or get line item
        const lineItemUrl = await lineItemService.createLineItem(
          ltiToken,
          lineItem
        );

        // Submit grade
        const grade = {
          userId: ltiToken.user.id,
          scoreGiven: score,
          scoreMaximum: 100,
          comment: comment || 'Graded via DockerIDE',
          timestamp: new Date().toISOString(),
          activityProgress: 'Completed',
          gradingProgress: 'FullyGraded'
        };

        await gradeService.publishScore(ltiToken, lineItemUrl, grade);

        logger.info(`Grade submitted: User ${ltiToken.user.id}, Score ${score}`);
        res.json({
          success: true,
          message: 'Grade submitted successfully'
        });

      } catch (gradeError) {
        logger.error('Grade submission error:', gradeError);
        res.status(500).json({
          error: 'Failed to submit grade',
          details: process.env.NODE_ENV !== 'production' ? gradeError.message : undefined
        });
      }

    } catch (error) {
      logger.error('Grade handler error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

module.exports = gradeHandler;