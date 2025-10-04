# DockerIDE Migration to LinuxServer.io Base

## Summary

The DockerIDE application has been reworked to use the proven linuxserver.io code-server Docker implementation as its base instead of the previous custom implementation that had EISDIR errors and other issues.

## Key Changes

### 1. Base Image Changed
- **Old**: `ubuntu:22.04` with custom entrypoint script
- **New**: `ghcr.io/linuxserver/baseimage-ubuntu:noble` with s6-overlay

### 2. Process Management
- **Old**: Single entrypoint script that ran code-server directly
- **New**: s6-overlay for proper init system and service management
  - Separate init scripts for setup tasks
  - Dedicated service scripts for long-running processes

### 3. Directory Structure
- **Old**:
  - Config: `/home/student/.config/code-server`
  - Workspace: `/workspace`
  - User: `student` (UID 1000)

- **New**:
  - Config: `/config/data`
  - Extensions: `/config/extensions`
  - Workspace: `/config/workspace`
  - SSH: `/config/.ssh`
  - User: `abc` (linuxserver.io standard user)

### 4. Port Change
- **Old**: Port `8080`
- **New**: Port `8443`

### 5. Configuration Method
- **Old**: Mixture of config.yaml file and command-line arguments (caused conflicts)
- **New**: Command-line arguments only

## File Structure

### Base Image (`docker-images/base/`)

```
base/
├── Dockerfile                          # Main base image definition
└── root/
    └── etc/
        └── s6-overlay/
            └── s6-rc.d/
                ├── init-code-server/   # Init script for setup
                │   ├── type            # "oneshot"
                │   ├── up              # Points to run script
                │   ├── run             # Setup script
                │   └── dependencies.d/
                │       └── init-config
                ├── svc-code-server/    # Service script for code-server
                │   ├── type            # "longrun"
                │   ├── notification-fd # "3"
                │   ├── run             # Service execution script
                │   └── dependencies.d/
                │       └── init-services
                ├── user/
                │   └── contents.d/
                │       ├── init-code-server
                │       └── svc-code-server
                └── init-config-end/
                    └── dependencies.d/
                        └── init-code-server
```

### Python Image (`docker-images/python/`)

```
python/
├── Dockerfile                          # Python development environment
└── root/
    └── etc/
        └── s6-overlay/
            └── s6-rc.d/
                ├── init-python-extensions/  # Extension installer
                │   ├── type
                │   ├── up
                │   ├── run
                │   └── dependencies.d/
                │       └── init-code-server
                ├── user/
                │   └── contents.d/
                │       └── init-python-extensions
                └── init-config-end/
                    └── dependencies.d/
                        └── init-python-extensions
```

## Environment Variables

### Authentication
- `PASSWORD` - Set the password for code-server (default: "changeme")
- `HASHED_PASSWORD` - Use a hashed password instead

### User Configuration
- `PUID` - User ID (default: 911)
- `PGID` - Group ID (default: 911)

### Application Configuration
- `DEFAULT_WORKSPACE` - Default workspace directory (default: `/config/workspace`)
- `PROXY_DOMAIN` - Proxy domain for code-server
- `PWA_APPNAME` - Progressive Web App name (default: "DockerIDE")

### Git Repository Support
- `GITHUB_REPO` - Repository URL to clone on startup
- `GITHUB_BRANCH` - Specific branch to checkout
- `GITHUB_TOKEN` - Token for private repository access
- `STUDENT_ID` - Creates/checks out branch `student-{STUDENT_ID}`

### SSH Configuration
- `SSH_PRIVATE_KEY` - SSH private key for git operations

### Extensions (Python image)
- `VSCODE_EXTENSIONS` - Comma-separated list of extension IDs to install

## How to Build

```bash
# Build base image
cd docker-images/base
docker build -t dockeride/base:latest .

# Build Python image
cd ../python
docker build -t dockeride/python:latest .
```

## How to Run

### Basic Usage
```bash
docker run -d \
  -p 8443:8443 \
  -e PASSWORD=changeme \
  -v /path/to/config:/config \
  dockeride/python:latest
```

### With GitHub Repository
```bash
docker run -d \
  -p 8443:8443 \
  -e PASSWORD=mypassword \
  -e GITHUB_REPO=https://github.com/user/repo.git \
  -e GITHUB_BRANCH=main \
  -e STUDENT_ID=student123 \
  -v /path/to/config:/config \
  dockeride/python:latest
```

### Access
Open browser to `http://localhost:8443`

## Benefits of New Approach

1. **Proven Base**: Uses battle-tested linuxserver.io base image
2. **Proper Init**: s6-overlay provides proper process supervision
3. **No EISDIR Errors**: Lets code-server manage its own directories
4. **Better Separation**: Clear separation between init tasks and services
5. **Extensible**: Easy to add new init scripts or services
6. **Standard Conventions**: Follows linuxserver.io standards
7. **Better Permissions**: Proper permission handling via lsiown

## Migration Notes

If you have existing containers:

1. **Data Migration**: Copy data from old `/workspace` to new `/config/workspace`
2. **Port Change**: Update from 8080 to 8443
3. **Volume Mounts**: Change volume mount point to `/config`
4. **Environment Variables**: Update any scripts using `STUDENT` user to `abc` user

## Testing

After restarting Docker:

```bash
# Test base image
docker run -d -p 8443:8443 -e PASSWORD=test dockeride/base:latest

# Test Python image
docker run -d -p 8443:8443 -e PASSWORD=test dockeride/python:latest

# Check logs
docker logs <container-id>

# Access code-server
curl http://localhost:8443
```

## Troubleshooting

### Container won't start
- Check logs: `docker logs <container-id>`
- Verify s6 scripts have Unix line endings (LF not CRLF)
- Ensure scripts are executable

### Extensions not installing
- Check `VSCODE_EXTENSIONS` environment variable
- View init logs during container startup
- Extensions install on first run only

### Permission issues
- Set `PUID` and `PGID` to match your host user
- Check `/config` volume permissions

## Files Modified

1. `docker-images/base/Dockerfile` - Completely rewritten
2. `docker-images/base/entrypoint.sh` - **DELETED** (replaced by s6 scripts)
3. `docker-images/python/Dockerfile` - Rewritten to use new base
4. Created all s6-overlay service files

## Next Steps

1. Restart Docker/Rancher Desktop
2. Build the new images
3. Test with Python environment
4. Update other language images (C, C++, SQL) using same pattern
5. Update documentation and deployment scripts
