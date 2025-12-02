# TagMix Track Uploader

A minimal working prototype for uploading tracks to the TagMix platform.

## Installation

Install dependencies:

```bash
npm install
```

## Running the Development Server

Start the server:

```bash
npm run dev
```

The server will start on port 3000.

## Usage

Once the server is running, open your browser and navigate to:

```
http://localhost:3000/uploader.html
```

## API Endpoints

### POST /api/track-upload

Uploads a track with metadata.

**Form Fields:**
- `audio_file` (required): Audio file (WAV/MP3)
- `track_title` (required): Track title
- `mix_name` (required): Mix/version name
- `primary_artist` (required): Primary artist name
- `featured_artists` (optional): JSON array string, e.g. `["Artist B","Artist C"]`

**Success Response (200):**
```json
{
  "success": true,
  "track_id": "<uuid>",
  "message": "Track uploaded successfully"
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "Error message"
}
```

### GET /api/tracks

Returns a JSON array of all uploaded tracks, ordered by upload timestamp (newest first).

## Exporting Tracks

Export all tracks with metadata:

```bash
npm run export
```

This creates a timestamped folder in `exports/` containing:
- All audio files (renamed with metadata)
- `metadata.json` - Complete metadata in JSON format
- `metadata.csv` - Spreadsheet-friendly CSV format

## Deployment to DigitalOcean App Platform

### Prerequisites
1. A GitHub account
2. A DigitalOcean account
3. Your code pushed to a GitHub repository

### Steps

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on DigitalOcean:**
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Click "Create App"
   - Connect your GitHub repository
   - Select the repository and branch
   - DigitalOcean will auto-detect Node.js
   - Verify settings:
     - **Build Command:** `npm install`
     - **Run Command:** `npm start`
     - **HTTP Port:** `3000` (or leave default)
   - Click "Create Resources"

3. **Important Notes:**
   - The app uses `process.env.PORT` (automatically set by DigitalOcean)
   - Uploaded files are stored in the `uploads/` directory (ephemeral - will be lost on restart)
   - For production, consider using DigitalOcean Spaces for persistent file storage
   - The database (`db/tracks.json`) is also ephemeral

## Project Structure

- `server.js` - Main Express server
- `public/uploader.html` - Frontend upload form
- `uploads/` - Directory where uploaded audio files are stored
- `db/tracks.json` - JSON database containing track metadata
- `export-tracks.js` - Script to export tracks with metadata



