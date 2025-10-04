# Node.js development environment
ARG BASE_IMAGE=dockeride/base:latest
FROM ${BASE_IMAGE}

USER root

# Install Node.js 20.x and development tools
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install global npm packages
RUN npm install -g \
    yarn \
    pnpm \
    typescript \
    ts-node \
    nodemon \
    pm2 \
    express-generator \
    create-react-app \
    @angular/cli \
    @vue/cli \
    vite \
    webpack \
    webpack-cli \
    eslint \
    prettier \
    jest

# Install VS Code JavaScript/TypeScript extensions
ENV VSCODE_EXTENSIONS="dbaeumer.vscode-eslint,esbenp.prettier-vscode,ms-vscode.vscode-typescript-next,christian-kohler.npm-intellisense,eg2.vscode-npm-script,formulahendry.auto-rename-tag,formulahendry.auto-close-tag"

# Create npm directories and configure npm as root
RUN mkdir -p /home/student/.npm /home/student/.yarn /home/student/.pnpm /home/student/.npm-global && \
    chown -R student:student /home/student/.npm /home/student/.yarn /home/student/.pnpm /home/student/.npm-global && \
    npm config set cache /home/student/.npm --global && \
    echo 'export PATH=/home/student/.npm-global/bin:$PATH' >> /home/student/.bashrc

# Switch back to student user
USER student

# Configure npm prefix as student user
RUN npm config set prefix /home/student/.npm-global

# Set Node environment variables
ENV NODE_ENV=development \
    NPM_CONFIG_PREFIX=/home/student/.npm-global \
    PATH="/home/student/.npm-global/bin:${PATH}"

WORKDIR /workspace

# Inherit entrypoint from base image
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "password", "/workspace"]