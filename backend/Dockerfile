FROM node:18-alpine

WORKDIR /app

# Install dependencies first for caching
COPY package*.json ./
RUN npm ci --production

# Copy the rest of the backend source code
COPY . .

EXPOSE 5000
CMD ["node", "server.js"] 