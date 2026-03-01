#!/bin/bash
# Create placeholder WebP images for all content
# In production, these would be fetched from Unsplash and processed with sharp

BASE="public/images"

# Create a tiny 1x1 WebP placeholder (base64-decoded)
# This is a valid 1x1 WebP file
PLACEHOLDER_B64="UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA"

create_placeholder() {
  local path="$1"
  if [ ! -f "$path" ]; then
    mkdir -p "$(dirname "$path")"
    echo "$PLACEHOLDER_B64" | base64 -d > "$path" 2>/dev/null || touch "$path"
  fi
}

# Regions
for slug in yucatan-peninsula central-mexico pacific-coast baja-california oaxaca-chiapas; do
  create_placeholder "$BASE/regions/$slug.webp"
done

# Cities
for slug in mexico-city cancun playa-del-carmen puerto-vallarta oaxaca-city merida guadalajara san-miguel-de-allende guanajuato tulum; do
  create_placeholder "$BASE/cities/$slug.webp"
done

# Destinations
for slug in chichen-itza cenotes-yucatan teotihuacan frida-kahlo-museum monte-alban palenque copper-canyon isla-mujeres cozumel hierve-el-agua sumidero-canyon cabo-arch chapultepec-castle xochimilco tulum-ruins guanajuato-tunnels isla-holbox san-cristobal-de-las-casas riviera-maya los-cabos-beaches puebla-historic-center museo-nacional-de-antropologia marietas-islands bacalar-lagoon sayulita; do
  create_placeholder "$BASE/destinations/$slug.webp"
done

# Experiences
for slug in cenote-swimming street-food-tour-mexico-city tequila-tasting-jalisco mezcal-tour-oaxaca cooking-class-oaxaca scuba-diving-cozumel whale-watching-baja day-of-the-dead lucha-libre mariachi-plaza-garibaldi snorkeling-whale-sharks hot-air-balloon-teotihuacan surf-lesson-sayulita night-kayaking-bioluminescence exploring-underground-rivers traditional-temazcal hiking-copper-canyon chocolate-workshop cliff-diving-acapulco market-tour-oaxaca sunset-sailing-cabo pottery-workshop-puebla xochimilco-boat-ride zip-lining-riviera-maya photography-tour-guanajuato; do
  create_placeholder "$BASE/experiences/$slug.webp"
done

# Itineraries
for slug in classic-mexico-7-days yucatan-adventure-5-days pacific-coast-7-days baja-road-trip-5-days oaxaca-deep-dive-5-days mexico-city-3-days colonial-cities-7-days chiapas-adventure-5-days riviera-maya-family-5-days food-lovers-mexico-7-days; do
  create_placeholder "$BASE/itineraries/$slug.webp"
done

# Blog
for slug in mexico-travel-costs-2026 is-mexico-safe-for-tourists best-time-to-visit-mexico mexico-visa-requirements-2026 best-mexican-street-food getting-around-mexico mexico-packing-list best-cenotes-yucatan mexico-city-neighborhoods-guide tipping-in-mexico mexican-food-guide-beginners day-of-the-dead-guide best-beaches-mexico mexico-for-digital-nomads best-ruins-mexico solo-travel-mexico-tips oaxaca-food-guide cabo-vs-cancun mexico-sim-card-esim-guide sustainable-travel-mexico; do
  create_placeholder "$BASE/blog/$slug.webp"
done

# Authors
create_placeholder "$BASE/authors/team.webp"
create_placeholder "$BASE/authors/carlos.webp"
create_placeholder "$BASE/authors/sarah.webp"

# General
create_placeholder "$BASE/heroes/mexico-hero.webp"
create_placeholder "$BASE/og-default.jpg"
create_placeholder "$BASE/logo.webp"
create_placeholder "$BASE/placeholder.webp"

echo "Created placeholder images for all content."
