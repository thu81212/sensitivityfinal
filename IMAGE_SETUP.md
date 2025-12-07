# Image Setup Instructions

## Background Image

The application uses a single background image:

- **Frame 15.png** - Main background image displayed at all times

## How to Add Your Image

1. Place your `Frame 15.png` file in the root directory of the project (same location as `index.html`)

2. **Recommended Image Specifications:**
   - Format: PNG (supports transparency)
   - Dimensions: 1920x1080 or higher (for full screen coverage)
   - File size: Optimized for web (< 2MB recommended)
   - Style: Consider semi-transparent or subtle backgrounds so they don't interfere with the UI

3. **Image Behavior:**
   - Image appears at full opacity as the main background
   - The background covers the entire viewport and scales to fit
   - Provides backdrop for sound wave visualization and detected words

## Placeholder Image

Currently, the application includes a placeholder image:
- **Frame 15.png** - Background image placeholder

Replace this with your own image for a custom experience.

## Testing

After adding your image:
1. Open the application
2. The `Frame 15.png` background should be visible at full opacity
3. Sound wave bars and detected words will appear over the background

## Troubleshooting

- If image doesn't appear, check the browser console for loading errors
- Ensure image filename is exactly `Frame 15.png` (case-sensitive, with space)
- Make sure image is in the same directory as `index.html`
- Check file permissions if hosting on a server
