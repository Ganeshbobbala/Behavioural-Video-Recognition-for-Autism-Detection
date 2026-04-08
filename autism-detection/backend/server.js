require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { analyzeVideo } = require('./routes/analysis');

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase connection
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
    const { data: saved, error: dbError } = await supabase
      .from('analyses')
      .insert([
        { filename: req.file.originalname, results: results }
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    res.json({ ...results, _id: saved.id });
  } catch (error) {
    console.error('Analysis error:', error);
    const errLog = error.stack || JSON.stringify(error);
    fs.appendFileSync('error.log', `${new Date().toISOString()} - ${errLog}\n`);
    res.status(500).json({ error: error.message || error });
  }
});

app.get('/history', async (req, res) => {
  try {
    const { data: analyses, error: dbError } = await supabase
      .from('analyses')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);

    if (dbError) throw dbError;
    
    // Map _id property to maintain frontend compatibility
    const mappedAnalyses = analyses.map(a => ({ ...a, _id: a.id }));
    res.json(mappedAnalyses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/report/:id', async (req, res) => {
    try {
        const { data: analysis, error: dbError } = await supabase
          .from('analyses')
          .select('*')
          .eq('id', req.params.id)
          .single();

        if (dbError || !analysis) return res.status(404).send('Not found');

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
        if (analysis.results.audioAnalysis) {
            doc.text(`Speech Delay Score: ${analysis.results.audioAnalysis.speechDelayScore}%`);
            doc.text(`Atypical Vocalizations (Count): ${analysis.results.audioAnalysis.atypicalVocalizations}`);
        } else {
            doc.text(`No audio insights computed.`);
        }

        // Post-Analysis Health & Diet Recommendation
        doc.addPage();
        doc.fontSize(18).text('Health & Diet Recommendations', { underline: true, align: 'center' });
        doc.moveDown(1.5);
        
        doc.fontSize(14).text('1. Health Guidance', { underline: true });
        doc.fontSize(10).moveDown(0.5);
        doc.text('Important Clinical Context: Autism Spectrum Disorder is a neurodevelopmental condition, not a curable disease. The goal of this guidance is to support brain health, regulate behavior, and improve daily functioning.');
        doc.moveDown();
        doc.text('Recommended Therapies:', { underline: true });
        doc.list([
            'Speech & Language Therapy (if vocal delays detected)',
            'Occupational Therapy (managing sensory inputs & fine motor skills)',
            'Behavioral Therapy (e.g., ABA / CBT to assist daily functioning)'
        ]);
        
        doc.moveDown(1.5);
        doc.fontSize(14).text('2. Recommended Foods (Brain & Gut Health)', { underline: true });
        doc.fontSize(10).moveDown(0.5);
        doc.list([
            'Brain-Support (Omega-3): Fish, walnuts, flax seeds',
            'Fruits: Banana, apple, blueberries, orange, papaya, avocado',
            'Vegetables: Spinach, broccoli, carrot',
            'Protein: Eggs, lentils, chicken',
            'Gut Health: Yogurt, fermented foods (idli, dosa)'
        ]);
        
        doc.moveDown(1.5);
        doc.fontSize(14).text('3. Foods to Limit', { underline: true });
        doc.fontSize(10).moveDown(0.5);
        doc.list([
            'Processed Foods & Preservatives',
            'Sugary Snacks & Refined Carbs',
            'Artificial Colors and Additives',
            'Gluten or Dairy (restrict only if individual sensitivity/allergies are clearly detected)'
        ]);
        
        doc.moveDown(1.5);
        doc.fontSize(14).text('4. Sample Daily Meal Plan', { underline: true });
        doc.fontSize(10).moveDown(0.5);
        doc.text('Breakfast: Healthy + easily digestible (e.g., idli, fresh fruit, or yogurt)');
        doc.text('Lunch: Balanced meal covering core macros (rice/quinoa + steamed vegetables + protein source)');
        doc.text('Snacks: Whole fruits, mixed nuts (if no allergy), or seeds');
        doc.text('Dinner: Light, nutritious, and warming (e.g., vegetable soup or lean protein with greens)');
        
        doc.moveDown(1.5);
        doc.fontSize(14).text('5. Lifestyle Recommendations', { underline: true });
        doc.fontSize(10).moveDown(0.5);
        doc.list([
            'Maintain a structured daily routine to provide security and predictability.',
            'Reduce sensory overload (avoid extreme noise, chaotic environments, or harsh lights).',
            'Encourage social interaction gradually, avoiding forced prolonged exposure.',
            'Monitor progress regularly and adjust approach based on the individual\'s comfort.'
        ]);

        doc.moveDown(3);
        doc.fontSize(9).text('Disclaimer: This is an AI-generated report intended for screening assistance and should not be used as a definitive medical diagnosis. Please consult a professional clinician.', { color: 'grey', align: 'center' });

        doc.end();
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Supabase Autism Detection app ready!');
});

