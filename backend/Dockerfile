# Step 1: Use an official lightweight Node.js runtime as the base image
FROM node:20-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package configuration files to install dependencies first
COPY package*.json ./

# Step 4: Install the node modules required for the app
RUN npm install

# Step 5: Copy the rest of your application code into the container
COPY . .

# Step 6: Inform Docker that the container listens on port 5000 at runtime
EXPOSE 5000

# Step 7: Define the command to execute your app when the container boots
CMD ["npm", "start"]
