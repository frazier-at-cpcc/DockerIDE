const express = require('express');
const dotenv = require('dotenv');
const { ContainerManager } = require('./container/containerManager');
const { KubernetesManager } = require('./container/kubernetesManager');
const { GitHubManager } = require('./github/githubManager');
const { StorageManager } = require('./storage/storageManager');
const { logger } = require('./utils/logger');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// Initialize managers
const useKubernetes = process.env.USE_KUBERNETES === 'true';
const containerManager = useKubernetes
  ? new KubernetesManager()
  : new ContainerManager();
const githubManager = new GitHubManager();
const storageManager = new StorageManager();

// Middleware to verify internal API key
const verifyApiKey = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const apiKey = authHeader?.replace('Bearer ', '');

  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'workspace-manager' });
});

// Create workspace endpoint
app.post('/workspace/create', verifyApiKey, async (req, res) => {
  try {
    const { sessionId, user, context, token } = req.body;

    logger.info(`Creating workspace for session ${sessionId}`);

    // Determine Docker image based on language/context
    const imageName = getDockerImage(context.language);

    // Prepare environment variables
    const envVars = {
      STUDENT_ID: user.id,
      STUDENT_NAME: user.name,
      COURSE_ID: context.courseId,
      ASSIGNMENT_ID: context.assignmentId,
      GITHUB_REPO: context.githubRepo,
      VSCODE_EXTENSIONS: context.extensions,
      VSCODE_PASSWORD: generatePassword(),
      SESSION_TOKEN: token
    };

    // Add GitHub token if available
    if (context.githubRepo && process.env.GITHUB_TOKEN) {
      envVars.GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    }

    // Create container/pod
    const container = await containerManager.createWorkspace({
      sessionId,
      userId: user.id,
      imageName,
      envVars,
      labels: {
        'dockeride.session': sessionId,
        'dockeride.user': user.id,
        'dockeride.course': context.courseId,
        'dockeride.assignment': context.assignmentId
      }
    });

    // Create persistent volume if needed
    if (process.env.ENABLE_PERSISTENCE === 'true') {
      await storageManager.createUserVolume(user.id, sessionId);
    }

    // Generate workspace URL
    const workspaceUrl = `${process.env.BASE_URL || 'http://localhost'}/workspace/${sessionId}`;

    res.json({
      success: true,
      sessionId,
      containerId: container.id,
      workspaceUrl,
      password: envVars.VSCODE_PASSWORD
    });

  } catch (error) {
    logger.error('Failed to create workspace:', error);
    res.status(500).json({
      error: 'Failed to create workspace',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Delete workspace endpoint
app.delete('/workspace/:sessionId', verifyApiKey, async (req, res) => {
  try {
    const { sessionId } = req.params;

    logger.info(`Deleting workspace ${sessionId}`);

    await containerManager.deleteWorkspace(sessionId);

    res.json({
      success: true,
      message: 'Workspace deleted successfully'
    });

  } catch (error) {
    logger.error('Failed to delete workspace:', error);
    res.status(500).json({
      error: 'Failed to delete workspace',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Get workspace status
app.get('/workspace/:sessionId/status', verifyApiKey, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const status = await containerManager.getWorkspaceStatus(sessionId);

    res.json(status);

  } catch (error) {
    logger.error('Failed to get workspace status:', error);
    res.status(500).json({
      error: 'Failed to get workspace status',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// List active workspaces
app.get('/workspaces', verifyApiKey, async (req, res) => {
  try {
    const workspaces = await containerManager.listWorkspaces();

    res.json({
      count: workspaces.length,
      workspaces
    });

  } catch (error) {
    logger.error('Failed to list workspaces:', error);
    res.status(500).json({
      error: 'Failed to list workspaces',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Helper functions
function getDockerImage(language) {
  const imageMap = {
    'python': 'dockeride/python:latest',
    'java': 'dockeride/java:latest',
    'nodejs': 'dockeride/nodejs:latest',
    'javascript': 'dockeride/nodejs:latest',
    'js': 'dockeride/nodejs:latest',
    'typescript': 'dockeride/nodejs:latest',
    'ts': 'dockeride/nodejs:latest',
    'cpp': 'dockeride/cpp:latest',
    'c++': 'dockeride/cpp:latest',
    'c': 'dockeride/cpp:latest',
    'sql': 'dockeride/sql:latest',
    'mysql': 'dockeride/sql:latest',
    'postgresql': 'dockeride/sql:latest',
    'postgres': 'dockeride/sql:latest',
    'sqlite': 'dockeride/sql:latest',
    'base': 'dockeride/base:latest'
  };

  return imageMap[language?.toLowerCase()] || 'dockeride/base:latest';
}

function generatePassword() {
  return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
}

// Start server
app.listen(PORT, () => {
  logger.info(`Workspace Manager running on port ${PORT}`);
  logger.info(`Using ${useKubernetes ? 'Kubernetes' : 'Docker'} container manager`);
});