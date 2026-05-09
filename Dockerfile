# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set API URL for Docker environment
ENV VITE_API_URL=http://localhost:5000/api

# Build with Vite
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve package for SPA routing support
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5173/ || exit 1

# Serve the built app with SPA routing
# -s for single page app (rewrites all non-file routes to index.html)
# -l for listen port
# --cors for CORS support
CMD ["serve", "-s", "dist", "-l", "5173", "--cors", "--single"]
