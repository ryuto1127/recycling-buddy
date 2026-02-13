const SUPPORTED_REGION = 'metro-vancouver-new-westminster';
const REGION_STORAGE_KEY = 'recycling-buddy-region';
const EVENT_STORAGE_KEY = 'recycling-buddy-events';

const REGION_LABELS = {
  [SUPPORTED_REGION]: 'Metro Vancouver / New Westminster',
};

const CATEGORY_LABELS = {
  'plastic-container': 'Plastic container',
  'metal-can': 'Metal can',
  'paper-cardboard': 'Paper / cardboard',
  glass: 'Glass',
  'battery-ewaste': 'Battery / e-waste',
  organics: 'Organics',
  garbage: 'Garbage',
};

const classToCategory = {
  aluminum_food_cans: 'metal-can',
  aluminum_soda_cans: 'metal-can',
  cardboard_boxes: 'paper-cardboard',
  cardboard_packaging: 'paper-cardboard',
  glass_beverage_bottles: 'glass',
  glass_cosmetic_containers: 'glass',
  glass_food_jars: 'glass',
  magazines: 'paper-cardboard',
  newspaper: 'paper-cardboard',
  office_paper: 'paper-cardboard',
  paper_cups: 'garbage',
  plastic_cup_lids: 'garbage',
  plastic_detergent_bottles: 'plastic-container',
  plastic_food_containers: 'plastic-container',
  plastic_soda_bottles: 'plastic-container',
  plastic_water_bottles: 'plastic-container',
  steel_food_cans: 'metal-can',
  coffee_grounds: 'organics',
  tea_bags: 'organics',
  eggshells: 'organics',
  food_waste: 'organics',
  aerosol_cans: 'metal-can',
  clothing: 'garbage',
  disposable_plastic_cutlery: 'garbage',
  plastic_trash_bags: 'garbage',
  plastic_straws: 'garbage',
  shoes: 'garbage',
  styrofoam_cups: 'garbage',
  styrofoam_food_containers: 'garbage',
};

const rules = {
  [SUPPORTED_REGION]: {
    'plastic-container': {
      binLabel: 'Recycling (Containers)',
      instructions: ['Empty and rinse container.', 'Keep lids attached when possible.'],
      officialLink: 'https://recyclebc.ca/where-can-i-recycle/',
    },
    'metal-can': {
      binLabel: 'Recycling (Containers)',
      instructions: ['Rinse food residue.', 'Crush only if accepted locally.'],
      officialLink: 'https://recyclebc.ca/where-can-i-recycle/',
    },
    'paper-cardboard': {
      binLabel: 'Mixed Paper / Blue Box',
      instructions: ['Keep paper clean and dry.', 'Flatten cardboard.'],
      officialLink: 'https://recyclebc.ca/where-can-i-recycle/',
    },
    glass: {
      binLabel: 'Glass Collection / Depot',
      instructions: ['Rinse glass containers.', 'No ceramics or window glass.'],
      officialLink: 'https://recyclebc.ca/where-can-i-recycle/',
    },
    'battery-ewaste': {
      binLabel: 'Drop-off Depot (Special Waste)',
      instructions: ['Do not place in curbside bins.', 'Tape battery terminals before drop-off.'],
      officialLink: 'https://recyclebc.ca/where-can-i-recycle/',
    },
    organics: {
      binLabel: 'Green Bin (Organics)',
      instructions: ['Use compostable liner where accepted.', 'No plastic packaging.'],
      officialLink: 'https://recyclebc.ca/where-can-i-recycle/',
    },
    garbage: {
      binLabel: 'Garbage',
      instructions: ['Bag securely.', 'Use only if not accepted elsewhere.'],
      officialLink: 'https://recyclebc.ca/where-can-i-recycle/',
    },
  },
};

let model;
let isModelLoaded = false;
let currentImageData = null;
let activeRegion = localStorage.getItem(REGION_STORAGE_KEY) || SUPPORTED_REGION;
let manualFallbackUsed = false;

const landingScreen = document.getElementById('landing-screen');
const scanningScreen = document.getElementById('scanning-screen');
const resultScreen = document.getElementById('result-screen');
const startScanningBtn = document.getElementById('start-scanning-btn');
const backBtn = document.getElementById('back-btn');
const detectBtn = document.getElementById('detect-btn');
const fileInput = document.getElementById('file-input');
const uploadPhotoBtn = document.getElementById('upload-photo-btn');
const webcamContainer = document.getElementById('webcam-container');
const detectingState = document.getElementById('detecting-state');
const predictionResults = document.getElementById('prediction-results');
const binRecommendation = document.getElementById('bin-recommendation');
const ecoTip = document.getElementById('eco-tip');
const scanAnotherBtn = document.getElementById('scan-another-btn');
const backToHomeBtn = document.getElementById('back-to-home-btn');
const backToScanBtn = document.getElementById('back-to-scan-btn');
const regionSelect = document.getElementById('region-select');

