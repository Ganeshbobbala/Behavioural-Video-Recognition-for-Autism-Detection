const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { analyzeVideo } = require('./routes/analysis');

const app = express();
const PORT = 3001;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/autismdb')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Analysis Schema
const analysisSchema = new mongoose.Schema({
  filename: String,
  results: Object,
  timestamp: { type: Date, default: Date.now }
});
const Analysis = mongoose.model('Analysis', analysisSchema);

// Ensure uploads dir
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.use('/models', express.static('../models'));

// Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.post('/analyze', upload.single('video'), async (req, res) => {
  try {
    const results = await analyzeVideo(req.file.path);
    const analysis = new Analysis({
      filename: req.file.originalname,
      results
    });
    const saved = await analysis.save();
    res.json({ ...results, _id: saved._id });
  } catch (error) {
    console.error('Analysis error:', error);
    fs.appendFileSync('error.log', `${new Date().toISOString()} - ${error.stack}\n`);
    res.status(500).json({ error: error.message });
  }
});

app.get('/history', async (req, res) => {
  try {
    const analyses = await Analysis.find().sort({ timestamp: -1 }).limit(10);
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/report/:id', async (req, res) => {
    try {
        const analysis = await Analysis.findById(req.params.id);
        if (!analysis) return res.status(404).send('Not found');

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Analysis_Report_${req.params.id}.pdf`);
        doc.pipe(res);

        // PDF Content
        doc.fontSize(25).text('Autism Behavior Analysis Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`File Name: ${analysis.filename}`);
        doc.text(`Date: ${new Date(analysis.timestamp).toLocaleString()}`);
        doc.moveDown();
        
        doc.fontSize(18).text('Analysis Results:', { underline: true });
        doc.fontSize(12).moveDown(0.5);
        doc.text(`Hand Flapping Confidence: ${analysis.results.handFlapping}%`);
        doc.text(`Repetitive Movement: ${analysis.results.repetitive}%`);
        doc.text(`Eye Contact Avoidance: ${analysis.results.eyeContact}%`);
        doc.text(`Verbal/Vocal Cues: ${analysis.results.verbal}%`);
        
        doc.moveDown();
        doc.fontSize(16).text('Audio Insights:');
        doc.fontSize(12).moveDown(0.5);
        doc.text(`Speech Delay Score: ${analysis.results.audioAnalysis.speechDelayScore}%`);
        doc.text(`Atypical Vocalizations: ${analysis.results.audioAnalysis.atypicalVocalizations}`);

        doc.moveDown(2);
        doc.fontSize(10).text('Disclaimer: This is an AI-generated report intended for screening assistance and should not be used as a definitive medical diagnosis. Please consult a professional clinician.', { color: 'grey' });

        doc.end();
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('MongoDB Autism Detection app ready!');
});

