const path = require('path');
const fs = require('fs');

const dataDir = path.join(process.cwd(), 'data', 'cities');
const enhancedDir = path.join(process.cwd(), 'data', 'enhanced', 'cities');

function getAllCities() {
  try {
    const indexPath = path.join(dataDir, 'index.json');
    if (!fs.existsSync(indexPath)) return [];
    return JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  } catch (error) {
    console.error('Error loading cities index:', error.message);
    return [];
  }
}

function getCityBySlug(slug) {
  // Try enhanced version first
  try {
    const enhancedPath = path.join(enhancedDir, `${slug}.json`);
    if (fs.existsSync(enhancedPath)) {
      return JSON.parse(fs.readFileSync(enhancedPath, 'utf8'));
    }
  } catch {}

  // Fall back to standard data
  try {
    const cityPath = path.join(dataDir, `${slug}.json`);
    if (fs.existsSync(cityPath)) {
      return JSON.parse(fs.readFileSync(cityPath, 'utf8'));
    }
  } catch (error) {
    console.error(`Error loading city data for ${slug}:`, error.message);
  }

  return null;
}

function getCitySlugs() {
  return getAllCities().map(city => city.slug);
}

module.exports = { getAllCities, getCityBySlug, getCitySlugs };
