const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const vagasPath = path.join(rootDir, 'src', 'vagas.json');
const amenitiesPath = path.join(rootDir, 'src', 'amenities.json');
const indexPath = path.join(rootDir, 'index.html');

function generateAmenitiesHtml(amenitiesData) {
  if (!amenitiesData || !Array.isArray(amenitiesData)) {
    return '';
  }

  return amenitiesData
    .map((item) => {
      return `<div class="flex items-start gap-3">
                <div class="mt-1 flex w-6 flex-shrink-0 justify-center">
                  <svg
                    class="text-repGold h-5 w-5"
                    viewBox="0 0 640 640"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="${item.iconPath}"
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
                <span class="text-gray-700"
                  >${item.content}</span
                >
              </div>`;
    })
    .join('\n');
}

function updateJsonLd(indexHtml, available, year) {
  const jsonLdRegex =
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/;
  const match = indexHtml.match(jsonLdRegex);

  if (match && match[1]) {
    try {
      const jsonLdContent = JSON.parse(match[1]);
      const graph = jsonLdContent['@graph'];

      if (Array.isArray(graph)) {
        const localBusiness = graph.find(
          (item) => item['@type'] === 'LocalBusiness'
        );

        if (localBusiness && localBusiness.description) {
          let cleanDesc = localBusiness.description
            .split(' (Vagas')[0]
            .split(' (vagas')[0]
            .trim();
          let newSuffix;

          if (available > 0) {
            newSuffix = ` (Vagas Disponíveis: ${available} para ${year})`;
          } else {
            newSuffix = ` (Vagas Esgotadas para ${year})`;
          }

          const newFullDesc = cleanDesc + newSuffix;

          if (localBusiness.description !== newFullDesc) {
            localBusiness.description = newFullDesc;
            const newScriptTag = `<script type="application/ld+json">
      ${JSON.stringify(jsonLdContent, null, 2)}
    </script>`;
            console.log('SEO: JSON-LD description updated.');
            return indexHtml.replace(jsonLdRegex, newScriptTag);
          }
        }
      }
    } catch (e) {
      console.warn('Warning: Failed to parse or update JSON-LD:', e);
    }
  }
  return indexHtml;
}

try {
  // Read data
  const vagasData = JSON.parse(fs.readFileSync(vagasPath, 'utf8'));
  let amenitiesData = [];
  try {
    amenitiesData = JSON.parse(fs.readFileSync(amenitiesPath, 'utf8'));
  } catch (e) {
    console.warn('Warning: Could not read amenities.json', e.message);
  }

  const { year, total_slots, occupied_slots, room_type } = vagasData;
  const available = total_slots - occupied_slots;

  console.log(
    `Updating vacancy info for year ${year}. Available: ${available}`
  );

  // Read index.html
  let indexHtml = fs.readFileSync(indexPath, 'utf8');

  // 1. Update Vacancy Badge
  const badgeRegex = /<div[^>]*id="vacancy-badge"[^>]*>[\s\S]*?<\/div>/;
  let newBadgeHtml = '';

  if (available > 0) {
    newBadgeHtml = `<div
            class="animate-fadeIn mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md"
            id="vacancy-badge"
          >
            <span class="relative flex h-3 w-3"
              ><span
                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"
              ></span
              ><span
                class="relative inline-flex h-3 w-3 rounded-full bg-green-500"
              ></span></span
            ><span
              class="font-sans text-sm font-medium tracking-wide text-white md:text-base"
              >${available} Vagas Disponíveis para ${year}</span
            >
          </div>`;
  } else {
    newBadgeHtml = `<div
            class="animate-fadeIn mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/20 px-4 py-2 backdrop-blur-md"
            id="vacancy-badge"
          >
            <span class="relative flex h-3 w-3">
              <span class="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
            </span>
            <span class="font-sans text-sm font-medium tracking-wide text-white md:text-base">Vagas Esgotadas para ${year}</span>
          </div>`;
  }

  if (badgeRegex.test(indexHtml)) {
    indexHtml = indexHtml.replace(badgeRegex, newBadgeHtml);
    console.log('Vacancy badge updated.');
  } else {
    console.warn('Warning: Could not find #vacancy-badge in index.html');
  }

  // 2. Update FAQ Text
  const faqRegex = /Atualmente\s+as\s+vagas\s+são\s+para\s+[\s\S]*?\./g;
  const newFaqText = `Atualmente as vagas são para ${room_type}.`;

  if (faqRegex.test(indexHtml)) {
    indexHtml = indexHtml.replace(faqRegex, newFaqText);
    console.log('FAQ text updated.');
  } else {
    console.warn('Warning: Could not find FAQ text pattern in index.html');
  }

  // 3. Update Amenities
  const amenitiesContainerRegex =
    /(<div[^>]*id="amenities-container"[^>]*>)([\s\S]*?)(<\/div>)/;
  if (amenitiesContainerRegex.test(indexHtml) && amenitiesData.length > 0) {
    const newAmenitiesContent = generateAmenitiesHtml(amenitiesData);
    indexHtml = indexHtml.replace(
      amenitiesContainerRegex,
      `$1\n${newAmenitiesContent}\n$3`
    );
    console.log('Amenities updated.');
  } else {
    console.warn(
      'Warning: Could not find #amenities-container or no amenities data.'
    );
  }

  // 4. Update SEO (JSON-LD)
  indexHtml = updateJsonLd(indexHtml, available, year);

  // Write back to index.html
  fs.writeFileSync(indexPath, indexHtml, 'utf8');
  console.log('Successfully updated index.html with vacancy and amenities info.');
} catch (error) {
  console.error('Error updating info:', error);
  process.exit(1);
}
