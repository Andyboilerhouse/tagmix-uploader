const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, 'db');
const DB_FILE = path.join(DB_DIR, 'tracks.json');

// Ensure db directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf8');
}

/**
 * Read all tracks from the JSON file
 */
function readTracks() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading tracks:', error);
    return [];
  }
}

/**
 * Write tracks array to the JSON file
 */
function writeTracks(tracks) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(tracks, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing tracks:', error);
    throw error;
  }
}

/**
 * Add a new track record
 * @param {Object} record - Track record with fields: id, original_filename, stored_filename, track_title, mix_name, primary_artist, featured_artists, upload_timestamp, file_size_bytes, mime_type
 */
function addTrack(record) {
  const tracks = readTracks();
  tracks.push(record);
  writeTracks(tracks);
}

/**
 * Get all tracks, ordered by upload_timestamp DESC (newest first)
 */
function getAllTracks() {
  const tracks = readTracks();
  return tracks.sort((a, b) => {
    return new Date(b.upload_timestamp) - new Date(a.upload_timestamp);
  });
}

module.exports = {
  addTrack,
  getAllTracks
};

