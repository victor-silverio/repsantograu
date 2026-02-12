const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const vagasPath = path.join(rootDir, 'src', 'vagas.json');
const indexPath = path.join(rootDir, 'index.html');

try {
  // Read vagas.json
  const vagasData = JSON.parse(fs.readFileSync(vagasPath, 'utf8'));
  const { year, total_slots, occupied_slots, room_type } = vagasData;
  const available = total_slots - occupied_slots;

  console.log(
    `Updating vacancy info for year ${year}. Available: ${available}`
  );

  // Read index.html
  let indexHtml = fs.readFileSync(indexPath, 'utf8');

  // 1. Update Vacancy Badge
  // We need to replace the entire badge div or its content/classes.
  // To be robust, we'll look for the div with id="vacancy-badge" and replace it entirely.

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
  // Look for "Atualmente as vagas são para..." and update it.
  // We use \s+ to match spaces/newlines and [\s\S]*? to match any character (including newlines) until the first dot.
  const faqRegex = /Atualmente\s+as\s+vagas\s+são\s+para\s+[\s\S]*?\./g;
  const newFaqText = `Atualmente as vagas são para ${room_type}.`;

  if (faqRegex.test(indexHtml)) {
    indexHtml = indexHtml.replace(faqRegex, newFaqText);
    console.log('FAQ text updated.');
  } else {
    console.warn('Warning: Could not find FAQ text pattern in index.html');
  }

  // Write back to index.html
  fs.writeFileSync(indexPath, indexHtml, 'utf8');
  console.log('Successfully updated index.html with vacancy info.');
} catch (error) {
  console.error('Error updating vacancy info:', error);
  process.exit(1);
}
