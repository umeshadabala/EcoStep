# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the source files
COPY . .

# Build the React application
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Copy the custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build files from the build stage to nginx serving directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 8080 (default Cloud Run port)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
