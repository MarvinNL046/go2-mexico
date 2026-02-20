const path = require('path');
const fs = require('fs');

const dataDir = path.join(process.cwd(), 'data', 'food');

function getAllDishes() {
  try {
    const indexPath = path.join(dataDir, 'index.json');
    if (!fs.existsSync(indexPath)) return [];
    return JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  } catch (error) {
    console.error('Error loading food index:', error.message);
    return [];
  }
}

function getDishBySlug(slug) {
  try {
    const dishPath = path.join(dataDir, `${slug}.json`);
    if (fs.existsSync(dishPath)) {
      return JSON.parse(fs.readFileSync(dishPath, 'utf8'));
    }
  } catch (error) {
    console.error(`Error loading dish data for ${slug}:`, error.message);
  }
  return null;
}

function getDishSlugs() {
  return getAllDishes().map(dish => dish.slug);
}

function getDishesByCategory(category) {
  return getAllDishes().filter(dish => dish.category === category);
}

module.exports = { getAllDishes, getDishBySlug, getDishSlugs, getDishesByCategory };
