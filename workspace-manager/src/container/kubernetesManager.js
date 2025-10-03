const k8s = require('@kubernetes/client-node');
const { logger } = require('../utils/logger');

class KubernetesManager {
  constructor() {
    const kc = new k8s.KubeConfig();

    // Load config based on environment
    if (process.env.NODE_ENV === 'production') {
      kc.loadFromCluster();
    } else {
      kc.loadFromDefault();
    }

    this.k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    this.k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
    this.namespace = process.env.K8S_NAMESPACE || 'dockeride';
  }

  async createWorkspace({ sessionId, userId, imageName, envVars, labels }) {
    try {
      // Create pod specification
      const pod = {
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: {
          name: `workspace-${sessionId}`,
          namespace: this.namespace,
          labels: {
            ...labels,
            'app': 'dockeride',
            'type': 'workspace'
          },
          annotations: {
            'dockeride/created': new Date().toISOString()
          }
        },
        spec: {
          containers: [{
            name: 'vscode-server',
            image: imageName,
            ports: [{ containerPort: 8080 }],
            env: Object.entries(envVars).map(([name, value]) => ({ name, value: String(value) })),
            resources: {
              requests: {
                memory: process.env.K8S_MEMORY_REQUEST || '1Gi',
                cpu: process.env.K8S_CPU_REQUEST || '500m'
              },
              limits: {
                memory: process.env.K8S_MEMORY_LIMIT || '2Gi',
                cpu: process.env.K8S_CPU_LIMIT || '1000m'
              }
            },
            volumeMounts: [{
              name: 'workspace',
              mountPath: '/workspace'
            }],
            livenessProbe: {
              httpGet: {
                path: '/healthz',
                port: 8080
              },
              initialDelaySeconds: 30,
              periodSeconds: 10
            },
            readinessProbe: {
              httpGet: {
                path: '/healthz',
                port: 8080
              },
              initialDelaySeconds: 10,
              periodSeconds: 5
            }
          }],
          volumes: [{
            name: 'workspace',
            emptyDir: {
              sizeLimit: process.env.K8S_VOLUME_SIZE || '5Gi'
            }
          }],
          restartPolicy: 'Never',
          activeDeadlineSeconds: parseInt(process.env.K8S_POD_TIMEOUT || '14400'), // 4 hours
          automountServiceAccountToken: false
        }
      };

      // Create the pod
      const response = await this.k8sApi.createNamespacedPod(this.namespace, pod);

      // Create service for the pod
      const service = {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
          name: `workspace-${sessionId}-svc`,
          namespace: this.namespace,
          labels: {
            'dockeride.session': sessionId
          }
        },
        spec: {
          type: 'ClusterIP',
          selector: {
            'dockeride.session': sessionId
          },
          ports: [{
            port: 8080,
            targetPort: 8080,
            protocol: 'TCP'
          }]
        }
      };

      await this.k8sApi.createNamespacedService(this.namespace, service);

      logger.info(`Kubernetes pod created: ${response.body.metadata.name}`);

      return {
        id: response.body.metadata.uid,
        name: response.body.metadata.name,
        status: response.body.status.phase
      };

    } catch (error) {
      logger.error('Failed to create Kubernetes pod:', error);
      throw error;
    }
  }

  async deleteWorkspace(sessionId) {
    try {
      // Delete pod
      await this.k8sApi.deleteNamespacedPod(
        `workspace-${sessionId}`,
        this.namespace,
        {},
        undefined,
        0,
        undefined,
        'Foreground'
      );

      // Delete service
      await this.k8sApi.deleteNamespacedService(
        `workspace-${sessionId}-svc`,
        this.namespace
      );

      logger.info(`Kubernetes resources for session ${sessionId} deleted`);

    } catch (error) {
      // Ignore 404 errors (resource already deleted)
      if (error.response?.statusCode !== 404) {
        logger.error('Failed to delete Kubernetes resources:', error);
        throw error;
      }
    }
  }

  async getWorkspaceStatus(sessionId) {
    try {
      const pod = await this.k8sApi.readNamespacedPodStatus(
        `workspace-${sessionId}`,
        this.namespace
      );

      const metrics = await this.getPoMetrics(`workspace-${sessionId}`);

      return {
        status: pod.body.status.phase,
        created: pod.body.metadata.creationTimestamp,
        id: pod.body.metadata.uid,
        conditions: pod.body.status.conditions,
        containerStatuses: pod.body.status.containerStatuses,
        metrics
      };

    } catch (error) {
      if (error.response?.statusCode === 404) {
        return { status: 'not_found' };
      }
      logger.error('Failed to get pod status:', error);
      throw error;
    }
  }

  async listWorkspaces() {
    try {
      const pods = await this.k8sApi.listNamespacedPod(
        this.namespace,
        undefined,
        undefined,
        undefined,
        undefined,
        'app=dockeride,type=workspace'
      );

      return pods.body.items.map(pod => ({
        id: pod.metadata.uid,
        sessionId: pod.metadata.labels['dockeride.session'],
        userId: pod.metadata.labels['dockeride.user'],
        courseId: pod.metadata.labels['dockeride.course'],
        assignmentId: pod.metadata.labels['dockeride.assignment'],
        status: pod.status.phase,
        created: pod.metadata.creationTimestamp
      }));

    } catch (error) {
      logger.error('Failed to list pods:', error);
      throw error;
    }
  }

  async getPoMetrics(podName) {
    try {
      // This requires metrics-server to be installed in the cluster
      const metricsApi = new k8s.Metrics(this.k8sApi.basePath);
      const metrics = await metricsApi.getPodMetrics(this.namespace, podName);

      return {
        cpu: metrics.body.containers[0]?.usage?.cpu,
        memory: metrics.body.containers[0]?.usage?.memory
      };
    } catch (error) {
      logger.warn('Failed to get pod metrics (metrics-server may not be installed):', error.message);
      return null;
    }
  }
}

module.exports = { KubernetesManager };