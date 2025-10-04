# Java development environment
ARG BASE_IMAGE=dockeride/base:latest
FROM ${BASE_IMAGE}

USER root

# Install Java (OpenJDK 17) and build tools
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    openjdk-17-source \
    maven \
    gradle \
    ant \
    && rm -rf /var/lib/apt/lists/*

# Set JAVA_HOME
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 \
    PATH="${JAVA_HOME}/bin:${PATH}"

# Install VS Code Java extensions
ENV VSCODE_EXTENSIONS="redhat.java,vscjava.vscode-java-debug,vscjava.vscode-java-test,vscjava.vscode-maven,vscjava.vscode-java-dependency,vscjava.vscode-java-pack"

# Install Spring Boot CLI
RUN curl -L https://github.com/spring-projects/spring-boot/releases/download/v3.2.0/spring-boot-cli-3.2.0-bin.tar.gz | tar xz -C /opt && \
    ln -s /opt/spring-3.2.0/bin/spring /usr/local/bin/spring

# Create directories for Maven and Gradle
RUN mkdir -p /home/student/.m2 /home/student/.gradle && \
    chown -R student:student /home/student/.m2 /home/student/.gradle

# Switch back to student user
USER student

# Configure Maven settings
RUN mkdir -p /home/student/.m2 && \
    echo '<?xml version="1.0" encoding="UTF-8"?>\n\
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"\n\
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n\
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0\n\
                              http://maven.apache.org/xsd/settings-1.0.0.xsd">\n\
    <localRepository>/home/student/.m2/repository</localRepository>\n\
</settings>' > /home/student/.m2/settings.xml

WORKDIR /workspace

# Inherit entrypoint from base image
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "password", "/workspace"]