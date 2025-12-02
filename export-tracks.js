const fs = require('fs');
const path = require('path');
const db = require('./db');

// Configuration
const EXPORT_DIR = path.join(__dirname, 'exports');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure export directory exists
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

// Create timestamped export folder
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const exportFolder = path.join(EXPORT_DIR, `tracks-export-${timestamp}`);
fs.mkdirSync(exportFolder, { recursive: true });

console.log(`Exporting tracks to: ${exportFolder}\n`);

// Get all tracks
const tracks = db.getAllTracks();

if (tracks.length === 0) {
  console.log('No tracks found to export.');
  process.exit(0);
}

console.log(`Found ${tracks.length} track(s) to export.\n`);

// Export tracks
const exportedTracks = [];
let successCount = 0;
let errorCount = 0;

tracks.forEach((track, index) => {
  try {
    const sourceFile = path.join(UPLOADS_DIR, track.stored_filename);
    
    // Check if file exists
    if (!fs.existsSync(sourceFile)) {
      console.log(`⚠️  Warning: File not found for track "${track.track_title}" (${track.stored_filename})`);
      errorCount++;
      return;
    }

    // Create a clean filename with metadata
    const safeTitle = track.track_title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const safeArtist = track.primary_artist.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const safeMix = track.mix_name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const ext = path.extname(track.stored_filename);
    
    // Format: artist_title_mix.ext
    const exportFilename = `${safeArtist}_${safeTitle}_${safeMix}${ext}`;
    const destFile = path.join(exportFolder, exportFilename);

    // Copy file
    fs.copyFileSync(sourceFile, destFile);
    
    // Add export info
    const exportedTrack = {
      ...track,
      export_filename: exportFilename,
      export_path: destFile,
      exported_at: new Date().toISOString()
    };
    
    exportedTracks.push(exportedTrack);
    successCount++;
    
    console.log(`✓ [${index + 1}/${tracks.length}] Exported: ${track.primary_artist} - ${track.track_title} (${track.mix_name})`);
  } catch (error) {
    console.error(`✗ Error exporting track "${track.track_title}":`, error.message);
    errorCount++;
  }
});

// Save metadata JSON file
const metadataFile = path.join(exportFolder, 'metadata.json');
fs.writeFileSync(metadataFile, JSON.stringify(exportedTracks, null, 2), 'utf8');
console.log(`\n✓ Metadata saved to: metadata.json`);

// Save metadata CSV file
const csvFile = path.join(exportFolder, 'metadata.csv');
const csvHeaders = ['ID', 'Original Filename', 'Export Filename', 'Track Title', 'Mix Name', 'Primary Artist', 'Featured Artists', 'Upload Timestamp', 'File Size (bytes)', 'MIME Type'];
const csvRows = exportedTracks.map(track => [
  track.id,
  track.original_filename,
  track.export_filename,
  `"${track.track_title}"`,
  `"${track.mix_name}"`,
  `"${track.primary_artist}"`,
  track.featured_artists ? `"${JSON.parse(track.featured_artists).join(', ')}"` : '',
  track.upload_timestamp,
  track.file_size_bytes,
  track.mime_type
]);

const csvContent = [
  csvHeaders.join(','),
  ...csvRows.map(row => row.join(','))
].join('\n');

fs.writeFileSync(csvFile, csvContent, 'utf8');
console.log(`✓ CSV metadata saved to: metadata.csv`);

// Summary
console.log(`\n${'='.repeat(50)}`);
console.log(`Export Summary:`);
console.log(`  Total tracks: ${tracks.length}`);
console.log(`  Successfully exported: ${successCount}`);
console.log(`  Errors: ${errorCount}`);
console.log(`  Export location: ${exportFolder}`);
console.log(`${'='.repeat(50)}\n`);

