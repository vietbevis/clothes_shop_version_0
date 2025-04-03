FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# RUN npm install --platform=linuxmusl --arch=x64 sharp
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/private_key.pem ./private_key.pem
COPY --from=builder /app/public_key.pem ./public_key.pem

ENV NODE_ENV=production
RUN npm prune --production

EXPOSE 4446

# Command to run the app
CMD ["node", "dist/server.js"]