const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `track-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// POST /api/track-upload
app.post('/api/track-upload', upload.single('audio_file'), (req, res) => {
  try {
    // Handle multer errors (e.g., file too large)
    if (req.fileValidationError) {
      return res.status(400).json({ success: false, error: req.fileValidationError });
    }

    // Validate required fields
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'audio_file is required' });
    }

    const { track_title, mix_name, primary_artist, featured_artists } = req.body;

    if (!track_title || !track_title.trim()) {
      return res.status(400).json({ success: false, error: 'track_title is required' });
    }

    if (!mix_name || !mix_name.trim()) {
      return res.status(400).json({ success: false, error: 'mix_name is required' });
    }

    if (!primary_artist || !primary_artist.trim()) {
      return res.status(400).json({ success: false, error: 'primary_artist is required' });
    }

    // Generate UUID for track
    const trackId = uuidv4();

    // Parse featured_artists (it comes as a JSON string)
    let featuredArtistsJson = null;
    if (featured_artists) {
      try {
        const parsed = JSON.parse(featured_artists);
        if (Array.isArray(parsed) && parsed.length > 0) {
          featuredArtistsJson = JSON.stringify(parsed);
        }
      } catch (e) {
        // If parsing fails, ignore it (optional field)
      }
    }

    // Create track record
    const uploadTimestamp = new Date().toISOString();
    const trackRecord = {
      id: trackId,
      original_filename: req.file.originalname,
      stored_filename: req.file.filename,
      track_title: track_title.trim(),
      mix_name: mix_name.trim(),
      primary_artist: primary_artist.trim(),
      featured_artists: featuredArtistsJson,
      upload_timestamp: uploadTimestamp,
      file_size_bytes: req.file.size,
      mime_type: req.file.mimetype
    };

    // Save to database
    db.addTrack(trackRecord);

    return res.json({
      success: true,
      track_id: trackId,
      message: 'Track uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/tracks
app.get('/api/tracks', (req, res) => {
  try {
    const tracks = db.getAllTracks();
    res.json(tracks);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware for multer and other errors
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'File too large. Maximum size is 100MB.' });
    }
    return res.status(400).json({ success: false, error: 'File upload error: ' + error.message });
  }
  console.error('Unhandled error:', error);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Uploader available at http://localhost:${PORT}/uploader.html`);
});

