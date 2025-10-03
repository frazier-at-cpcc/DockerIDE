const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { logger } = require('../utils/logger');
const { LTI11Handler } = require('../auth/lti11Handler');

function launchHandler(lti) {
  const lti11Handler = new LTI11Handler();

  return async (req, res) => {
    try {
      let user, context, ltiVersion, ltiToken, gradeInfo;

      // Detect LTI version
      if (req.body.lti_message_type && req.body.lti_version === 'LTI-1p0') {
        // LTI 1.1
        ltiVersion = '1.1';
        logger.info('Processing LTI 1.1 launch');

        // Validate LTI 1.1 signature
        if (!lti11Handler.validateRequest(req)) {
          return res.status(401).json({ error: 'Invalid LTI 1.1 signature' });
        }

        // Extract LTI 1.1 data
        const ltiData = lti11Handler.extractLTIData(req.body);
        user = ltiData.user;
        context = ltiData.context;
        gradeInfo = ltiData.gradeInfo;
        ltiToken = req.body; // Store entire payload for grade passback

      } else {
        // LTI 1.3
        ltiVersion = '1.3';
        logger.info('Processing LTI 1.3 launch');

        // Validate LTI launch
        const token = await lti.connect(req, res);

        if (!token) {
          return res.status(401).json({ error: 'Invalid LTI 1.3 launch' });
        }

        ltiToken = token;

        // Extract user and context information
        user = {
          id: token.user.id,
          name: token.user.name,
          email: token.user.email,
          roles: token.roles
        };

        context = {
          courseId: token.context?.id,
          courseName: token.context?.title,
          assignmentId: token.custom?.assignment_id,
          assignmentTitle: token.resource?.title,
          githubRepo: token.custom?.github_repo,
          language: token.custom?.language || 'base',
          extensions: token.custom?.vscode_extensions,
          compilers: token.custom?.compilers
        };
      }

      logger.info(`LTI Launch: User ${user.id} for assignment ${context.assignmentId}`);

      // Create workspace session
      const sessionId = uuidv4();
      const workspaceToken = jwt.sign(
        {
          sessionId,
          userId: user.id,
          courseId: context.courseId,
          assignmentId: context.assignmentId,
          exp: Math.floor(Date.now() / 1000) + (3600 * 4) // 4 hours
        },
        process.env.JWT_SECRET || 'your-jwt-secret'
      );

      // Request workspace creation from workspace manager
      try {
        const workspaceResponse = await axios.post(
          `${process.env.WORKSPACE_MANAGER_URL || 'http://workspace-manager:4000'}/workspace/create`,
          {
            sessionId,
            user,
            context,
            token: workspaceToken
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.INTERNAL_API_KEY || 'internal-key'}`
            }
          }
        );

        const { workspaceUrl, containerId } = workspaceResponse.data;

        // Store session for grade passback
        req.session.ltiToken = ltiToken;
        req.session.ltiVersion = ltiVersion;
        req.session.gradeInfo = gradeInfo; // For LTI 1.1
        req.session.sessionId = sessionId;
        req.session.containerId = containerId;

        // Redirect to workspace
        res.redirect(workspaceUrl);

      } catch (error) {
        logger.error('Failed to create workspace:', error);
        res.status(500).json({
          error: 'Failed to create workspace',
          details: process.env.NODE_ENV !== 'production' ? error.message : undefined
        });
      }

    } catch (error) {
      logger.error('LTI launch error:', error);
      res.status(401).json({ error: 'Invalid LTI launch request' });
    }
  };
}

module.exports = launchHandler;