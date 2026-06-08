# Step 1: Use the official lightweight Nginx image from Docker Hub
FROM nginx:alpine

# Step 2: Copy our custom HTML and JS files into Nginx's default public folder
COPY index.html /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/

# Step 3: Nginx automatically serves on port 80 by default
EXPOSE 80
