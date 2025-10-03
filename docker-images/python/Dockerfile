# Python development environment
FROM dockeride/base:latest

USER root

# Install Python and common packages
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    build-essential \
    libssl-dev \
    libffi-dev \
    python3-setuptools \
    && rm -rf /var/lib/apt/lists/*

# Create symlinks for python commands (force overwrite if exists)
RUN ln -sf /usr/bin/python3 /usr/bin/python && \
    ln -sf /usr/bin/pip3 /usr/bin/pip

# Install common Python packages
RUN pip install --no-cache-dir \
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
    virtualenv

# Install VS Code Python extensions
ENV VSCODE_EXTENSIONS="ms-python.python,ms-python.vscode-pylance,ms-python.debugpy,ms-toolsai.jupyter,ms-toolsai.jupyter-keymap,ms-toolsai.jupyter-renderers"

# Switch back to student user
USER student

# Set Python environment variables
ENV PYTHONIOENCODING=utf-8 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Create virtual environment directory
RUN python -m venv /home/student/venv
ENV PATH="/home/student/venv/bin:$PATH"

WORKDIR /workspace