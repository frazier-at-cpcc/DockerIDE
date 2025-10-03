const { logger } = require('../utils/logger');
const { LTI11Handler } = require('../auth/lti11Handler');

function gradeHandler(lti) {
  const lti11Handler = new LTI11Handler();

  return async (req, res) => {
    try {
      const { sessionId, score, comment } = req.body;

      // Retrieve LTI info from session
      const ltiToken = req.session.ltiToken;
      const ltiVersion = req.session.ltiVersion;

      if (!ltiToken) {
        return res.status(401).json({ error: 'No LTI session found' });
      }

      // Handle grade submission based on LTI version
      if (ltiVersion === '1.1') {
        // LTI 1.1 Basic Outcomes
        const gradeInfo = req.session.gradeInfo;

        if (!gradeInfo || !gradeInfo.lisOutcomeServiceUrl) {
          return res.status(400).json({ error: 'Grade passback not available for this session' });
        }

        try {
          // Normalize score to 0-1 range for LTI 1.1
          const normalizedScore = score / 100;
          await lti11Handler.sendGrade(gradeInfo, normalizedScore, comment);

          logger.info(`LTI 1.1 Grade submitted: Session ${sessionId}, Score ${score}`);
          res.json({
            success: true,
            message: 'Grade submitted successfully (LTI 1.1)'
          });

        } catch (gradeError) {
          logger.error('LTI 1.1 grade submission error:', gradeError);
          res.status(500).json({
            error: 'Failed to submit grade',
            details: process.env.NODE_ENV !== 'production' ? gradeError.message : undefined
          });
        }

      } else {
        // LTI 1.3 Advantage Grade Services
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

          logger.info(`LTI 1.3 Grade submitted: User ${ltiToken.user.id}, Score ${score}`);
          res.json({
            success: true,
            message: 'Grade submitted successfully (LTI 1.3)'
          });

        } catch (gradeError) {
          logger.error('LTI 1.3 grade submission error:', gradeError);
          res.status(500).json({
            error: 'Failed to submit grade',
            details: process.env.NODE_ENV !== 'production' ? gradeError.message : undefined
          });
        }
      }

    } catch (error) {
      logger.error('Grade handler error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

module.exports = gradeHandler;