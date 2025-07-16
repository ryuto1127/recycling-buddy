// Bin mapping data
const binMapping = {
  "aluminum_food_cans": {
    bin: "Blue Bin ♻️",
    tip: "Rinse aluminum cans before recycling to avoid contamination."
  },
  "aluminum_soda_cans": {
    bin: "Blue Bin ♻️",
    tip: "Rinse aluminum cans before recycling to avoid contamination."
  },
  "cardboard_boxes": {
    bin: "Blue Bin ♻️",
    tip: "Flatten boxes and keep them dry to recycle efficiently."
  },
  "cardboard_packaging": {
    bin: "Blue (clean) ♻️ / Green (soiled) 🥬",
    tip: "Clean cardboard goes in Blue Bin. Food-soiled cardboard (like pizza boxes) goes in Green Bin."
  },
  "glass_beverage_bottles": {
    bin: "Blue Bin ♻️",
    tip: "Rinse glass containers before recycling."
  },
  "glass_cosmetic_containers": {
    bin: "Blue Bin ♻️",
    tip: "Rinse glass containers before recycling."
  },
  "glass_food_jars": {
    bin: "Blue Bin ♻️",
    tip: "Rinse glass containers before recycling."
  },
  "magazines": {
    bin: "Blue Bin ♻️",
    tip: "Paper is highly recyclable—keep it clean and dry."
  },
  "newspaper": {
    bin: "Blue Bin ♻️",
    tip: "Paper is highly recyclable—keep it clean and dry."
  },
  "office_paper": {
    bin: "Blue Bin ♻️",
    tip: "Paper is highly recyclable—keep it clean and dry."
  },
  "paper_cups": {
    bin: "Blue (clean) ♻️ / Green (soiled) 🥬",
    tip: "Clean paper cups go in Blue Bin. Food-soiled cups go in Green Bin. Coffee cups may have lining—rinse or check locally."
  },
  "plastic_cup_lids": {
    bin: "Blue Bin ♻️",
    tip: "Rinse plastic lids before recycling to reduce contamination."
  },
  "plastic_detergent_bottles": {
    bin: "Blue Bin ♻️",
    tip: "Rinse out containers to reduce contamination."
  },
  "plastic_food_containers": {
    bin: "Blue (clean) ♻️ / Black (dirty) 🗑️",
    tip: "Clean containers can be recycled in Blue Bin. Contaminated ones go to Black Bin garbage."
  },
  "plastic_soda_bottles": {
    bin: "Blue Bin ♻️",
    tip: "Rinse out containers to reduce contamination."
  },
  "plastic_water_bottles": {
    bin: "Blue Bin ♻️",
    tip: "Rinse out containers to reduce contamination."
  },
  "steel_food_cans": {
    bin: "Blue Bin ♻️",
    tip: "Steel cans are 100% recyclable—rinse them before binning."
  },
  "coffee_grounds": {
    bin: "Green Bin 🥬",
    tip: "Compost coffee grounds and filters—they enrich soil!"
  },
  "tea_bags": {
    bin: "Green Bin 🥬",
    tip: "Tea bags are compostable and great for your garden."
  },
  "eggshells": {
    bin: "Green Bin 🥬",
    tip: "Eggshells are great for compost—nutrients for your garden."
  },
  "food_waste": {
    bin: "Green Bin 🥬",
    tip: "All food scraps including meat, bones, and dairy go in Green Bin. Banned from garbage since 2015."
  },
  "aerosol_cans": {
    bin: "Black Bin 🗑️",
    tip: "Empty aerosol cans go to garbage unless your local depot accepts empties."
  },
  "clothing": {
    bin: "Black Bin 🗑️ (or donate 👕)",
    tip: "Clothes aren't recyclable curbside—consider donating."
  },
  "disposable_plastic_cutlery": {
    bin: "Black Bin 🗑️",
    tip: "Most plastic cutlery isn't recyclable—try reusable utensils instead!"
  },
  "plastic_trash_bags": {
    bin: "Black Bin 🗑️",
    tip: "Plastic bags clog recycling machinery—dispose in garbage."
  },
  "plastic_straws": {
    bin: "Black Bin 🗑️",
    tip: "Plastic straws are not recyclable—consider reusable alternatives."
  },
  "shoes": {
    bin: "Black Bin 🗑️ (or donate 👟)",
    tip: "Shoes aren't recyclable curbside—donate if wearable."
  },
  "styrofoam_cups": {
    bin: "Black Bin 🗑️",
    tip: "Styrofoam is not recyclable—consider using reusable containers."
  },
  "styrofoam_food_containers": {
    bin: "Black Bin 🗑️",
    tip: "Styrofoam is not recyclable—consider using reusable containers."
  }
};

