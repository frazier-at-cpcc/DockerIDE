# DockerIDE - Educational Development Environment Platform

A Docker-based system that launches students into custom VMs with VS Code Server through LTI integration with Learning Management Systems (LMS). Students get instant access to pre-configured development environments with the right compilers, tools, and GitHub repositories based on their assignments.

## Features

- **LTI 1.3 Integration**: Secure authentication and grade passback to LMS platforms
- **Instant Development Environments**: Students get VS Code in the browser with zero setup
- **Assignment-Specific Configuration**: Automatic GitHub repository cloning and compiler setup
- **Multi-Language Support**: Pre-built images for Python, Java, Node.js, C/C++, and more
- **Scalable Architecture**: Supports both Docker and Kubernetes deployments
- **Resource Management**: CPU and memory limits per student workspace
- **Persistent Storage**: Optional volume mounting for student work

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│     LMS     │────▶│ LTI Service  │────▶│ Workspace Mgr   │
└─────────────┘     └──────────────┘     └─────────────────┘
                            │                      │
                            ▼                      ▼
                    ┌──────────────┐      ┌─────────────────┐
                    │ API Gateway  │      │ Docker/K8s      │
                    └──────────────┘      └─────────────────┘
                            │                      │
                            ▼                      ▼
                    ┌──────────────┐      ┌─────────────────┐
                    │   Student    │      │ VS Code Server  │
                    │   Browser    │◀─────│   Container     │
                    └──────────────┘      └─────────────────┘
```

## Quick Start (Development)

### Prerequisites
- Docker and Docker Compose
- Node.js 20+
- Git

### Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/DockerIDE.git
cd DockerIDE
```

2. Create environment file:
```bash
cat > .env <<EOF
GITHUB_TOKEN=your_github_token_here
NODE_ENV=development
EOF
```

3. Start services:
```bash
docker-compose -f docker-compose.dev.yaml up -d
```

4. Test VS Code Server:
```bash
# Launch a test workspace
docker-compose -f docker-compose.dev.yaml --profile test up sample-workspace
# Access at http://localhost:8080 (password: password123)
```

## Production Deployment

### Kubernetes Deployment

1. Create namespace and secrets:
```bash
kubectl apply -f kubernetes/namespace.yaml

kubectl create secret generic dockeride-secrets \
  --from-literal=db-host=mysql.dockeride.svc.cluster.local \
  --from-literal=db-user=dockeride \
  --from-literal=db-password=secure_password \
  --from-literal=jwt-secret=your-jwt-secret-min-32-chars \
  --from-literal=session-secret=your-session-secret \
  --from-literal=encryption-key=your-encryption-key \
  --from-literal=internal-api-key=your-internal-api-key \
  --from-literal=github-token=your-github-token \
  -n dockeride
```

2. Deploy services:
```bash
kubectl apply -f kubernetes/deployments/
```

3. Configure ingress (example):
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: dockeride-ingress
  namespace: dockeride
spec:
  rules:
  - host: dockeride.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 80
```

## LMS Configuration

### Canvas LMS

1. Add external tool:
   - Name: DockerIDE
   - Consumer Key: `dockeride-client`
   - Launch URL: `https://dockeride.example.com/lti/launch`
   - Domain: `dockeride.example.com`
   - Privacy: Public

2. Configure custom parameters:
```
assignment_id=$Canvas.assignment.id
github_repo=https://github.com/yourusername/assignment-repo
language=python
vscode_extensions=ms-python.python,ms-python.vscode-pylance
```

### Moodle LMS

1. Add LTI Tool:
   - Tool name: DockerIDE
   - Tool URL: `https://dockeride.example.com/lti/launch`
   - Consumer key: `dockeride-client`
   - Shared secret: Configure in LTI service

2. Custom parameters:
```
assignment_id=$ResourceLink.id
github_repo=https://github.com/yourusername/assignment-repo
language=java
```

## Building Docker Images

### Base Image
```bash
cd docker-images/base
docker build -t dockeride/base:latest .
docker push dockeride/base:latest
```

### Language-Specific Images
```bash
# Python
cd docker-images/python
docker build -t dockeride/python:latest .

# Java
cd docker-images/java
docker build -t dockeride/java:latest .

# Node.js
cd docker-images/nodejs
docker build -t dockeride/nodejs:latest .
```

## Environment Variables

### LTI Service
- `DB_HOST`: MySQL database host
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASS`: Database password
- `JWT_SECRET`: Secret for JWT signing (min 32 chars)
- `SESSION_SECRET`: Express session secret
- `ENCRYPTION_KEY`: LTI encryption key
- `PLATFORM_URL`: LMS platform URL
- `PLATFORM_CLIENT_ID`: LTI client ID

### Workspace Manager
- `USE_KUBERNETES`: Use Kubernetes instead of Docker (`true`/`false`)
- `K8S_NAMESPACE`: Kubernetes namespace (default: `dockeride`)
- `DOCKER_NETWORK`: Docker network name
- `GITHUB_TOKEN`: GitHub personal access token
- `CONTAINER_MEMORY`: Memory limit in bytes
- `CONTAINER_CPU_SHARES`: CPU shares (1024 = 1 CPU)

### VS Code Server Container
- `STUDENT_ID`: Student identifier
- `COURSE_ID`: Course identifier
- `ASSIGNMENT_ID`: Assignment identifier
- `GITHUB_REPO`: Repository to clone
- `VSCODE_EXTENSIONS`: Comma-separated extension list
- `VSCODE_PASSWORD`: Access password

## Security Considerations

1. **Network Security**:
   - Use HTTPS in production
   - Implement rate limiting
   - Use network policies in Kubernetes

2. **Container Security**:
   - Run containers as non-root users
   - Set resource limits
   - Use read-only root filesystems where possible

3. **Authentication**:
   - LTI 1.3 with OAuth2
   - JWT tokens with expiration
   - Session management with Redis

4. **Data Protection**:
   - Encrypt sensitive data
   - Use secrets management
   - Regular security updates

## Monitoring

### Metrics
- Container CPU and memory usage
- Active workspace count
- LTI launch success rate
- Grade passback status

### Logging
- Centralized logging with structured formats
- Error tracking and alerting
- Audit logs for LTI launches

## Troubleshooting

### Workspace won't start
1. Check pod/container status:
```bash
kubectl get pods -n dockeride
kubectl describe pod workspace-xxx -n dockeride
```

2. Check logs:
```bash
kubectl logs -n dockeride workspace-xxx
```

### LTI launch fails
1. Verify LTI configuration in LMS
2. Check LTI service logs
3. Validate JWT tokens

### Performance issues
1. Check resource limits
2. Monitor container metrics
3. Scale replicas if needed

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [github.com/yourusername/DockerIDE/issues](https://github.com/yourusername/DockerIDE/issues)
- Documentation: [docs.dockeride.example.com](https://docs.dockeride.example.com)