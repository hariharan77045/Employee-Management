# syntax=docker/dockerfile:1

# ---- Build stage: production Angular build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx ng build --configuration production

# ---- Runtime stage: nginx serves the app and forwards /api to the backend ----
FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/employee-management/browser /usr/share/nginx/html

# Where nginx forwards /api requests. "backend" is the service name in
# docker-compose and Kubernetes; override it for other setups.
ENV BACKEND_URL=http://backend:8080
EXPOSE 80
