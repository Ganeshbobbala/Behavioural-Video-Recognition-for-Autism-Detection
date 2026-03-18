const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const venvPath = path.join(__dirname, '..', '..', '..', '.venv_autism', 'Scripts', 'python.exe');
const pythonExec = fs.existsSync(venvPath) ? venvPath : 'python';

async function analyzeVideo(videoPath) {
    console.log(`Using Python: ${pythonExec}`);
    console.log(`Analyzing Video: ${videoPath}`);
    
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn(pythonExec, [
            path.join(__dirname, '..', 'analysis.py'),
            videoPath
        ]);

        let resultData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                const errorMsg = `Python script failed with code ${code}. Error: ${errorData}`;
                console.error(errorMsg);
                return reject(new Error(errorMsg));
            }
            try {
                const results = JSON.parse(resultData);
                resolve(results);
            } catch (e) {
                console.error(`Failed to parse Python output: ${resultData}. Error: ${e.message}`);
                reject(new Error('Failed to parse analysis results. Ensure the video format is supported and not corrupted.'));
            }
        });
    });
}

module.exports = { analyzeVideo };
