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

        this.initEventListeners();
    }

    initEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.stopBtn.addEventListener('click', () => this.stop());
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
