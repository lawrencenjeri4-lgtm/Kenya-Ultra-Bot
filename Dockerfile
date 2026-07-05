FROM node:20-slim

# sharp needs these for sticker/image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Session/database data should be mounted as a volume in production
VOLUME ["/app/session", "/app/database"]

CMD ["node", "index.js"]
