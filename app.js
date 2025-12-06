class NoiseSensitivityDetector {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.dataArray = null;
        this.bufferLength = null;
        this.isMonitoring = false;
        this.animationId = null;

        // Statistics
        this.noiseHistory = [];
        this.maxHistoryLength = 100;
        this.peakNoise = 0;
        this.startTime = null;
        this.totalSamples = 0;
        this.sumNoise = 0;

        // UI Elements
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.statusText = document.getElementById('statusText');
        this.decibelValue = document.getElementById('decibelValue');
        this.meterBar = document.getElementById('meterBar');
        this.sensitivityLevel = document.getElementById('sensitivityLevel');
        this.avgNoise = document.getElementById('avgNoise');
        this.peakNoiseEl = document.getElementById('peakNoise');
        this.durationEl = document.getElementById('duration');
        this.recommendationText = document.getElementById('recommendationText');
        this.waveformCanvas = document.getElementById('waveformCanvas');
        this.historyCanvas = document.getElementById('historyCanvas');

        this.waveformCtx = this.waveformCanvas.getContext('2d');
        this.historyCtx = this.historyCanvas.getContext('2d');

        // Speech recognition elements
        this.recognition = null;
        this.wordDisplay = document.getElementById('wordDisplay');
        this.backgroundContainer = document.getElementById('backgroundContainer');
        this.wordFrequency = {};
        this.currentDecibels = 0;
        this.isQuiet = true;

        this.initEventListeners();
        this.initSpeechRecognition();
    }

    initEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.stopBtn.addEventListener('click', () => this.stop());
    }

    initSpeechRecognition() {
        // Check if browser supports speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('Speech recognition not supported in this browser');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    // Process final transcript
                    const words = transcript.trim().split(' ');
                    words.forEach(word => {
                        if (word.length > 2) { // Only track words longer than 2 characters
                            this.trackWord(word.toLowerCase());
                        }
                    });
                }
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech') {
                // Restart recognition if no speech detected
                if (this.isMonitoring) {
                    setTimeout(() => {
                        if (this.isMonitoring) {
                            this.recognition.start();
                        }
                    }, 1000);
                }
            }
        };

        this.recognition.onend = () => {
            // Restart recognition if still monitoring
            if (this.isMonitoring) {
                setTimeout(() => {
                    if (this.isMonitoring) {
                        try {
                            this.recognition.start();
                        } catch (e) {
                            console.error('Error restarting recognition:', e);
                        }
                    }
                }, 100);
            }
        };
    }

    trackWord(word) {
        // Track word frequency
        this.wordFrequency[word] = (this.wordFrequency[word] || 0) + 1;

        // Display word with current decibel level as "volume"
        this.displayWord(word, this.currentDecibels);
    }

    displayWord(word, volume) {
        // Calculate size based on volume (decibels)
        const minSize = 40;
        const maxSize = 200;
        const normalizedVolume = Math.min(100, Math.max(30, volume));
        const fontSize = minSize + ((normalizedVolume - 30) / 70) * (maxSize - minSize);

        // Create word element
        const wordEl = document.createElement('div');
        wordEl.className = 'detected-word';
        wordEl.textContent = word;
        wordEl.style.fontSize = `${fontSize}px`;

        // Random position (avoid edges)
        const maxX = window.innerWidth - 300;
        const maxY = window.innerHeight - 150;
        const randomX = Math.random() * maxX + 50;
        const randomY = Math.random() * maxY + 50;

        wordEl.style.left = `${randomX}px`;
        wordEl.style.top = `${randomY}px`;

        // Add to display
        this.wordDisplay.appendChild(wordEl);

        // Trigger fade in animation
        setTimeout(() => {
            wordEl.classList.add('fade-in');
        }, 10);

        // Remove after fade out
        setTimeout(() => {
            wordEl.classList.add('fade-out');
            setTimeout(() => {
                wordEl.remove();
            }, 2000);
        }, 3000);
    }

    updateBackground(decibels) {
        // Update background based on noise level
        // Quiet: < 50 dB, Loud: >= 50 dB
        const shouldBeQuiet = decibels < 50;

        if (shouldBeQuiet !== this.isQuiet) {
            this.isQuiet = shouldBeQuiet;

            if (this.isQuiet) {
                this.backgroundContainer.style.backgroundImage = 'url(Quiet.png)';
            } else {
                this.backgroundContainer.style.backgroundImage = 'url(Loud.png)';
            }
        }
    }

    async start() {
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.microphone = this.audioContext.createMediaStreamSource(stream);

            // Configure analyser
            this.analyser.fftSize = 2048;
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);

            // Connect nodes
            this.microphone.connect(this.analyser);

            // Update UI
            this.isMonitoring = true;
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.statusText.textContent = 'Monitoring active';
            document.getElementById('status').querySelector('.status-icon').textContent = '🎙️';

            // Reset statistics
            this.noiseHistory = [];
            this.peakNoise = 0;
            this.startTime = Date.now();
            this.totalSamples = 0;
            this.sumNoise = 0;

            // Start analysis loop
            this.analyze();

            // Start speech recognition
            if (this.recognition) {
                try {
                    this.recognition.start();
                } catch (e) {
                    console.error('Error starting speech recognition:', e);
                }
            }

        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Unable to access microphone. Please ensure you have granted microphone permissions.');
        }
    }

    stop() {
        this.isMonitoring = false;

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.microphone) {
            this.microphone.disconnect();
        }

        if (this.audioContext) {
            this.audioContext.close();
        }

        // Stop speech recognition
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {
                console.error('Error stopping speech recognition:', e);
            }
        }

        // Clear word display
        this.wordDisplay.innerHTML = '';

        // Update UI
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.statusText.textContent = 'Not monitoring';
        document.getElementById('status').querySelector('.status-icon').textContent = '⏸️';
    }

    analyze() {
        if (!this.isMonitoring) return;

        // Get frequency data
        this.analyser.getByteTimeDomainData(this.dataArray);

        // Calculate RMS (Root Mean Square) for volume
        let sum = 0;
        for (let i = 0; i < this.bufferLength; i++) {
            const normalized = (this.dataArray[i] - 128) / 128;
            sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / this.bufferLength);

        // Convert to decibels (approximation)
        // The formula dB = 20 * log10(rms) is used, with adjustment for microphone sensitivity
        let decibels = 20 * Math.log10(rms);

        // Normalize to typical ambient noise range (30-100 dB)
        // Add offset to make it more realistic
        decibels = Math.max(30, Math.min(100, decibels + 90));

        // Update statistics
        this.totalSamples++;
        this.sumNoise += decibels;
        this.peakNoise = Math.max(this.peakNoise, decibels);

        // Add to history
        this.noiseHistory.push(decibels);
        if (this.noiseHistory.length > this.maxHistoryLength) {
            this.noiseHistory.shift();
        }

        // Update UI
        this.updateDisplay(decibels);
        this.updateStatistics();
        this.drawWaveform();
        this.drawHistory();

        // Continue loop
        this.animationId = requestAnimationFrame(() => this.analyze());
    }

    updateDisplay(decibels) {
        // Store current decibels for word display
        this.currentDecibels = decibels;

        // Update background based on noise level
        this.updateBackground(decibels);

        // Update decibel value
        this.decibelValue.textContent = `${decibels.toFixed(1)} dB`;

        // Update meter bar
        const percentage = Math.min(100, ((decibels - 30) / 70) * 100);
        this.meterBar.style.width = `${percentage}%`;

        // Color coding
        if (decibels < 45) {
            this.meterBar.style.background = 'linear-gradient(90deg, #4ade80, #22c55e)';
            this.decibelValue.style.color = '#22c55e';
        } else if (decibels < 60) {
            this.meterBar.style.background = 'linear-gradient(90deg, #facc15, #eab308)';
            this.decibelValue.style.color = '#eab308';
        } else if (decibels < 80) {
            this.meterBar.style.background = 'linear-gradient(90deg, #fb923c, #f97316)';
            this.decibelValue.style.color = '#f97316';
        } else {
            this.meterBar.style.background = 'linear-gradient(90deg, #f87171, #ef4444)';
            this.decibelValue.style.color = '#ef4444';
        }
    }

    updateStatistics() {
        // Calculate average
        const average = this.sumNoise / this.totalSamples;
        this.avgNoise.textContent = `${average.toFixed(1)} dB`;

        // Update peak
        this.peakNoiseEl.textContent = `${this.peakNoise.toFixed(1)} dB`;

        // Update duration
        const duration = Math.floor((Date.now() - this.startTime) / 1000);
        this.durationEl.textContent = `${duration}s`;

        // Determine sensitivity level and recommendation
        let sensitivity, recommendation;

        if (average < 40) {
            sensitivity = '🟢 Very Quiet';
            recommendation = 'Your environment is exceptionally quiet. Ideal for concentration, sleep, and recording. This is a peaceful setting suitable for activities requiring minimal distraction.';
        } else if (average < 50) {
            sensitivity = '🟢 Quiet';
            recommendation = 'Your environment has low noise levels. Good for focused work, studying, and rest. This is a comfortable environment for most activities.';
        } else if (average < 60) {
            sensitivity = '🟡 Moderate';
            recommendation = 'Your environment has moderate noise levels. Acceptable for most activities, but may cause some distraction during tasks requiring deep concentration. Consider using headphones for focused work.';
        } else if (average < 70) {
            sensitivity = '🟠 Loud';
            recommendation = 'Your environment is quite noisy. This may interfere with concentration and communication. Consider moving to a quieter location or using noise-canceling headphones. Prolonged exposure to this level may cause fatigue.';
        } else if (average < 80) {
            sensitivity = '🔴 Very Loud';
            recommendation = 'Your environment has high noise levels. This can significantly impact concentration, sleep quality, and well-being. Noise-canceling solutions are strongly recommended. Consider relocating if possible.';
        } else {
            sensitivity = '🔴 Extremely Loud';
            recommendation = 'Your environment has potentially harmful noise levels. Prolonged exposure may damage hearing. Please consider using hearing protection and moving to a quieter location as soon as possible.';
        }

        this.sensitivityLevel.textContent = sensitivity;
        this.recommendationText.textContent = recommendation;
    }

    drawWaveform() {
        const canvas = this.waveformCanvas;
        const ctx = this.waveformCtx;
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, width, height);

        // Draw waveform
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#00d4ff';
        ctx.beginPath();

        const sliceWidth = width / this.bufferLength;
        let x = 0;

        for (let i = 0; i < this.bufferLength; i++) {
            const v = this.dataArray[i] / 128.0;
            const y = v * height / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Draw center line
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
    }

    drawHistory() {
        const canvas = this.historyCanvas;
        const ctx = this.historyCtx;
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, width, height);

        if (this.noiseHistory.length < 2) return;

        // Draw grid
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw history line
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const stepX = width / (this.maxHistoryLength - 1);
        const startIndex = Math.max(0, this.noiseHistory.length - this.maxHistoryLength);

        for (let i = 0; i < this.noiseHistory.length; i++) {
            const x = i * stepX;
            // Map decibels (30-100) to canvas height
            const normalized = (this.noiseHistory[i] - 30) / 70;
            const y = height - (normalized * height);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();

        // Draw labels
        ctx.fillStyle = '#888';
        ctx.font = '12px monospace';
        ctx.fillText('100 dB', 5, 15);
        ctx.fillText('30 dB', 5, height - 5);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const detector = new NoiseSensitivityDetector();
});
