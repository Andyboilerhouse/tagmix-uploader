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

## Project Structure

- `server.js` - Main Express server
- `public/uploader.html` - Frontend upload form
- `uploads/` - Directory where uploaded audio files are stored
- `tracks.db` - SQLite database containing track metadata


