# C++ development environment
ARG BASE_IMAGE=dockeride/base:latest
FROM ${BASE_IMAGE}

USER root

# Install C++ compilers and build tools
RUN apt-get update && apt-get install -y \
    build-essential \
    g++ \
    gcc \
    gdb \
    clang \
    clang-format \
    clang-tidy \
    cmake \
    make \
    ninja-build \
    valgrind \
    cppcheck \
    doxygen \
    libboost-all-dev \
    libgtest-dev \
    libgmock-dev \
    zip \
    unzip \
    tar \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Build and install Google Test and Google Mock
WORKDIR /tmp
RUN cd /usr/src/googletest && \
    cmake . && \
    make && \
    cp -r lib/*.a /usr/lib/ || cp -r */lib*.a /usr/lib/ && \
    cp -r googlemock/lib*.a /usr/lib/ 2>/dev/null || true && \
    cp -r googletest/lib*.a /usr/lib/ 2>/dev/null || true

# Install modern C++ package manager (vcpkg)
RUN git clone https://github.com/Microsoft/vcpkg.git /opt/vcpkg && \
    /opt/vcpkg/bootstrap-vcpkg.sh && \
    ln -s /opt/vcpkg/vcpkg /usr/local/bin/vcpkg

# Install Conan package manager
RUN pip3 install --break-system-packages conan

# Install VS Code C++ extensions
ENV VSCODE_EXTENSIONS="ms-vscode.cpptools,ms-vscode.cpptools-extension-pack,ms-vscode.cmake-tools,twxs.cmake,jeff-hykin.better-cpp-syntax"

# Set C++ compiler environment variables
ENV CC=/usr/bin/gcc \
    CXX=/usr/bin/g++ \
    CMAKE_GENERATOR=Ninja

# Create directories for projects
RUN mkdir -p /home/student/.conan /home/student/.vcpkg && \
    chown -R student:student /home/student/.conan /home/student/.vcpkg

# Switch back to student user
USER student

# Configure Conan
RUN conan profile detect --force

WORKDIR /workspace

# Inherit entrypoint from base image
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "password", "/workspace"]