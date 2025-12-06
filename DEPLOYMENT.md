# 🚀 Deployment Guide

## Quick Deploy Options

### Option 1: GitHub Pages (Recommended)

1. **Merge to Main Branch**
   - Go to your GitHub repository: `https://github.com/thu81212/sensitivityfinal`
   - Create a Pull Request from `claude/noise-sensitivity-detector-012Sbit8rrKBj8qi3iXKfR4T` to `main`
   - Merge the pull request

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Under "Source", select branch: `main`
   - Select folder: `/ (root)`
   - Click Save

3. **Access Your Site**
   - Your site will be published at: `https://thu81212.github.io/sensitivityfinal/`
   - Wait 2-3 minutes for initial deployment

### Option 2: Netlify (Instant Deploy)

1. Go to [Netlify](https://www.netlify.com/)
2. Sign in with GitHub
3. Click "Add new site" → "Import an existing project"
4. Choose GitHub and select `thu81212/sensitivityfinal`
5. Deploy settings:
   - Branch: `claude/noise-sensitivity-detector-012Sbit8rrKBj8qi3iXKfR4T` or `main`
   - Build command: (leave empty)
   - Publish directory: `/`
6. Click "Deploy"
7. Your site will be live at: `https://[random-name].netlify.app`

### Option 3: Vercel

1. Go to [Vercel](https://vercel.com/)
2. Sign in with GitHub
3. Click "Add New Project"
4. Import `thu81212/sensitivityfinal`
5. Click "Deploy"
6. Your site will be live at: `https://sensitivityfinal.vercel.app`

### Option 4: Cloudflare Pages

1. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Sign in and connect GitHub
3. Select `thu81212/sensitivityfinal`
4. Build settings:
   - Build command: (leave empty)
   - Build output directory: `/`
5. Deploy
6. Your site will be live at: `https://sensitivityfinal.pages.dev`

## Local Testing

Before deploying, test locally:

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000`

## Important Notes

- **HTTPS Required**: Microphone access requires HTTPS (all deployment options provide this)
- **Permissions**: Users must grant microphone permission
- **Browser Compatibility**: Modern browsers only (Chrome, Firefox, Safari, Edge)

## Troubleshooting

**Microphone not working?**
- Ensure you're accessing via HTTPS
- Check browser permissions
- Try a different browser

**Site not loading?**
- Wait 2-3 minutes after deployment
- Clear browser cache
- Check deployment logs

## Custom Domain (Optional)

All platforms above support custom domains. Check their respective documentation:
- GitHub Pages: Settings → Pages → Custom domain
- Netlify: Site settings → Domain management
- Vercel: Project settings → Domains
- Cloudflare: Worker routes → Custom domains
