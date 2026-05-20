FROM nginx:alpine

# Copy static site
COPY . /usr/share/nginx/html

# Custom nginx config for SPA + security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
