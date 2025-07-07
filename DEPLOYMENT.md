# GitHub Pages Deployment Guide

This pricing calculator is ready to deploy to GitHub Pages!

## Quick Setup

1. **Create a GitHub repository** (if you haven't already)
2. **Push your code** to the repository
3. **Enable GitHub Pages**:
   - Go to your repository settings
   - Scroll to "Pages" section
   - Select source: "Deploy from a branch"
   - Choose branch: `main` (or `master`)
   - Choose folder: `/ (root)`
   - Click "Save"

## Your site will be available at:
```
https://[your-username].github.io/[repository-name]/
```

## Files included:
- `index.html` - Main page
- `script.js` - JavaScript functionality
- `styles.css` - Styling
- `config.json` - Configuration data
- `test.html` - Test page (optional)

## Local testing:
Since this uses `fetch()` to load config.json, you should test locally with a simple HTTP server:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if you have npx)
npx serve

# Or use VS Code Live Server extension
```

Then visit `http://localhost:8000`

## Notes:
- All files are static - no server-side processing needed
- Configuration is loaded from `config.json` dynamically
- Mobile responsive design
- Works with HTTPS (required for GitHub Pages)
