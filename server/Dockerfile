# Stage 1: Build the application
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build && \
    test -f dist/app.js || (echo "Error: dist/app.js not found" && exit 1)

# Stage 2: Development image
FROM node:20 AS development

WORKDIR /app

COPY package*.json ./
RUN npm install  # Include dev dependencies like nodemon
COPY . .
COPY --from=builder /app/dist ./dist
COPY .env ./
EXPOSE 8088
CMD ["npm", "run", "dev"]

# Stage 3: Production image
FROM node:20 AS production

WORKDIR /app

COPY .env ./
COPY package*.json ./
RUN npm install --omit=dev && \
    npm rebuild bcrypt --build-from-source
COPY --from=builder /app/dist ./dist
EXPOSE 8080
CMD ["npm", "run", "start:prod"]