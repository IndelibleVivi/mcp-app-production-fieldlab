FROM node:22.23.1-bookworm-slim

ENV NODE_ENV=production \
    __PORT=8787

WORKDIR /app

COPY package.json package-lock.json ./
COPY LICENSE LICENSE-DOCUMENTATION.md LICENSING.md ./
RUN npm ci --omit=dev && npm cache clean --force

COPY dist ./dist
COPY scenarios ./scenarios
COPY release.json ./release.json

USER node
EXPOSE 8787

CMD ["node", "dist/__entry.js"]
