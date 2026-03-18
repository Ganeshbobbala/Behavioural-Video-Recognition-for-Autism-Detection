document.addEventListener('DOMContentLoaded', () => {
    const videoInput = document.getElementById('videoInput');
    const browseBtn = document.getElementById('browseBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const uploadArea = document.getElementById('uploadArea');
    const videoSection = document.getElementById('videoSection');
    const video = document.getElementById('video');
    const status = document.getElementById('status');
    const resultsDashboard = document.getElementById('resultsDashboard');
    const historyList = document.getElementById('historyList');
    const exportBtn = document.getElementById('exportBtn');

    let currentFile = null;
    let currentAnalysisId = null;
    let behaviorChart = null;
    const BACKEND_URL = 'http://localhost:3001';

    // Handle Browse Button
    browseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        videoInput.click();
    });

    // Handle Upload Area Click
    uploadArea.addEventListener('click', () => {
        videoInput.click();
    });

    // Handle File Selection
    videoInput.addEventListener('change', (e) => {
        handleFile(e.target.files[0]);
    });

    // Drag and Drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFile(e.dataTransfer.files[0]);
    });

    function handleFile(file) {
        if (file && file.type.startsWith('video/')) {
            // Client-side Verification
            if (file.size > 50 * 1024 * 1024) { // 50MB limit
                status.innerHTML = '<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i> File too large. Please use a video under 50MB.';
                return;
            }

            currentFile = file;
            video.src = URL.createObjectURL(file);
            videoSection.style.display = 'block';
            analyzeBtn.disabled = false;
            status.innerHTML = `<i class="fas fa-check-circle" style="color: #10b981;"></i> Video ready: ${file.name}`;
            resultsDashboard.style.display = 'none'; 
            
            videoSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Run Analysis
    analyzeBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!currentFile) return;

        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        status.innerHTML = '<i class="fas fa-brain fa-pulse"></i> Processing video frames & audio signals...';

        const formData = new FormData();
        formData.append('video', currentFile);

        try {
            const response = await fetch(`${BACKEND_URL}/analyze`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Server error');

            const results = await response.json();
            currentAnalysisId = results._id;
            displayResults(results);
            loadHistory();
        } catch (error) {
            console.error('Analysis failed:', error);
            status.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i> Analysis failed. Please ensure the backend is running.';
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = 'Run AI Analysis';
        }
    });

    function displayResults(results) {
        resultsDashboard.style.display = 'block';
        status.innerHTML = '<i class="fas fa-check-double" style="color: #10b981;"></i> Analysis Complete';

        // Update Progress Bars
        const metrics = ['handFlapping', 'repetitive', 'eyeContact', 'verbal'];
        metrics.forEach(id => {
            const val = results[id] || 0;
            const pctEl = document.getElementById(id + 'Pct');
            const barEl = document.getElementById(id + 'Bar');
            if (pctEl) pctEl.innerText = val + '%';
            if (barEl) barEl.style.width = val + '%';
        });

        // Update Audio Data
        if (results.audioAnalysis) {
            document.getElementById('speechDelayVal').innerText = results.audioAnalysis.speechDelayScore > 30 ? 'Moderate' : 'Low Risk';
            document.getElementById('vocalCount').innerText = results.audioAnalysis.atypicalVocalizations;
        }

        // Render Chart
        renderTimelineChart(results.timeline || []);

        resultsDashboard.scrollIntoView({ behavior: 'smooth' });
    }

    function renderTimelineChart(timeline) {
        const ctx = document.getElementById('behaviorChart').getContext('2d');
        
        if (behaviorChart) {
            behaviorChart.destroy();
        }

        const labels = timeline.map(t => `${t.second}s`);
        const handData = timeline.map(t => t.handFlapping);
        const repData = timeline.map(t => t.repetitive);
        const eyeData = timeline.map(t => t.eyeAvoidance || 0);

        behaviorChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Hand Flapping',
                    data: handData,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    fill: true,
                    stepped: true
                }, {
                    label: 'Repetitive Movement',
                    data: repData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    stepped: true
                }, {
                    label: 'Eye Avoidance',
                    data: eyeData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    stepped: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, max: 1.2, display: false }
                },
                plugins: {
                    legend: { labels: { color: '#94a3b8' } }
                }
            }
        });
    }

    // --- Care Locator Logic ---
    let map = null;
    let markers = [];
    const detectLocBtn = document.getElementById('detectLocBtn');
    const locationStatus = document.getElementById('location-status');
    const doctorList = document.getElementById('doctorList');

    function initMap(lat = 20.5937, lon = 78.9629) { // Defaults to India center
        if (map) return;
        map = L.map('map').setView([lat, lon], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
    }

    detectLocBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        detectLocBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating...';
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            locationStatus.innerHTML = `<i class="fas fa-check-circle"></i> Location detected: ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
            initMap(latitude, longitude);
            map.setView([latitude, longitude], 12);

            // Add user marker
            L.circleMarker([latitude, longitude], { color: '#f97316', radius: 10 }).addTo(map)
                .bindPopup('You are here')
                .openPopup();

            await findSpecialists(latitude, longitude);
            detectLocBtn.innerHTML = 'Update Location';
        }, (error) => {
            locationStatus.innerHTML = '<i class="fas fa-times-circle"></i> Access denied. Please enable location.';
            detectLocBtn.innerHTML = 'Detect My Location';
        });
    });

    async function findSpecialists(lat, lon) {
        doctorList.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fas fa-spinner fa-spin"></i> Searching OSM database...</div>';
        
        // Overpass API Query: Finds hospitals, clinics, or doctors with "autism" or "child" in name within 20km
        const query = `
            [out:json];
            (
              node["amenity"~"hospital|clinic|doctors"](around:20000, ${lat}, ${lon});
              way["amenity"~"hospital|clinic|doctors"](around:20000, ${lat}, ${lon});
            );
            out center;
        `;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            const elements = data.elements || [];

            // Filter for autism/paediatrics keywords or just show nearest hospitals
            const results = elements.slice(0, 10).map(el => ({
                name: el.tags.name || 'Specialist Center',
                address: el.tags['addr:street'] || 'Nearby Location',
                lat: el.lat || el.center.lat,
                lon: el.lon || el.center.lon,
                type: el.tags.amenity
            }));

            if (results.length === 0) {
                doctorList.innerHTML = '<div class="empty-list" style="padding:20px;text-align:center;">No specialized clinics found nearby. Try searching for hospitals.</div>';
                return;
            }

            doctorList.innerHTML = '';
            // Clear old markers
            markers.forEach(m => map.removeLayer(m));
            markers = [];

            results.forEach(res => {
                // Add Marker
                const marker = L.marker([res.lat, res.lon]).addTo(map)
                    .bindPopup(`<b>${res.name}</b><br>${res.type}`);
                markers.push(marker);

                // Add Card
                const card = document.createElement('div');
                card.className = 'doctor-card';
                card.innerHTML = `
                    <h4>${res.name}</h4>
                    <p><i class="fas fa-map-marker-alt"></i> ${res.type.charAt(0).toUpperCase() + res.type.slice(1)} • Approximately ${(L.latLng(lat, lon).distanceTo(L.latLng(res.lat, res.lon)) / 1000).toFixed(1)} km away</p>
                    <div style="display:flex; gap:10px;">
                        <a href="https://www.google.com/maps/dir/?api=1&destination=${res.lat},${res.lon}" target="_blank" class="btn-sm">
                            <i class="fas fa-directions"></i> Directions
                        </a>
                        <button class="btn-sm" style="background:transparent; border:1px solid var(--primary); color:var(--primary);" onclick="window.map.setView([${res.lat}, ${res.lon}], 15)">
                            <i class="fas fa-eye"></i> View on Map
                        </button>
                    </div>
                `;
                doctorList.appendChild(card);
            });

            window.map = map; // Global access for inline onclick
        } catch (error) {
            doctorList.innerHTML = '<div class="empty-list" style="padding:20px;text-align:center;">Search failed. Please try again.</div>';
        }
    }

    // --- End Care Locator Logic ---

    async function loadHistory() {
        try {
            const response = await fetch(`${BACKEND_URL}/history`);
            const history = await response.json();
            
            if (history.length === 0) {
                historyList.innerHTML = '<li class="history-item">No records found.</li>';
                return;
            }

            historyList.innerHTML = history.slice(0, 5).map(item => `
                <li class="history-item" onclick="window.location.href='${BACKEND_URL}/report/${item._id}'">
                    <div>
                        <strong>${item.filename}</strong><br>
                        <small style="color: #94a3b8;">${new Date(item.timestamp).toLocaleString()}</small>
                    </div>
                    <div style="text-align: right;">
                        <span style="color: #f59e0b;">🥁 ${item.results.handFlapping}%</span>
                        <span style="margin-left: 10px; color: #ef4444;">🔄 ${item.results.repetitive}%</span>
                    </div>
                </li>
            `).join('');
        } catch (error) {
            historyList.innerHTML = '<li class="history-item" style="color: #94a3b8;">History module offline.</li>';
        }
    }

    exportBtn.addEventListener('click', () => {
        if (!currentAnalysisId) {
            alert('Please run analysis first.');
            return;
        }
        window.location.href = `${BACKEND_URL}/report/${currentAnalysisId}`;
    });

    // Initial History Load
    loadHistory();

    // Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('animate');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section').forEach(section => observer.observe(section));
});
