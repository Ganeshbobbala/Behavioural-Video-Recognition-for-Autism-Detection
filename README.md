# 🧠 AutismScan AI: Behavioural Video Recognition System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18.x-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-FFEFD5.svg)](https://supabase.com/)

An advanced, AI-powered behavioral analysis platform designed for early autism screening. By leveraging state-of-the-art Computer Vision (MediaPipe) and Deep Learning, this system identifies key behavioral patterns in children to assist clinicians and parents in early detection and intervention planning.

---

## ✨ Key Features

### 🔍 Dual Analysis Modes
- **Video Upload**: Batch process recorded videos for in-depth behavioral mapping.
- **Live Webcam Analysis**: Real-time screening using MediaPipe Pose and FaceMesh for immediate feedback on hand-flapping, eye avoidance, and repetitive movements.

### 📄 Clinical Reporting
- **PDF Report Generation**: Automatically generate comprehensive analysis reports containing severity scores and timeline-based insights.
- **Expert Recommendations**: Every report includes personalized health guidance, dietary suggestions (Gastro-friendly, Neuro-nutrient focused), and lifestyle adjustments.

### 🍱 Personalized Diet Planner
- **Neuro-Nutrient Logic**: A dedicated system to generate diet plans based on age and dietary preferences (Veg, Vegan, Non-Veg).
- **Targeted Restrictions**: Filter foods based on gluten, casein, or additive sensitivities commonly associated with ASD.

### 📍 Care Locator
- **Geo-Mapping**: Integrated Leaflet.js map to detect your location and find nearby autism specialists, hospitals, and therapy centers.

### 🗄️ Secure Data Persistence
- Built with **Supabase**, ensuring all analysis history is stored securely and is easily accessible for tracking progress over time.

---

## 🛠️ Tech Stack

### Frontend
- **Vanilla JS & HTML5**: High-performance, low-latency UI.
- **Modern CSS**: Premium glassmorphism aesthetic with responsive layouts.
- **MediaPipe**: Client-side ML for real-time body tracking.
- **Leaflet.js**: Dynamic mapping for the Care Locator.

### Backend
- **Node.js & Express**: Scalable API handling file uploads and report generation.
- **Python (AI Engine)**: TensorFlow-based analysis for behavioral recognition.
- **PDFKit**: Server-side engine for high-quality clinical report generation.
- **Supabase**: PostgreSQL database with real-time capabilities.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- Supabase Account (for database features)

### Installation

1. **Clone the Repo**
   ```bash
   git clone https://github.com/Ganeshbobbala/Behavioural-Video-Recognition-for-Autism-Detection.git
   cd Behavioural-Video-Recognition-for-Autism-Detection
   ```

2. **Environment Setup**
   Create a `.env` file in `autism-detection/backend/`:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=3001
   ```

3. **Install Dependencies**
   ```bash
   # Backend
   cd autism-detection/backend
   npm install

   # Python Engine
   pip install -r requirements.txt
   ```

### Running Locally
Use the integrated startup script:
```powershell
./run_project.bat
```
The app will be live at `http://localhost:3001`.

---

## 📁 Project Structure
```text
├── autism-detection
│   ├── backend          # Express API, Supabase logic, PDF generation
│   ├── frontend         # HTML/CSS/JS (Diet Planner, Care Locator)
│   ├── models           # AI Model weights and configurations
│   └── uploads          # Temporary video storage
├── Dockerfile           # Backend containerization
├── netlify.toml         # Frontend deployment config
└── render.yaml          # Backend deployment (Render.com)
```

---

## 📝 License
Distributed under the MIT License. See `LICENSE` for more information.

---
*Disclaimer: This tool is intended for screening assistance and educational purposes. It does not provide a definitive medical diagnosis. Always consult a professional clinician.*
