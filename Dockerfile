# Use node 16 LTS version as base image
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy all source code to the working directory
COPY . .

# Copy the certificate file to the appropriate directory

# Build the project (frontend and backend)
RUN npm run build

# Expose the port your app runs on
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
