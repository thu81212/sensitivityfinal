# Image Setup Instructions

## Background Images

The application uses two background images that change based on the noise level detected:

1. **Loud.png** - Displayed when noise level is >= 50 dB (loud environment)
2. **Quiet.png** - Displayed when noise level is < 50 dB (quiet environment)

## How to Add Your Images

1. Place your `Loud.png` and `Quiet.png` files in the root directory of the project (same location as `index.html`)

2. **Recommended Image Specifications:**
   - Format: PNG (supports transparency)
   - Dimensions: 1920x1080 or higher (for full screen coverage)
   - File size: Optimized for web (< 2MB recommended)
   - Style: Consider semi-transparent or subtle backgrounds so they don't interfere with the UI

3. **Image Behavior:**
   - Images appear at 30% opacity behind the main interface
   - They transition smoothly (1 second fade) when switching between loud/quiet states
   - The background covers the entire viewport and scales to fit

## Placeholder Images

Currently, the application includes placeholder images:
- **Loud.png** - Red gradient placeholder
- **Quiet.png** - Blue gradient placeholder

Replace these with your own images for the full experience.

## Testing

After adding your images:
1. Open the application
2. Click "Start Monitoring"
3. Make noise to see the background change to `Loud.png`
4. Stay quiet to see it change to `Quiet.png`

## Troubleshooting

- If images don't appear, check the browser console for loading errors
- Ensure image filenames are exactly `Loud.png` and `Quiet.png` (case-sensitive)
- Make sure images are in the same directory as `index.html`
- Check file permissions if hosting on a server
