class InteractiveSpeechApp {
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
        this.sentenceDisplay = document.getElementById('sentenceDisplay');
        this.currentDecibels = 0;
        this.currentVolume = 0;

        // Sound wave visualization
        this.soundWaveCanvas = document.getElementById('soundWaveCanvas');
        this.soundWaveCtx = this.soundWaveCanvas.getContext('2d');
        this.frequencyData = null;

        // Sentence tracking
        this.sentences = [
            // English sentences
            "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG",
            "HELLO WORLD HOW ARE YOU TODAY",
            "SPEAK LOUDER TO STRETCH THE WORDS",
            "PRACTICE MAKES PERFECT EVERY TIME",
            // Chinese sentences
            "你好 世界 欢迎 来到 这里",
            "今天 天气 真的 很 好",
            "大声 说话 可以 拉伸 文字",
            "练习 让 我们 变得 更好"
        ];
        this.currentSentenceIndex = 0;
        this.currentWordIndex = 0;
        this.currentWords = [];
        this.wordElements = [];
        this.isWaitingForWord = true;
        this.maxStretchForCurrentWord = 1; // Track maximum stretch for active word

        this.initCanvas();
        this.initSpeechRecognition();
        this.displaySentence();
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

    displaySentence() {
        // Clear previous sentence
        this.sentenceDisplay.innerHTML = '';
        this.wordElements = [];

        // Get current sentence
        const sentence = this.sentences[this.currentSentenceIndex];

        // Split into words (handle both English and Chinese)
        const hasChinese = /[\u4e00-\u9fa5]+/.test(sentence);
        if (hasChinese) {
            // Chinese: split by spaces (words/characters are space-separated)
            this.currentWords = sentence.split(' ').filter(w => w.trim().length > 0);
        } else {
            // English: split by spaces
            this.currentWords = sentence.split(' ').filter(w => w.trim().length > 0);
        }

        // Create word elements
        this.currentWords.forEach((word, index) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'sentence-word';
            wordSpan.textContent = word;
            wordSpan.dataset.index = index;

            // Remove uppercase transformation for Chinese
            if (/[\u4e00-\u9fa5]+/.test(word)) {
                wordSpan.style.textTransform = 'none';
            }

            // Initialize transform to ensure stability
            wordSpan.style.transform = 'scaleY(1)';

            this.sentenceDisplay.appendChild(wordSpan);
            this.wordElements.push(wordSpan);
        });

        // Mark first word as active
        this.currentWordIndex = 0;
        this.wordElements[0].classList.add('active');
        this.isWaitingForWord = true;

        // Reset max stretch for first word
        this.maxStretchForCurrentWord = 1;
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

        // Detect language of current sentence
        const currentSentence = this.sentences[this.currentSentenceIndex];
        const hasChinese = /[\u4e00-\u9fa5]+/.test(currentSentence);
        this.recognition.lang = hasChinese ? 'zh-CN' : 'en-US';

        this.recognition.onresult = (event) => {
            if (!this.isWaitingForWord) return;

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript.trim();

                // Check if transcript contains the current word
                const currentWord = this.currentWords[this.currentWordIndex];
                const isMatch = this.matchWord(transcript, currentWord);

                if (isMatch) {
                    // Lock the word at its maximum stretch (highest volume)
                    const maxTransform = `scaleY(${this.maxStretchForCurrentWord})`;

                    // Mark current word as completed
                    this.wordElements[this.currentWordIndex].classList.remove('active');
                    this.wordElements[this.currentWordIndex].classList.add('completed');

                    // Lock the transform at maximum stretch
                    this.wordElements[this.currentWordIndex].style.transform = maxTransform;
                    this.wordElements[this.currentWordIndex].dataset.locked = 'true';

                    // Move to next word
                    this.currentWordIndex++;

                    // Reset max stretch for next word
                    this.maxStretchForCurrentWord = 1;

                    if (this.currentWordIndex >= this.currentWords.length) {
                        // Sentence completed, move to next sentence
                        setTimeout(() => {
                            this.currentSentenceIndex = (this.currentSentenceIndex + 1) % this.sentences.length;
                            this.displaySentence();

                            // Update recognition language for new sentence
                            const newSentence = this.sentences[this.currentSentenceIndex];
                            const newHasChinese = /[\u4e00-\u9fa5]+/.test(newSentence);
                            const newLang = newHasChinese ? 'zh-CN' : 'en-US';

                            if (this.recognition.lang !== newLang) {
                                this.switchLanguage(newLang);
                            }
                        }, 1000);
                    } else {
                        // Mark next word as active
                        this.wordElements[this.currentWordIndex].classList.add('active');
                    }

                    this.isWaitingForWord = false;
                    setTimeout(() => {
                        this.isWaitingForWord = true;
                    }, 500);
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
                            try {
                                this.recognition.start();
                            } catch (e) {
                                console.error('Error restarting recognition:', e);
                            }
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

    matchWord(transcript, targetWord) {
        // Normalize both strings for comparison
        const normalizedTranscript = transcript.toLowerCase().trim();
        const normalizedTarget = targetWord.toLowerCase().trim();

        // Check if transcript contains the target word
        return normalizedTranscript.includes(normalizedTarget) ||
               normalizedTarget.includes(normalizedTranscript);
    }

    switchLanguage(newLang) {
        if (!this.recognition) return;
        if (this.recognition.lang === newLang) return;

        console.log(`Switching to ${newLang}`);

        // Stop current recognition
        try {
            this.recognition.stop();
        } catch (e) {
            console.error('Error stopping recognition:', e);
        }

        // Update language and restart
        setTimeout(() => {
            if (this.isMonitoring) {
                this.recognition.lang = newLang;
                try {
                    this.recognition.start();
                    console.log(`Recognition restarted in ${newLang} mode`);
                } catch (e) {
                    console.error('Error restarting recognition:', e);
                }
            }
        }, 150);
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

        // Get time domain data for volume calculation
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

        // Store current decibels and volume
        this.currentDecibels = decibels;

        // Calculate normalized volume (0-1) for stretching with enhanced sensitivity
        // Use exponential curve for more dramatic response to volume changes
        let normalizedVolume = Math.max(0, Math.min(1, (decibels - 30) / 70));
        // Apply power curve to make whispers and shouts more distinct
        this.currentVolume = Math.pow(normalizedVolume, 0.8);

        // Apply stretch to active word based on volume
        this.stretchActiveWord();

        // Draw sound wave visualization
        this.drawSoundWave();

        // Continue loop
        this.animationId = requestAnimationFrame(() => this.analyze());
    }

    stretchActiveWord() {
        if (this.currentWordIndex >= this.wordElements.length) return;

        const activeWord = this.wordElements[this.currentWordIndex];
        if (!activeWord || !activeWord.classList.contains('active')) return;

        // Don't stretch if word is locked
        if (activeWord.dataset.locked === 'true') return;

        // Calculate stretch factor based on volume
        // Range: 0.3 (whisper/tiny) to 20 (shout/huge) for extreme dramatic effect
        const minStretch = 0.3;
        const maxStretch = 20;
        const stretchFactor = minStretch + (this.currentVolume * (maxStretch - minStretch));

        // Track maximum stretch for current word
        if (stretchFactor > this.maxStretchForCurrentWord) {
            this.maxStretchForCurrentWord = stretchFactor;
        }

        // Apply vertical stretch (scaleY)
        activeWord.style.transform = `scaleY(${stretchFactor})`;
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
    const app = new InteractiveSpeechApp();
});
