const path = require('path');
const fs = require('fs');

const dataDir = path.join(process.cwd(), 'data', 'islands');

function getAllIslands() {
  try {
    const indexPath = path.join(dataDir, 'index.json');
    if (!fs.existsSync(indexPath)) return [];
    return JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  } catch (error) {
    console.error('Error loading islands index:', error.message);
    return [];
  }
}

function getIslandBySlug(slug) {
  try {
    const islandPath = path.join(dataDir, `${slug}.json`);
    if (fs.existsSync(islandPath)) {
      return JSON.parse(fs.readFileSync(islandPath, 'utf8'));
    }
  } catch (error) {
    console.error(`Error loading island data for ${slug}:`, error.message);
  }
  return null;
}

function getIslandSlugs() {
  return getAllIslands().map(island => island.slug);
}

module.exports = { getAllIslands, getIslandBySlug, getIslandSlugs };
