# Stage 1: Build the React application
FROM node:18-alpine AS builder

ARG REACT_APP_API_AUTH_URL
ARG REACT_APP_API_PRODUCTS_URL
ENV REACT_APP_API_AUTH_URL=$REACT_APP_API_AUTH_URL
ENV REACT_APP_API_PRODUCTS_URL=$REACT_APP_API_PRODUCTS_URL

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]