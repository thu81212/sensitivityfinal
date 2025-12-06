# 🎧 Noise Sensitivity Detector

A real-time web application that analyzes and measures ambient noise levels in your environment using the Web Audio API.

## Features

- **Real-time Noise Monitoring**: Continuously measures ambient noise levels in decibels (dB)
- **Visual Feedback**:
  - Live decibel meter with color-coded display
  - Real-time audio waveform visualization
  - Historical noise level chart
- **Sensitivity Analysis**:
  - Environment classification (Very Quiet, Quiet, Moderate, Loud, Very Loud, Extremely Loud)
  - Average and peak noise level tracking
  - Duration monitoring
  - Personalized recommendations based on noise levels
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Privacy-Focused**: All audio processing happens locally in your browser

## How It Works

The application uses the Web Audio API to:
1. Access your device's microphone (with your permission)
2. Analyze the audio stream in real-time
3. Calculate noise levels using RMS (Root Mean Square) analysis
4. Convert measurements to decibel values
5. Provide visual feedback and recommendations

## Usage

1. Open `index.html` in a modern web browser
2. Click "Start Monitoring" button
3. Grant microphone access when prompted
4. View real-time noise analysis and recommendations

### Noise Level Categories

- **30-40 dB**: Very Quiet (Library, whisper)
- **40-50 dB**: Quiet (Residential area, quiet office)
- **50-60 dB**: Moderate (Normal conversation, background music)
- **60-70 dB**: Loud (Busy restaurant, office environment)
- **70-80 dB**: Very Loud (Vacuum cleaner, busy traffic)
- **80+ dB**: Extremely Loud (Potential hearing damage risk)

## Technical Requirements

- Modern web browser with Web Audio API support (Chrome, Firefox, Safari, Edge)
- Microphone access
- HTTPS connection (required for microphone access on most browsers)

## Privacy & Security

- No data is transmitted to external servers
- All audio processing occurs locally in your browser
- Microphone access can be revoked at any time through browser settings
- No audio is recorded or stored

## Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## Local Development

Simply open `index.html` in your browser or use a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000`

## Files

- `index.html` - Main HTML structure
- `app.js` - JavaScript application logic and Web Audio API implementation
- `styles.css` - Styling and responsive design
- `README.md` - Documentation

## License

This project is open source and available for educational and personal use.
