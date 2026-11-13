const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const apiDir = path.join(__dirname, 'app', 'api');
// Use system temp directory to avoid Next.js picking it up
const apiBackupDir = path.join(os.tmpdir(), 'chess-engine-api-backup');

console.log('Building for GitHub Pages (static export)...');

// Temporarily move API routes out of the way
if (fs.existsSync(apiDir)) {
  if (fs.existsSync(apiBackupDir)) {
    fs.rmSync(apiBackupDir, { recursive: true, force: true });
  }
  // Use copy + remove instead of rename for Windows compatibility
  fs.cpSync(apiDir, apiBackupDir, { recursive: true });
  fs.rmSync(apiDir, { recursive: true, force: true });
  console.log('Moved app/api to temporary backup');
}

try {
  // Run the build
  execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
} finally {
  // Restore API routes
  if (fs.existsSync(apiBackupDir)) {
    if (fs.existsSync(apiDir)) {
      fs.rmSync(apiDir, { recursive: true, force: true });
    }
    fs.cpSync(apiBackupDir, apiDir, { recursive: true });
    fs.rmSync(apiBackupDir, { recursive: true, force: true });
    console.log('Restored app/api from backup');
  }
}