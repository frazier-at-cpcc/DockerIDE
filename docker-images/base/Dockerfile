# Base VS Code Server image for educational platform
FROM ubuntu:22.04

# Build arguments
ARG CODE_SERVER_VERSION=4.19.1
ARG USER_UID=1000
ARG USER_GID=1000

# Environment variables
ENV DEBIAN_FRONTEND=noninteractive \
    USER=student \
    HOME=/home/student \
    CODE_SERVER_CONFIG=/home/student/.config/code-server \
    PASSWORD=changeme \
    PORT=8080

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    wget \
    sudo \
    locales \
    ca-certificates \
    openssh-client \
    tzdata \
    nano \
    vim \
    jq \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Set locale
RUN locale-gen en_US.UTF-8
ENV LANG=en_US.UTF-8 \
    LANGUAGE=en_US:en \
    LC_ALL=en_US.UTF-8

# Install code-server
RUN curl -fsSL https://code-server.dev/install.sh | sh -s -- --version=${CODE_SERVER_VERSION}

# Create non-root user
RUN groupadd -g ${USER_GID} ${USER} && \
    useradd -m -u ${USER_UID} -g ${USER_GID} -s /bin/bash ${USER} && \
    echo "${USER} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/nopasswd

# Create necessary directories
RUN mkdir -p ${CODE_SERVER_CONFIG} /workspace /home/student/.ssh \
    /home/student/.local/share/code-server/extensions && \
    chown -R ${USER}:${USER} /home/student /workspace

# Switch to non-root user
USER ${USER}
WORKDIR /workspace

# Configure git defaults
RUN git config --global init.defaultBranch main && \
    git config --global user.email "student@dockeride.local" && \
    git config --global user.name "Student"

# Pre-create code-server directories to avoid permission issues
RUN mkdir -p /home/student/.local/share/code-server/User \
    /home/student/.local/share/code-server/logs \
    /home/student/.local/share/code-server/CachedExtensionVSIXs

# Copy entrypoint script
COPY --chown=${USER}:${USER} entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose port
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/healthz || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "password", "/workspace"]