// Global variables
let model, webcam, maxPredictions;
let currentImageData = null;
let isModelLoaded = false;

// DOM elements
const landingScreen = document.getElementById('landing-screen');
const scanningScreen = document.getElementById('scanning-screen');
const resultScreen = document.getElementById('result-screen');
const startScanningBtn = document.getElementById('start-scanning-btn');
const backBtn = document.getElementById('back-btn');
const detectBtn = document.getElementById('detect-btn');
const fileInput = document.getElementById('file-input');
const webcamContainer = document.getElementById('webcam-container');
const webcamPlaceholder = document.getElementById('webcam-placeholder');
const detectingState = document.getElementById('detecting-state');
const predictionResults = document.getElementById('prediction-results');
const binRecommendation = document.getElementById('bin-recommendation');
const ecoTip = document.getElementById('eco-tip');
const scanAnotherBtn = document.getElementById('scan-another-btn');
const backToHomeBtn = document.getElementById('back-to-home-btn');
const backToScanBtn = document.getElementById('back-to-scan-btn');

// Screen management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Initialize the app
async function initializeApp() {
    try {
        // Load the model from Teachable Machine
        const URL = "https://teachablemachine.withgoogle.com/models/QFClfelrW/";
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        isModelLoaded = true;
        
        console.log('Model loaded successfully');
        console.log('Number of classes:', maxPredictions);
        
        // Setup webcam
        await setupWebcam();
        
    } catch (error) {
        console.error('Error loading model:', error);
        // Show error message and enable demo mode
        webcamPlaceholder.innerHTML = `
            <div class="text-center">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <p class="text-red-600 font-medium">Model loading error</p>
                <p class="text-sm text-gray-500 mt-2">Please check your internet connection and try again</p>
            </div>
        `;
        // Enable demo mode as fallback
        createDemoMode();
    }
}

// Setup webcam
async function setupWebcam() {
  async function setupWebcam() {
    try {
      const flip = false;  // 外カメなら反転不要
  
      // まず「裏面カメラだけ」にトライ
      try {
        await webcam.setup({
          video: { facingMode: { exact: "environment" } }, 
          audio: false
        });
      } catch (e1) {
        console.warn("裏面カメ指定で失敗したので前面カメで再トライ:", e1);
        // 裏面がダメなら制約なしで getUserMedia
        await webcam.setup({ video: true, audio: false });
      }
  
      await webcam.play();
      webcamPlaceholder.style.display = "none";
      webcamContainer.appendChild(webcam.canvas);
      detectBtn.disabled = false;
      window.requestAnimationFrame(loop);
  
    } catch (err) {
      console.error("Error setting up webcam:", err);
      // ここに来たら完全にカメラ非対応とみなしてフォールバック描画
      webcamPlaceholder.innerHTML = `
        <div class="text-center">
          <p class="text-yellow-600 font-medium">Camera not available</p>
          <p class="text-sm text-gray-500 mt-2">Please use photo upload instead</p>
        </div>`;
    }
  }
}

// Webcam loop
async function loop() {
    if (webcam) {
        webcam.update();
        window.requestAnimationFrame(loop);
    }
}

// Handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // Create canvas and draw image
                const canvas = document.createElement('canvas');
                canvas.width = 300;
                canvas.height = 300;
                const ctx = canvas.getContext('2d');
                
                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Draw image centered and scaled
                const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                const x = (canvas.width / 2) - (img.width / 2) * scale;
                const y = (canvas.height / 2) - (img.height / 2) * scale;
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                
                // Replace webcam view with uploaded image
                webcamContainer.innerHTML = '';
                webcamContainer.appendChild(canvas);
                currentImageData = canvas;
                
                // Enable detect button
                detectBtn.disabled = false;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Create demo mode for when model fails to load
function createDemoMode() {
    isModelLoaded = false;
    maxPredictions = Object.keys(binMapping).length;
    
    // Enable detect button for demo
    detectBtn.disabled = false;
}

// Get demo prediction (fallback when model doesn't load)
function getDemoPrediction() {
    const demoClasses = Object.keys(binMapping);
    const randomClass = demoClasses[Math.floor(Math.random() * demoClasses.length)];
    
    return [{
        className: randomClass,
        probability: 0.85 + Math.random() * 0.15
    }];
}

// Run prediction
async function runPrediction() {
    try {
        let imageElement;
        
        if (currentImageData) {
            // Use uploaded image
            imageElement = currentImageData;
        } else if (webcam && webcam.canvas) {
            // Use webcam
            imageElement = webcam.canvas;
        } else {
            throw new Error('No image available for prediction');
        }
        
        let predictions;
        
        if (isModelLoaded && model) {
            // Use real model
            predictions = await model.predict(imageElement);
        } else {
            // Use demo predictions
            predictions = getDemoPrediction();
        }
        
        // Sort predictions by probability
        predictions.sort((a, b) => b.probability - a.probability);
        
        return predictions;
        
    } catch (error) {
        console.error('Error running prediction:', error);
        // Return demo prediction as fallback
        return getDemoPrediction();
    }
}

// Display results
function displayResults(predictions) {
    // Clear previous results
    predictionResults.innerHTML = '';
    binRecommendation.innerHTML = '';
    ecoTip.innerHTML = '';
    
    // Display top predictions
    const topPredictions = predictions.slice(0, 3);
    topPredictions.forEach(prediction => {
        const confidence = (prediction.probability * 100).toFixed(1);
        const predictionDiv = document.createElement('div');
        predictionDiv.className = 'flex justify-between items-center';
        predictionDiv.innerHTML = `
            <span class="font-medium text-gray-800">${prediction.className.replace(/_/g, ' ')}</span>
            <span class="text-sm text-gray-600">${confidence}%</span>
        `;
        
        // Add confidence bar
        const barDiv = document.createElement('div');
        barDiv.className = 'prediction-bar';
        barDiv.innerHTML = `<div class="prediction-fill" style="width: ${confidence}%"></div>`;
        
        const containerDiv = document.createElement('div');
        containerDiv.appendChild(predictionDiv);
        containerDiv.appendChild(barDiv);
        
        predictionResults.appendChild(containerDiv);
    });
    
    // Get bin recommendation for top prediction
    const topPrediction = predictions[0];
    const binInfo = binMapping[topPrediction.className];
    
    if (binInfo) {
        // Display bin recommendation
        const binClass = getBinClass(binInfo.bin);
        binRecommendation.innerHTML = `
            <h3 class="text-lg font-semibold text-gray-800 mb-4">🗂️ Bin Recommendation</h3>
            <div class="bin-badge ${binClass}">
                ${binInfo.bin}
            </div>
            <p class="text-gray-600">Place this item in the <strong>${binInfo.bin}</strong> for proper disposal.</p>
        `;
        
        // Display eco tip
        ecoTip.innerHTML = `
            <h3 class="text-lg font-semibold text-green-800 mb-4">💡 Eco Tip</h3>
            <p class="text-green-700">${binInfo.tip}</p>
        `;
    } else {
        // Fallback for unknown items
        binRecommendation.innerHTML = `
            <h3 class="text-lg font-semibold text-gray-800 mb-4">🗂️ Bin Recommendation</h3>
            <div class="bin-badge bin-garbage">
                Garbage 🗑️
            </div>
            <p class="text-gray-600">When in doubt, place this item in the <strong>Garbage 🗑️</strong>.</p>
        `;
        
        ecoTip.innerHTML = `
            <h3 class="text-lg font-semibold text-green-800 mb-4">💡 Eco Tip</h3>
            <p class="text-green-700">When unsure about recycling, it's better to throw items in the garbage than to contaminate the recycling stream.</p>
        `;
    }
}

