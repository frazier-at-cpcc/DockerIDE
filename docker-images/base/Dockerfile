# syntax=docker/dockerfile:1
# Base VS Code Server image for educational platform
FROM ghcr.io/linuxserver/baseimage-ubuntu:noble

# Build arguments
ARG BUILD_DATE
ARG VERSION
ARG CODE_RELEASE
ARG DEBIAN_FRONTEND="noninteractive"

# set version label
LABEL build_version="DockerIDE version:- ${VERSION} Build-date:- ${BUILD_DATE}"
LABEL maintainer="DockerIDE"

# Environment variables for student user
ENV HOME="/config" \
    PASSWORD="changeme" \
    DEFAULT_WORKSPACE="/config/workspace"

# Install runtime dependencies and code-server
RUN \
  echo "**** install runtime dependencies ****" && \
  apt-get update && \
  apt-get install -y \
    git \
    libatomic1 \
    nano \
    vim \
    net-tools \
    sudo \
    curl \
    wget \
    ca-certificates \
    openssh-client \
    tzdata \
    jq \
    unzip \
    locales && \
  echo "**** set locale ****" && \
  locale-gen en_US.UTF-8 && \
  echo "**** install code-server ****" && \
  if [ -z ${CODE_RELEASE+x} ]; then \
    CODE_RELEASE=$(curl -sX GET https://api.github.com/repos/coder/code-server/releases/latest \
      | awk '/tag_name/{print $4;exit}' FS='[""]' | sed 's|^v||'); \
  fi && \
  mkdir -p /app/code-server && \
  curl -o \
    /tmp/code-server.tar.gz -L \
    "https://github.com/coder/code-server/releases/download/v${CODE_RELEASE}/code-server-${CODE_RELEASE}-linux-amd64.tar.gz" && \
  tar xf /tmp/code-server.tar.gz -C \
    /app/code-server --strip-components=1 && \
  printf "DockerIDE version: ${VERSION}\nBuild-date: ${BUILD_DATE}" > /build_version && \
  echo "**** clean up ****" && \
  apt-get clean && \
  rm -rf \
    /config/* \
    /tmp/* \
    /var/lib/apt/lists/* \
    /var/tmp/*

# Set locale environment
ENV LANG=en_US.UTF-8 \
    LANGUAGE=en_US:en \
    LC_ALL=en_US.UTF-8

# Create student user and group
RUN groupadd -g 1000 student && \
    useradd -u 1000 -g 1000 -m -s /bin/bash student && \
    echo "student:changeme" | chpasswd && \
    usermod -aG sudo student

# Add local files (s6-overlay configuration)
COPY /root /

# Ports and volumes
EXPOSE 8443
VOLUME /config
