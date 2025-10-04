# Python development environment
ARG BASE_IMAGE=dockeride/base:latest
FROM ${BASE_IMAGE}

USER root

# Install Python and common packages
RUN \
  echo "**** install Python ****" && \
  apt-get update && \
  apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    build-essential \
    libssl-dev \
    libffi-dev \
    python3-setuptools && \
  echo "**** create python symlinks ****" && \
  ln -sf /usr/bin/python3 /usr/bin/python && \
  ln -sf /usr/bin/pip3 /usr/bin/pip && \
  echo "**** install common Python packages ****" && \
  pip install --no-cache-dir \
    numpy \
    pandas \
    matplotlib \
    scipy \
    scikit-learn \
    jupyter \
    notebook \
    ipython \
    requests \
    flask \
    django \
    pytest \
    black \
    flake8 \
    pylint \
    autopep8 \
    virtualenv && \
  echo "**** clean up ****" && \
  apt-get clean && \
  rm -rf \
    /tmp/* \
    /var/lib/apt/lists/* \
    /var/tmp/*

# Set Python environment variables
ENV PYTHONIOENCODING=utf-8 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Set VS Code Python extensions
ENV VSCODE_EXTENSIONS="ms-python.python,ms-python.vscode-pylance,ms-python.debugpy,ms-toolsai.jupyter,ms-toolsai.jupyter-keymap,ms-toolsai.jupyter-renderers"

# Add Python-specific s6 overlay configuration
COPY /root /
