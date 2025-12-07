class NoiseSensitivityDetector {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.dataArray = null;
        this.bufferLength = null;
        this.isMonitoring = false;
        this.animationId = null;

        // Speech recognition elements
        this.recognition = null;
        this.wordDisplay = document.getElementById('wordDisplay');
        this.wordFrequency = {};
        this.currentDecibels = 0;

        // Sound wave visualization
        this.soundWaveCanvas = document.getElementById('soundWaveCanvas');
        this.soundWaveCtx = this.soundWaveCanvas.getContext('2d');
        this.frequencyData = null;

        this.initCanvas();
        this.initSpeechRecognition();
        this.start();
    }

    initCanvas() {
        // Set canvas size to match window
        this.soundWaveCanvas.width = window.innerWidth;
        this.soundWaveCanvas.height = window.innerHeight;

        // Handle window resize
        window.addEventListener('resize', () => {
            this.soundWaveCanvas.width = window.innerWidth;
            this.soundWaveCanvas.height = window.innerHeight;
        });
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

    async start() {
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.microphone = this.audioContext.createMediaStreamSource(stream);

            // Configure analyser
            this.analyser.fftSize = 256;
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
            this.frequencyData = new Uint8Array(this.bufferLength);

            // Connect nodes
            this.microphone.connect(this.analyser);

            // Update state
            this.isMonitoring = true;

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
            alert('Unable to access microphone. Please ensure you have granted microphone permissions and reload the page.');
        }
    }

    analyze() {
        if (!this.isMonitoring) return;

        // Get time domain data for decibel calculation
        this.analyser.getByteTimeDomainData(this.dataArray);

        // Get frequency data for visualization
        this.analyser.getByteFrequencyData(this.frequencyData);

        // Calculate RMS (Root Mean Square) for volume
        let sum = 0;
        for (let i = 0; i < this.bufferLength; i++) {
            const normalized = (this.dataArray[i] - 128) / 128;
            sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / this.bufferLength);

        // Convert to decibels (approximation)
        let decibels = 20 * Math.log10(rms);

        // Normalize to typical ambient noise range (30-100 dB)
        decibels = Math.max(30, Math.min(100, decibels + 90));

        // Store current decibels for word display
        this.currentDecibels = decibels;

        // Draw sound wave visualization
        this.drawSoundWave();

        // Continue loop
        this.animationId = requestAnimationFrame(() => this.analyze());
    }

    drawSoundWave() {
        const canvas = this.soundWaveCanvas;
        const ctx = this.soundWaveCtx;
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Calculate bar properties
        const barCount = 64; // Number of bars to display
        const barWidth = width / barCount;
        const barSpacing = 2;

        // Draw bars
        for (let i = 0; i < barCount; i++) {
            // Sample frequency data
            const dataIndex = Math.floor((i / barCount) * this.bufferLength);
            const barHeight = (this.frequencyData[dataIndex] / 255) * height * 0.8;

            // Calculate bar position
            const x = i * barWidth;
            const y = height - barHeight;

            // Create gradient for red bars
            const gradient = ctx.createLinearGradient(0, y, 0, height);
            gradient.addColorStop(0, '#ff0000');
            gradient.addColorStop(0.5, '#ff3333');
            gradient.addColorStop(1, '#ff6666');

            // Draw bar
            ctx.fillStyle = gradient;
            ctx.fillRect(x + barSpacing / 2, y, barWidth - barSpacing, barHeight);

            // Add glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff0000';
        }

        // Reset shadow
        ctx.shadowBlur = 0;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const detector = new NoiseSensitivityDetector();
});
