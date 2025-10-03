const Docker = require('dockerode');
const { logger } = require('../utils/logger');

class ContainerManager {
  constructor() {
    this.docker = new Docker({
      socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
    });
  }

  async createWorkspace({ sessionId, userId, imageName, envVars, labels }) {
    try {
      // Check if image exists, pull if not
      await this.ensureImage(imageName);

      // Create container
      const container = await this.docker.createContainer({
        Image: imageName,
        name: `dockeride-${sessionId}`,
        Hostname: `workspace-${sessionId}`,
        Env: Object.entries(envVars).map(([key, value]) => `${key}=${value}`),
        Labels: {
          ...labels,
          'dockeride.managed': 'true'
        },
        HostConfig: {
          AutoRemove: false,
          Memory: parseInt(process.env.CONTAINER_MEMORY || '2147483648'), // 2GB
          CpuShares: parseInt(process.env.CONTAINER_CPU_SHARES || '1024'),
          NetworkMode: process.env.DOCKER_NETWORK || 'bridge',
          PortBindings: {
            '8080/tcp': [{ HostPort: '0' }] // Auto-assign port
          }
        },
        ExposedPorts: {
          '8080/tcp': {}
        }
      });

      // Start container
      await container.start();

      // Get container info
      const info = await container.inspect();
      const port = info.NetworkSettings.Ports['8080/tcp'][0].HostPort;

      logger.info(`Container created: ${info.Id} on port ${port}`);

      return {
        id: info.Id,
        name: info.Name,
        port,
        status: info.State.Status
      };

    } catch (error) {
      logger.error('Failed to create container:', error);
      throw error;
    }
  }

  async deleteWorkspace(sessionId) {
    try {
      const containers = await this.docker.listContainers({
        all: true,
        filters: {
          label: [`dockeride.session=${sessionId}`]
        }
      });

      for (const containerInfo of containers) {
        const container = this.docker.getContainer(containerInfo.Id);

        // Stop container if running
        if (containerInfo.State === 'running') {
          await container.stop();
        }

        // Remove container
        await container.remove();

        logger.info(`Container ${containerInfo.Id} deleted`);
      }

    } catch (error) {
      logger.error('Failed to delete container:', error);
      throw error;
    }
  }

  async getWorkspaceStatus(sessionId) {
    try {
      const containers = await this.docker.listContainers({
        all: true,
        filters: {
          label: [`dockeride.session=${sessionId}`]
        }
      });

      if (containers.length === 0) {
        return { status: 'not_found' };
      }

      const containerInfo = containers[0];
      const container = this.docker.getContainer(containerInfo.Id);
      const stats = await container.stats({ stream: false });

      return {
        status: containerInfo.State,
        created: containerInfo.Created,
        id: containerInfo.Id,
        ports: containerInfo.Ports,
        stats: {
          cpu: this.calculateCPUPercent(stats),
          memory: {
            usage: stats.memory_stats.usage,
            limit: stats.memory_stats.limit,
            percent: (stats.memory_stats.usage / stats.memory_stats.limit) * 100
          }
        }
      };

    } catch (error) {
      logger.error('Failed to get container status:', error);
      throw error;
    }
  }

  async listWorkspaces() {
    try {
      const containers = await this.docker.listContainers({
        all: true,
        filters: {
          label: ['dockeride.managed=true']
        }
      });

      return containers.map(container => ({
        id: container.Id,
        sessionId: container.Labels['dockeride.session'],
        userId: container.Labels['dockeride.user'],
        courseId: container.Labels['dockeride.course'],
        assignmentId: container.Labels['dockeride.assignment'],
        status: container.State,
        created: container.Created
      }));

    } catch (error) {
      logger.error('Failed to list containers:', error);
      throw error;
    }
  }

  async ensureImage(imageName) {
    try {
      const images = await this.docker.listImages({
        filters: { reference: [imageName] }
      });

      if (images.length === 0) {
        logger.info(`Pulling image ${imageName}...`);
        const stream = await this.docker.pull(imageName);

        // Wait for pull to complete
        await new Promise((resolve, reject) => {
          this.docker.modem.followProgress(stream, (err, output) => {
            if (err) reject(err);
            else resolve(output);
          });
        });

        logger.info(`Image ${imageName} pulled successfully`);
      }
    } catch (error) {
      logger.error(`Failed to ensure image ${imageName}:`, error);
      throw error;
    }
  }

  calculateCPUPercent(stats) {
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage -
      stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta = stats.cpu_stats.system_cpu_usage -
      stats.precpu_stats.system_cpu_usage;
    const cpuCount = stats.cpu_stats.online_cpus || 1;

    if (systemDelta > 0 && cpuDelta > 0) {
      return ((cpuDelta / systemDelta) * cpuCount * 100).toFixed(2);
    }
    return 0;
  }
}

module.exports = { ContainerManager };