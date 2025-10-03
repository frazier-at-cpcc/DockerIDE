#!/bin/bash
set -e

# Function to clone repository if GITHUB_REPO is set
clone_repository() {
    if [ -n "${GITHUB_REPO}" ]; then
        echo "Cloning repository: ${GITHUB_REPO}"

        # Check if we have a GitHub token for private repos
        if [ -n "${GITHUB_TOKEN}" ]; then
            git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"
        fi

        # Clone the repository
        if [ -n "${GITHUB_BRANCH}" ]; then
            git clone -b "${GITHUB_BRANCH}" "${GITHUB_REPO}" /workspace/project 2>/dev/null || \
            git clone "${GITHUB_REPO}" /workspace/project
        else
            git clone "${GITHUB_REPO}" /workspace/project
        fi

        # If student branch doesn't exist, create it
        if [ -n "${STUDENT_ID}" ]; then
            cd /workspace/project
            git checkout -b "student-${STUDENT_ID}" 2>/dev/null || git checkout "student-${STUDENT_ID}"
        fi
    fi
}

# Function to install VS Code extensions
install_extensions() {
    if [ -n "${VSCODE_EXTENSIONS}" ]; then
        echo "Installing VS Code extensions..."

        # Ensure extensions directory exists with correct permissions
        mkdir -p /home/student/.local/share/code-server/extensions

        IFS=',' read -ra EXTENSIONS <<< "${VSCODE_EXTENSIONS}"
        for ext in "${EXTENSIONS[@]}"; do
            echo "Installing ${ext}..."
            code-server --install-extension "${ext}" --force 2>&1 | grep -v "EISDIR" || true
        done

        echo "Extension installation complete"
    fi
}

# Function to setup SSH keys if provided
setup_ssh() {
    if [ -n "${SSH_PRIVATE_KEY}" ]; then
        echo "Setting up SSH keys..."
        echo "${SSH_PRIVATE_KEY}" > /home/student/.ssh/id_rsa
        chmod 600 /home/student/.ssh/id_rsa
        ssh-keyscan github.com >> /home/student/.ssh/known_hosts 2>/dev/null
    fi
}

# Main execution
echo "Starting VS Code Server container..."
echo "Student ID: ${STUDENT_ID:-not-set}"
echo "Assignment ID: ${ASSIGNMENT_ID:-not-set}"
echo "Course ID: ${COURSE_ID:-not-set}"

# Setup SSH if needed
setup_ssh

# Clone repository if specified
clone_repository

# Install extensions
install_extensions

# Set password from environment or use default
if [ -n "${VSCODE_PASSWORD}" ]; then
    export PASSWORD="${VSCODE_PASSWORD}"
fi

# Create code-server config
mkdir -p ${CODE_SERVER_CONFIG}
cat > ${CODE_SERVER_CONFIG}/config.yaml <<EOF
bind-addr: 0.0.0.0:${PORT}
auth: password
password: ${PASSWORD}
cert: false
EOF

echo "Starting code-server..."
echo "Configuration:"
echo "  - Bind address: 0.0.0.0:${PORT}"
echo "  - Workspace: /workspace"
echo "  - Password: ${PASSWORD}"
echo ""

# Start code-server
exec "$@"