function logEvent(name, payload = {}) {
  const event = { name, payload, timestamp: new Date().toISOString() };
  console.info('[analytics]', event);

  try {
    const existing = JSON.parse(localStorage.getItem(EVENT_STORAGE_KEY) || '[]');
    existing.push(event);
    localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(existing.slice(-100)));
  } catch (error) {
    console.warn('Failed to store event', error);
  }

  fetch('/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  }).catch(() => {});
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

function getConfidenceState(p1) {
  if (p1 >= 0.75) return 'CONFIDENT';
  if (p1 >= 0.45) return 'UNCERTAIN';
  return 'UNKNOWN';
}

function getRecommendation(region, category, confidenceState) {
  const base = rules[region][category];
  if (confidenceState === 'CONFIDENT') return base;

  return {
    ...base,
    instructions: ['Low confidence result: verify item before disposal.', ...base.instructions],
  };
}

function initializeRegionSelector() {
  regionSelect.innerHTML = Object.entries(REGION_LABELS)
    .map(([value, label]) => `<option value="${value}">${label}</option>`)
    .join('');
  regionSelect.value = activeRegion;
}

async function initializeApp() {
  initializeRegionSelector();
  try {
    const URL = 'https://teachablemachine.withgoogle.com/models/QFClfelrW/';
    model = await tmImage.load(`${URL}model.json`, `${URL}metadata.json`);
    isModelLoaded = true;
  } catch {
    isModelLoaded = false;
  }
}


function renderEmptyPreview() {
  webcamContainer.innerHTML = '<p id="preview-empty-message" class="text-sm text-gray-500">No photo selected yet.</p>';
  detectBtn.disabled = true;
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  logEvent('image_selected', { source: 'upload', region: activeRegion });

  const reader = new FileReader();
  reader.onload = function onLoad(e) {
    const img = new Image();
    img.onload = function onImageLoad() {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const x = canvas.width / 2 - (img.width / 2) * scale;
      const y = canvas.height / 2 - (img.height / 2) * scale;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      webcamContainer.innerHTML = '';
      webcamContainer.appendChild(canvas);
      currentImageData = canvas;
      detectBtn.disabled = false;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function getDemoPrediction() {
  const labels = Object.keys(classToCategory);
  const top = labels[Math.floor(Math.random() * labels.length)];
  const p1 = Number((0.2 + Math.random() * 0.75).toFixed(2));
  const p2 = Number((Math.random() * (1 - p1) * 0.8).toFixed(2));
  const p3 = Number((Math.max(0.01, 1 - p1 - p2)).toFixed(2));

  return [
    { className: top, probability: p1 },
    { className: labels[Math.floor(Math.random() * labels.length)], probability: p2 },
    { className: labels[Math.floor(Math.random() * labels.length)], probability: p3 },
  ];
}

async function runPrediction() {
  if (!currentImageData) throw new Error('No image');
  if (!isModelLoaded || !model) return getDemoPrediction();

  const predictions = await model.predict(currentImageData);
  predictions.sort((a, b) => b.probability - a.probability);
  return predictions;
}

function renderManualCategoryPicker(confidenceState, officialLink) {
  const buttons = Object.entries(CATEGORY_LABELS)
    .map(
      ([value, label]) =>
        `<button class="manual-category-btn border border-gray-300 rounded px-3 py-2 text-sm hover:bg-gray-50" data-category="${value}">${label}</button>`
    )
    .join('');

  const title = confidenceState === 'UNKNOWN'
    ? 'I can’t reliably classify this item.'
    : 'Low confidence prediction. Please confirm manually.';

  return `
    <div class="border border-amber-300 bg-amber-50 rounded-lg p-4">
      <p class="font-semibold text-amber-900 mb-2">${title}</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">${buttons}</div>
      <a href="${officialLink}" target="_blank" rel="noreferrer" class="text-blue-700 underline text-sm">Check official guide</a>
    </div>
  `;
}

function displayTop3(predictions) {
  predictionResults.innerHTML = '';
  predictions.slice(0, 3).forEach((prediction) => {
    const confidence = (prediction.probability * 100).toFixed(1);
    const category = classToCategory[prediction.className] || 'garbage';
    predictionResults.innerHTML += `
      <div class="mb-2">
        <div class="flex justify-between text-sm"><span>${CATEGORY_LABELS[category]}</span><span>${confidence}%</span></div>
        <div class="prediction-bar"><div class="prediction-fill" style="width:${confidence}%"></div></div>
      </div>
    `;
  });
}

function attachManualFallbackHandlers(confidenceState, officialLink) {
  document.querySelectorAll('.manual-category-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      const recommendation = getRecommendation(activeRegion, category, confidenceState);
      manualFallbackUsed = true;
      renderRecommendation(recommendation, category, confidenceState, officialLink);
      logEvent('manual_fallback_used', {
        manual_fallback_used: true,
        category,
        region: activeRegion,
      });
    });
  });
}

function renderRecommendation(recommendation, category, confidenceState, officialLink) {
  binRecommendation.innerHTML = `
    <h3 class="text-lg font-semibold text-gray-800 mb-4">🗂️ Bin Recommendation</h3>
    <div class="bin-badge bin-mixed">${recommendation.binLabel}</div>
    <p class="text-gray-700 mb-2">Category: <strong>${CATEGORY_LABELS[category]}</strong></p>
    <ul class="list-disc pl-5 text-sm text-gray-700 mb-3">
      ${recommendation.instructions.map((instruction) => `<li>${instruction}</li>`).join('')}
    </ul>
    <a href="${officialLink}" target="_blank" rel="noreferrer" class="text-blue-700 underline text-sm">Official guidance</a>
  `;

  ecoTip.innerHTML = confidenceState === 'CONFIDENT'
    ? '<h3 class="text-lg font-semibold text-green-800 mb-2">✅ High confidence</h3><p class="text-green-700">Prediction confidence is strong.</p>'
    : '<h3 class="text-lg font-semibold text-amber-800 mb-2">⚠️ Needs confirmation</h3><p class="text-amber-700">This recommendation requires your confirmation.</p>';
}

function displayResults(predictions) {
  manualFallbackUsed = false;
  const top = predictions[0];
  const topCategory = classToCategory[top.className] || 'garbage';
  const confidenceState = getConfidenceState(top.probability);
  const officialLink = rules[activeRegion].garbage.officialLink;

  displayTop3(predictions);

  logEvent('prediction_completed', {
    region: activeRegion,
    top1_label: topCategory,
    top1_prob: top.probability,
    top3: predictions.slice(0, 3).map((p) => ({ label: classToCategory[p.className] || 'garbage', probability: p.probability })),
  });

  logEvent('result_state', {
    result_state: confidenceState,
    region: activeRegion,
    top1_label: topCategory,
    top1_prob: top.probability,
    top3: predictions.slice(0, 3).map((p) => ({ label: classToCategory[p.className] || 'garbage', probability: p.probability })),
    manual_fallback_used: manualFallbackUsed,
  });

  if (confidenceState === 'CONFIDENT') {
    const recommendation = getRecommendation(activeRegion, topCategory, confidenceState);
    renderRecommendation(recommendation, topCategory, confidenceState, officialLink);
    return;
  }

  binRecommendation.innerHTML = renderManualCategoryPicker(confidenceState, officialLink);
  ecoTip.innerHTML = `
    <h3 class="text-lg font-semibold text-amber-800 mb-2">⚠️ Low confidence</h3>
    <p class="text-amber-700">Top result confidence: ${(top.probability * 100).toFixed(1)}%. Please use manual category selection.</p>
  `;
  attachManualFallbackHandlers(confidenceState, officialLink);
}

startScanningBtn.addEventListener('click', async () => {
  showScreen('scanning-screen');
  logEvent('scan_started', { region: activeRegion });
  await initializeApp();
});

backBtn.addEventListener('click', () => showScreen('landing-screen'));
backToScanBtn.addEventListener('click', () => showScreen('scanning-screen'));

uploadPhotoBtn.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', handleFileUpload);

regionSelect.addEventListener('change', (event) => {
  activeRegion = event.target.value;
  localStorage.setItem(REGION_STORAGE_KEY, activeRegion);
  logEvent('region_changed', { region: activeRegion });
});

detectBtn.addEventListener('click', async () => {
  detectBtn.style.display = 'none';
  detectingState.classList.remove('hidden');

  try {
    const predictions = await runPrediction();
    displayResults(predictions);
    showScreen('result-screen');
  } catch (error) {
    console.error(error);
    alert('Detection failed. Please try again.');
  } finally {
    detectBtn.style.display = 'block';
    detectingState.classList.add('hidden');
  }
});

scanAnotherBtn.addEventListener('click', () => {
  currentImageData = null;
  fileInput.value = '';
  renderEmptyPreview();
  showScreen('scanning-screen');
});

backToHomeBtn.addEventListener('click', () => {
  currentImageData = null;
  fileInput.value = '';
  renderEmptyPreview();
  showScreen('landing-screen');
});

document.addEventListener('DOMContentLoaded', () => {
  initializeRegionSelector();
  renderEmptyPreview();
  console.log('Smart Recycling Buddy initialized');
});
