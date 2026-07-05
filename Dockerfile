FROM node:20-slim

# Install system packages required by sharp and npm git dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    libvips-dev \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

VOLUME ["/app/session", "/app/database"]

CMD ["node", "index.js"]
