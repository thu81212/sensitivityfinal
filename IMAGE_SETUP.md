# Image Setup Instructions

## Background Image

The application uses a single background image:

- **Loud.png** - Main background image displayed at all times

## How to Add Your Image

1. Place your `Loud.png` file in the root directory of the project (same location as `index.html`)

2. **Recommended Image Specifications:**
   - Format: PNG (supports transparency)
   - Dimensions: 1920x1080 or higher (for full screen coverage)
   - File size: Optimized for web (< 2MB recommended)
   - Style: Consider semi-transparent or subtle backgrounds so they don't interfere with the UI

3. **Image Behavior:**
   - Image appears at 30% opacity behind the main interface
   - The background covers the entire viewport and scales to fit
   - Provides a consistent backdrop for detected words

## Placeholder Image

Currently, the application includes a placeholder image:
- **Loud.png** - Red gradient placeholder

Replace this with your own image for a custom experience.

## Testing

After adding your image:
1. Open the application
2. The `Loud.png` background should be visible at 30% opacity
3. Click "Start Monitoring" to see detected words appear over the background

## Troubleshooting

- If image doesn't appear, check the browser console for loading errors
- Ensure image filename is exactly `Loud.png` (case-sensitive)
- Make sure image is in the same directory as `index.html`
- Check file permissions if hosting on a server
