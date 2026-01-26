const axios = require('axios');

const categories = [
  {
    name: 'Figurines',
    slug: 'figurines',
    description: 'Figurines de collection (anime, manga, jeux vidéo)',
    isActive: true
  },
  {
    name: 'Cartes à collectionner',
    slug: 'cartes-collectionner',
    description: 'Cartes Pokemon, Yu-Gi-Oh, Magic the Gathering, etc.',
    isActive: true
  },
  {
    name: 'Mangas & BD',
    slug: 'mangas-bd',
    description: 'Mangas, comics, bandes dessinées',
    isActive: true
  },
  {
    name: 'Jeux vidéo rétro',
    slug: 'jeux-video-retro',
    description: 'Jeux vidéo rétro et consoles vintage',
    isActive: true
  },
  {
    name: 'Goodies',
    slug: 'goodies',
    description: 'Produits dérivés, merchandising, accessoires',
    isActive: true
  },
  {
    name: 'Vinyles & CD',
    slug: 'vinyles-cd',
    description: 'Musique physique de collection',
    isActive: true
  }
];

async function seedCategories() {
  console.log('Seeding categories...');

  for (const category of categories) {
    try {
      const response = await axios.post('http://localhost:8002/categories', category);
      console.log(`✅ Created: ${category.name}`);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`⚠️  Already exists: ${category.name}`);
      } else {
        console.error(`❌ Error creating ${category.name}:`, error.message);
      }
    }
  }

  console.log('\nDone! Categories seeded.');
}

seedCategories();
