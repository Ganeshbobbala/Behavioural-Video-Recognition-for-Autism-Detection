# Behavioral Video Recognition for Autism Detection

## Overview
This system is a deep learning-based screening tool designed to detect autism-related behaviors in children through video analysis. It leverages a modern tech stack consisting of Python (TensorFlow/Keras, MediaPipe, OpenCV) for AI processing and Node.js/MongoDB for the application layer.

## Key Features
- **Video Behavioral Analysis**: Detects patterns such as hand flapping, repetitive movements, and eye contact avoidance.
- **CNN + LSTM Architecture**: Uses a hybrid Convolutional and Long Short-Term Memory neural network to analyze spatial features and temporal sequences of body landmarks.
- **Pose Estimation**: Utilizes MediaPipe for high-precision real-time tracking of body, hand, and facial landmarks.
- **Interactive Dashboard**: Premium UI built with vanilla HTML/CSS/JS, featuring dynamic charts (Chart.js) and a behavioral timeline.
- **Specialist Locator**: Integrated map (Leaflet + Overpass API) to find nearby specialists based on user location.
- **PDF Reports**: Generates detailed analysis reports for caregivers and clinicians using `pdfkit`.
- **History Tracking**: Securely stores and retrieves past analysis results using MongoDB.

## Tech Stack
- **Frontend**: HTML5, CSS3 (Glassmorphism), JavaScript (ES6+), Chart.js, Leaflet
- **Backend**: Node.js/Express
- **AI/ML**: Python, TensorFlow/Keras, MediaPipe, OpenCV, NumPy
- **Database**: MongoDB (Mongoose)

## Project Structure
```text
autism-detection/
├── frontend/             # Premium Interactive Dashboard
│   ├── index.html
│   ├── style.css
│   └── script.js
├── backend/              # Node.js Express Server
│   ├── server.js         # Main API & MongoDB Integration
│   ├── routes/
│   │   └── analysis.js   # Python Bridge
│   ├── analysis.py       # CNN+LSTM & MediaPipe Logic
│   └── requirements.txt  # Python Dependencies
├── models/               # Model definitions and weights
└── uploads/              # Temporary storage for analysis
```

## Setup Instructions

### Pre-requisites
- Node.js & npm
- Python 3.8+
- MongoDB (Running locally)

### Backend Setup
1. `cd autism-detection/backend`
2. `npm install`
3. Create a virtual environment: `python -m venv .venv`
4. Activate venv and install: `pip install -r requirements.txt`
5. Start server: `npm start`

### Frontend Setup
1. The frontend is served by the backend at `http://localhost:3001` or can be opened directly.

## Methodology
The system extracts frames from uploaded videos and processes them through **MediaPipe** to obtain coordinate landmarks. These landmarks are grouped into temporal sequences and passed through a **CNN+LSTM** model. The CNN extract spatial features from landmark clusters, while the LSTM identifies movement patterns over time, providing a probability score for specific behaviors.
