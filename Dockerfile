# ---- BengkelKu CMS (Nuxt 4) — image untuk Koyeb ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8000
COPY --from=build /app/.output ./.output
EXPOSE 8000
CMD ["node", ".output/server/index.mjs"]
