# Stage 1: Build
FROM node:18-slim AS builder

WORKDIR /app

# Install required build dependencies
RUN apt-get update && apt-get install -y python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the source code and build
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-slim

WORKDIR /app

# Copy package.json and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port 8080 (required by Cloud Run)
EXPOSE 8080

# Start the app directly
CMD ["node", "dist/app.js"]