// Get CSS class for bin type
function getBinClass(binText) {
    if (binText.includes('Blue')) return 'bin-blue';
    if (binText.includes('Green')) return 'bin-green';
  if (binText.includes('Black')) return 'bin-garbage';
    return 'bin-mixed';
}

// Get clear bin color text
function getBinColorText(binText) {
    if (binText.includes('Blue')) return 'Blue Recycling Bin';
    if (binText.includes('Green')) return 'Green Compost Bin';
    if (binText.includes('Garbage')) return 'Black/Gray Garbage Bin';
    if (binText.includes('Blue') && binText.includes('Green')) return 'Blue Bin (if clean) or Green Bin (if soiled)';
    return 'Appropriate Bin';
}

// Get border class for bin type
function getBorderClass(binText) {
    if (binText.includes('Blue')) return 'border-blue-500';
    if (binText.includes('Green')) return 'border-green-500';
    if (binText.includes('Garbage')) return 'border-gray-500';
    return 'border-purple-500';
}

// Get detailed bin instructions
function getDetailedBinInstructions(binText) {
    if (binText.includes('Blue') && binText.includes('Green')) {
    return 'If the item is clean and dry, use the Blue Bin (Recycling). If it\'s food-soiled, use the Green Bin (Organics).';
  }
  if (binText.includes('Blue') && binText.includes('Black')) {
    return 'If the item is clean, use the Blue Bin (Recycling). If it\'s dirty or contaminated, use the Black Bin (Garbage).';
    }
    if (binText.includes('Blue')) {
    return 'Place this recyclable item in your Blue Bin. Managed by Recycle BC and collected curbside. Make sure it\'s clean and dry.';
    }
    if (binText.includes('Green')) {
    return 'This organic waste belongs in your Green Bin where it will be composted. Food scraps and yard waste have been banned from garbage since 2015.';
    }
  if (binText.includes('Black')) {
        if (binText.includes('donate')) {
      return 'This item goes in the Black Bin (garbage), but consider donating if it\'s still in good condition.';
        }
    return 'Place this item in your Black Bin for proper disposal.';
    }
    return 'Follow your local waste management guidelines for this item.';
}
// Event listeners
startScanningBtn.addEventListener('click', () => {
    showScreen('scanning-screen');
    initializeApp();
});

backBtn.addEventListener('click', () => {
    showScreen('landing-screen');
});

backToScanBtn.addEventListener('click', () => {
    showScreen('scanning-screen');
});

fileInput.addEventListener('change', handleFileUpload);

detectBtn.addEventListener('click', async () => {
    // Show loading state
    detectBtn.style.display = 'none';
    detectingState.classList.remove('hidden');
    
    try {
        // Run prediction
        const predictions = await runPrediction();
        
        // Display results
        displayResults(predictions);
        
        // Show results screen
        showScreen('result-screen');
        
    } catch (error) {
        console.error('Error during detection:', error);
        alert('Detection failed. Please try again.');
    } finally {
        // Hide loading state
        detectBtn.style.display = 'block';
        detectingState.classList.add('hidden');
    }
});

scanAnotherBtn.addEventListener('click', () => {
    // Reset current image
    currentImageData = null;
    
    // Reset file input
    fileInput.value = '';
    
    // Go back to scanning screen
    showScreen('scanning-screen');
});

backToHomeBtn.addEventListener('click', () => {
    // Reset everything
    currentImageData = null;
    fileInput.value = '';
    
    // Go back to landing screen
    showScreen('landing-screen');
});

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Smart Recycling Buddy initialized');
});