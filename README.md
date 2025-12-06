# 🎧 Noise Sensitivity Detector

A real-time web application that analyzes and measures ambient noise levels in your environment using the Web Audio API.

## 🚀 Quick Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/thu81212/sensitivityfinal)

**Other Deployment Options:**
- **GitHub Pages**: See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions
- **Vercel**: Import from GitHub at [vercel.com](https://vercel.com)
- **Cloudflare Pages**: Import from GitHub at [pages.cloudflare.com](https://pages.cloudflare.com)

## Features

- **Real-time Noise Monitoring**: Continuously measures ambient noise levels in decibels (dB)
- **Speech Recognition & Word Detection**:
  - Detects and displays spoken words in real-time
  - Words appear with dynamic sizing based on volume
  - Automatic fade-in and fade-out animations
  - Uses Barrio font for dramatic effect
- **Dynamic Background**:
  - Changes between Loud.png and Quiet.png based on noise level
  - Smooth transitions between states
  - Customizable background images
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

### First Time Setup

1. **Add Background Images** (Optional):
   - Place `Loud.png` and `Quiet.png` in the root directory
   - See [IMAGE_SETUP.md](IMAGE_SETUP.md) for detailed instructions
   - Or use the included placeholder images

### Running the Application

1. Open `index.html` in a modern web browser
2. Click "Start Monitoring" button
3. Grant microphone access when prompted
4. **Speak clearly** to see your words appear on screen
5. View real-time noise analysis and recommendations

### How It Works

- **Quiet Environment** (< 50 dB): Background shows `Quiet.png`
- **Loud Environment** (≥ 50 dB): Background shows `Loud.png`
- **Spoken Words**: Appear on screen with size based on volume, then fade away
- **Word Display**: Larger words = louder speech

### Noise Level Categories

- **30-40 dB**: Very Quiet (Library, whisper)
- **40-50 dB**: Quiet (Residential area, quiet office)
- **50-60 dB**: Moderate (Normal conversation, background music)
- **60-70 dB**: Loud (Busy restaurant, office environment)
- **70-80 dB**: Very Loud (Vacuum cleaner, busy traffic)
- **80+ dB**: Extremely Loud (Potential hearing damage risk)

## Technical Requirements

- Modern web browser with Web Audio API and Web Speech API support
- **Recommended**: Chrome/Edge (best speech recognition support)
- Microphone access
- HTTPS connection (required for microphone access on most browsers)
- JavaScript enabled

## Privacy & Security

- No data is transmitted to external servers
- All audio processing occurs locally in your browser
- Microphone access can be revoked at any time through browser settings
- No audio is recorded or stored

## Browser Compatibility

### Noise Monitoring (Supported on all)
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Opera

### Speech Recognition (Chrome/Edge only)
- ✅ Chrome (Recommended)
- ✅ Edge
- ⚠️ Firefox (Limited support)
- ⚠️ Safari (Limited support)

**Note**: Speech recognition works best in Chrome and Edge browsers.

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
- `app.js` - JavaScript application logic with Web Audio API and Speech Recognition
- `styles.css` - Styling, animations, and responsive design
- `README.md` - Documentation
- `IMAGE_SETUP.md` - Instructions for setting up background images
- `DEPLOYMENT.md` - Deployment guide
- `create_placeholders.html` - Tool to generate placeholder images
- `Loud.png` - Background image for loud environments (add your own)
- `Quiet.png` - Background image for quiet environments (add your own)

## License

This project is open source and available for educational and personal use.
