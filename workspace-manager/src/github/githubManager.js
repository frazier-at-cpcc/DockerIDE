const axios = require('axios');
const { logger } = require('../utils/logger');

class GitHubManager {
  constructor() {
    this.githubToken = process.env.GITHUB_TOKEN;
    this.githubApi = 'https://api.github.com';
  }

  async cloneRepository(repoUrl, branch = 'main') {
    try {
      // Parse repository information
      const repoInfo = this.parseGitHubUrl(repoUrl);

      if (!repoInfo) {
        throw new Error('Invalid GitHub URL');
      }

      // Check if repository exists
      const repoData = await this.getRepository(repoInfo.owner, repoInfo.repo);

      logger.info(`Repository ${repoInfo.owner}/${repoInfo.repo} verified`);

      return {
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        branch: branch || repoData.default_branch,
        isPrivate: repoData.private,
        cloneUrl: repoData.clone_url
      };

    } catch (error) {
      logger.error('Failed to process GitHub repository:', error);
      throw error;
    }
  }

  async createStudentBranch(repoUrl, studentId) {
    try {
      const repoInfo = this.parseGitHubUrl(repoUrl);

      if (!repoInfo || !this.githubToken) {
        return null;
      }

      const branchName = `student-${studentId}`;

      // Get default branch SHA
      const defaultBranch = await this.getBranch(repoInfo.owner, repoInfo.repo, 'main');

      // Create new branch
      await axios.post(
        `${this.githubApi}/repos/${repoInfo.owner}/${repoInfo.repo}/git/refs`,
        {
          ref: `refs/heads/${branchName}`,
          sha: defaultBranch.commit.sha
        },
        {
          headers: {
            Authorization: `token ${this.githubToken}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      logger.info(`Created branch ${branchName} for ${repoInfo.owner}/${repoInfo.repo}`);
      return branchName;

    } catch (error) {
      if (error.response?.status === 422) {
        // Branch already exists
        return `student-${studentId}`;
      }
      logger.error('Failed to create student branch:', error);
      return null;
    }
  }

  async getRepository(owner, repo) {
    try {
      const headers = {
        Accept: 'application/vnd.github.v3+json'
      };

      if (this.githubToken) {
        headers.Authorization = `token ${this.githubToken}`;
      }

      const response = await axios.get(
        `${this.githubApi}/repos/${owner}/${repo}`,
        { headers }
      );

      return response.data;

    } catch (error) {
      logger.error(`Failed to get repository ${owner}/${repo}:`, error.message);
      throw error;
    }
  }

  async getBranch(owner, repo, branch) {
    try {
      const headers = {
        Accept: 'application/vnd.github.v3+json'
      };

      if (this.githubToken) {
        headers.Authorization = `token ${this.githubToken}`;
      }

      const response = await axios.get(
        `${this.githubApi}/repos/${owner}/${repo}/branches/${branch}`,
        { headers }
      );

      return response.data;

    } catch (error) {
      logger.error(`Failed to get branch ${branch}:`, error.message);
      throw error;
    }
  }

  parseGitHubUrl(url) {
    // Support various GitHub URL formats
    const patterns = [
      /github\.com[:/]([^/]+)\/([^/\.]+)/,
      /^([^/]+)\/([^/]+)$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace(/\.git$/, '')
        };
      }
    }

    return null;
  }
}

module.exports = { GitHubManager };