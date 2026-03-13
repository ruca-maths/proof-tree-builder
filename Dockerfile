# --- Build Stage: Frontend ---
FROM node:20 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# --- Build Stage: Backend ---
FROM node:20 AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
RUN npm run build

# --- Final Stage ---
FROM node:20

# Install dependencies for elan/lean
RUN apt-get update && apt-get install -y \
    curl \
    git \
    libgmp-dev \
    && rm -rf /var/lib/apt/lists/*

# Install elan and Lean 4 stable
RUN curl https://raw.githubusercontent.com/leanprover/elan/master/elan-init.sh -sSf | sh -s -- -y --default-toolchain leanprover/lean4:stable
ENV PATH="/root/.elan/bin:${PATH}"

WORKDIR /app

# Copy backend build
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/package.json ./backend/package.json
COPY --from=backend-builder /app/backend/theories ./backend/theories

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Environment variables
ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

WORKDIR /app/backend
CMD ["node", "dist/index.js"]
