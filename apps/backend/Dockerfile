FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000
ENV NODE_OPTIONS="--max-http-header-size=65536"
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node --from=builder /app/dist ./dist
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1
CMD ["node", "--max-http-header-size=65536", "dist/server.js"]
