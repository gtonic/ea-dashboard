FROM nginx:1.27-alpine

# Nginx-Konfiguration mit Reverse-Proxy
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Frontend-Dateien
COPY app/ /usr/share/nginx/html/

EXPOSE 80
