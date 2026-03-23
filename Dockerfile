# Use an official Python runtime with Node.js installed
FROM python:3.10-slim

# Install system dependencies including Node.js (Upgraded to v20 for stability)
RUN apt-get update && apt-get install -y \
    curl \
    ffmpeg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy the entire project codebase
COPY . /app

# Install Python dependencies for the ML scripts
RUN pip install --no-cache-dir -r autism-detection/backend/requirements.txt

# Install Node dependencies
RUN npm run install-all || (cd autism-detection/backend && npm install)

# Set the port that the app runs on
ENV PORT=3001
EXPOSE 3001

# Start the Node.js server
CMD ["npm", "start"]
