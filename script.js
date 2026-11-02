/* ============================================================
   ELEMENT REFERENCES
   Gets the main HTML and SVG elements.
   ============================================================ */

const player =
    document.getElementById("player");

const path =
    document.getElementById("groundPath");

const groundCanvas = document.getElementById("groundCanvas");
const groundContext = groundCanvas.getContext("2d");

const fallVeil =
    document.getElementById("fallVeil");

const world =
    document.getElementById("world");

const sceneOverlay =
    document.getElementById("sceneOverlay");
const worldOverlay =
    document.getElementById("worldOverlay");
const settingIntro = document.getElementById("settingIntro");

function showSettingIntro(text) {
    settingIntro.textContent = text;
    settingIntro.hidden = false;
    settingIntro.classList.remove("is-visible");
    void settingIntro.offsetWidth;
    settingIntro.classList.add("is-visible");
}

let adventurePortalWorldX = 0;
let portalGlowGradient = null;
let portalGlowGradientKey = "";
const portalCloudDotGroups = Array.from({ length: 4 }, () => []);
let portalCloudParticles = [];
let portalCloudBuilt = false;
const mouseRepelRadius = 155;

function updateMouseRepulsion(particle, baseX, baseY, mouseWorldX, dt, strength = 1, active = mouseInside) {
    if (active) {
        const dx = baseX + particle.offsetX - mouseWorldX;
        const dy = baseY + particle.offsetY - mouseY;
        if (Math.abs(dx) < mouseRepelRadius && Math.abs(dy) < mouseRepelRadius) {
            const distance = Math.hypot(dx, dy);
            if (distance < mouseRepelRadius) {
                const proximity = 1 - distance / mouseRepelRadius;
                registerParticleMotionSound(proximity * strength, -1);
                const angle = distance > .01 ? Math.atan2(dy, dx) : (particle.phase || 0);
                const force = proximity * 5200 * strength;
                particle.velocityX += Math.cos(angle) * force * dt;
                particle.velocityY += Math.sin(angle) * force * dt;
            }
        }
    }
    particle.velocityX += (-particle.offsetX * 26 - particle.velocityX * 5.5) * dt;
    particle.velocityY += (-particle.offsetY * 26 - particle.velocityY * 5.5) * dt;
    particle.offsetX += particle.velocityX * dt;
    particle.offsetY += particle.velocityY * dt;
}

// The old camera-follow transform made the overlay drift with the player.
// Clear any transform left on a live element and keep it viewport-rooted.
sceneOverlay.style.setProperty("position", "fixed", "important");
sceneOverlay.style.setProperty("transform", "none", "important");

settingIntro.addEventListener("animationend", (event) => {
    if (event.animationName === "settingIntro") {
        settingIntro.hidden = true;
        settingIntro.classList.remove("is-visible");
    }
});

const particleCanvas =
    document.getElementById("particleCanvas");

const particleContext =
    particleCanvas.getContext("2d");

const redHandCanvas = document.getElementById("redHandCanvas");
const redHandContext = redHandCanvas.getContext("2d");
const redFoodHeadline = document.getElementById("redFoodHeadline");
const redFoodBlank = redFoodHeadline.querySelector(".red-food-blank");
const postFoodMarketScene = document.getElementById("postFoodMarketScene");
const postFoodMarketCarousel = document.getElementById("postFoodMarketCarousel");
const postFoodMarketScrollHint = document.getElementById("postFoodMarketScrollHint");
const postFoodMarketCredits = document.getElementById("postFoodMarketCredits");
const postFoodMarketCreditsCanvas = document.getElementById("postFoodMarketCreditsCanvas");
const postFoodMarketCreditsHint = document.getElementById("postFoodMarketCreditsHint");
const postFoodMarketCreditsContext = postFoodMarketCreditsCanvas.getContext("2d");
const postFoodMarketScrollAudio = new Audio("Ambiance/Scroll.mp3");
postFoodMarketScrollAudio.preload = "auto";
postFoodMarketScrollAudio.volume = .18;
let postFoodMarketScrollAudioCutoff = 0;
const postFoodMarketCreditLines = [
    "POST Logo Redesign + Interactive Project by Roy Huang",
    "Design Work by Roy Huang",
    "Images Taken from https://www.posthtx.com",
    "Coding Work by Codex",
    "Fonts Used: Cawu",
    "Royalty Free Music and Sound Effects Taken From Pixabay, Freesound, and Youtube"
];
const postFoodMarketCategories = [
    { restaurant: "2 Phat Bastard Pies", category: "AFRICAN SOUL", tags: ["South African"], image: "Food Scroller/2 Phat Bastard Pies.png", label: "South African", region: "south-africa" },
    { restaurant: "The Funnel Cake House & Cajun Corner", category: "AFRICAN SOUL", tags: ["Cajun", "Seafood", "Southern", "Dessert"], image: "Food Scroller/The Funnel Cake House & Cajun Corner.png", label: "Cajun · Seafood · Southern · Dessert", region: "united-states" },
    { restaurant: "ChòpnBlọk", category: "AFRICAN SOUL", tags: ["Western African"], image: "Food Scroller/Chopn Block.png", label: "Western African", region: "west-africa" },
    { restaurant: "Andres Cafe", category: "LATIN FLAVOR", tags: ["Latin American", "Seafood"], image: "Food Scroller/Andes Cafe.png", label: "Latin American · Seafood", region: "latin-america" },
    { restaurant: "Taco Fuego", category: "LATIN FLAVOR", tags: ["Latin American", "Taco"], image: "Food Scroller/Taco Fuego.png", label: "Latin American · Taco", region: "latin-america" },
    { restaurant: "Elotex Cup", category: "LATIN FLAVOR", tags: ["Mexican", "Snack"], image: "Food Scroller/Elotex Cup.png", label: "Mexican · Snack", region: "mexico" },
    { restaurant: "Foreign Grill", category: "ASIAN KITCHEN", tags: ["Central Asian", "European", "Uzbek"], image: "Food Scroller/Foreign Grill.png", label: "Central Asian · European · Uzbek", region: "uzbekistan" },
    { restaurant: "Phở Lạc Việt", category: "ASIAN KITCHEN", tags: ["Vietnamese", "Pho", "Asian"], image: "Food Scroller/Pho Lac Viet.png", label: "Vietnamese · Pho · Asian", region: "vietnam" },
    { restaurant: "Nikubol", category: "ASIAN KITCHEN", tags: ["Japanese", "Asian"], image: "Food Scroller/Nikubol.png", label: "Japanese · Asian", region: "japan" },
    { restaurant: "KWO Sushi", category: "ASIAN KITCHEN", tags: ["Japanese", "Asian"], image: "Food Scroller/KWO Sushi.png", label: "Japanese · Asian", region: "japan" },
    { restaurant: "Soy Pinoy", category: "ASIAN KITCHEN", tags: ["Filipino", "Asian"], image: "Food Scroller/Soy Pinoy.png", label: "Filipino · Asian", region: "philippines" },
    { restaurant: "Ice Ice Boba", category: "ASIAN KITCHEN", tags: ["Tea", "Bubble", "Dessert"], image: "Food Scroller/Ice Ice Boba.png", label: "Tea · Bubble · Dessert" },
    { restaurant: "Bowl'd Masala", category: "ASIAN KITCHEN", tags: ["Indian"], image: "Food Scroller/Bowl'd Masala.png", label: "Indian", region: "india" },
    { restaurant: "Rice Wok", category: "ASIAN KITCHEN", tags: ["Asian", "Chinese"], image: "Food Scroller/Rice Wok.png", label: "Asian · Chinese", region: "china" },
    { restaurant: "Thai Kun", category: "ASIAN KITCHEN", tags: ["Thai", "Asian"], image: "Food Scroller/Thai Kun.png", label: "Thai · Asian", region: "thailand" },
    { restaurant: "Pistachio's Coffee", category: "HEALTHY ENERGY", tags: ["Coffee"], image: "Food Scroller/Pistachio's Coffee.png", label: "Coffee" },
    { restaurant: "Thrive Juices", category: "HEALTHY ENERGY", tags: ["Juice", "Dessert"], image: "Food Scroller/Thrive Juices.png", label: "Juice · Dessert" },
    { restaurant: "Shakkar Bakery", category: "SWEET & TREATS", tags: ["Bakery", "Dessert"], image: "Food Scroller/Shakkaar Bakery.png", label: "Bakery · Dessert" },
    { restaurant: "The Paleta Bar", category: "SWEET & TREATS", tags: ["Dessert"], image: "Food Scroller/The Paleta Bar.png", label: "Dessert", region: "latin-america" },
    { restaurant: "Flower and Cream", category: "SWEET & TREATS", tags: ["Ice Cream", "Dessert"], image: "Food Scroller/Flower and Cream.png", label: "Ice Cream · Dessert" },
    { restaurant: "Gelu Italian Ice", category: "SWEET & TREATS", tags: ["Dessert"], image: "Food Scroller/Gelu Italian Ice.png", label: "Dessert" },
    { restaurant: "Myoa Cookies", category: "SWEET & TREATS", tags: ["Dessert", "Backery"], image: "Food Scroller/Myoa Cookies.png", label: "Dessert · Backery" },
    { restaurant: "Return To Sender", category: "CHEERS!", tags: ["Bar"], image: "Food Scroller/Return to Sender.png?v=2", label: "Bar" },
    { restaurant: "Hot Tater Diner", category: "AMERICAN CLASSICS", tags: ["Cajun", "Southern"], image: "Food Scroller/Hot Tater Dinner.png", label: "Cajun · Southern", region: "united-states" },
    { restaurant: "Johnny Good Burger", category: "AMERICAN CLASSICS", tags: ["American", "Burger"], image: "Food Scroller/Johnny Good Burger.png", label: "American · Burger", region: "united-states" },
    { restaurant: "YoYo's Hot Dog", category: "AMERICAN CLASSICS", tags: ["Hot Dog"], image: "Food Scroller/YoYo's Hot Dog.png", label: "Hot Dog", region: "united-states" },
    { restaurant: "Lea Jane's Hot Chicken", category: "AMERICAN CLASSICS", tags: ["Fried Chicken", "Sandwich", "Southern"], image: "Food Scroller/Lea Jane's Hot Chicken.png", label: "Fried Chicken · Sandwich · Southern", region: "united-states" },
    { restaurant: "Mamma Tommato Pizza", category: "AMERICAN CLASSICS", tags: ["Pizza"], image: "Food Scroller/Mamma Tommato Pizza.png", label: "Pizza", region: "united-states" },
    { restaurant: "Ciccio's Pasta", category: "AMERICAN CLASSICS", tags: ["Italian"], image: "Food Scroller/Ciccio's Pasta.png", label: "Italian", region: "united-states" },
    { restaurant: "Twisted Grilled Cheese", category: "AMERICAN CLASSICS", tags: ["American", "Sandwich"], image: "Food Scroller/Twisted Grilled Cheese.png", label: "American · Sandwich", region: "united-states" },
];
const postFoodMarketFeatureImage = document.getElementById("postFoodMarketFeatureImage");
const postFoodMarketRestaurantName = document.getElementById("postFoodMarketRestaurantName");
const postFoodMarketFeatureLabel = document.getElementById("postFoodMarketFeatureLabel");
const postFoodMarketMapHighlightLeft = document.getElementById("postFoodMarketMapHighlightLeft");
const postFoodMarketMapHighlightRight = document.getElementById("postFoodMarketMapHighlightRight");
const postFoodMarketPrevious = document.getElementById("postFoodMarketPrevious");
const postFoodMarketCurrent = document.getElementById("postFoodMarketCurrent");
const postFoodMarketNext = document.getElementById("postFoodMarketNext");
const postFoodMarketCategoryRow = document.querySelector(".post-food-market-category-row");
let postFoodMarketCategoryIndex = 0;
let postFoodMarketLastScrollAt = 0;
let postFoodMarketSlideTimer = 0;
let postFoodMarketExploreRevealed = false;
const postFoodMarketCroppedImages = new Map();
let postFoodMarketCreditsActive = false;
let postFoodMarketCreditLineCount = 0;
let postFoodMarketCreditGroups = [];
let postFoodMarketCreditAmbient = [];
let postFoodMarketCreditFrame = 0;
let postFoodMarketCreditLastTime = 0;
let postFoodMarketCreditCanvasWidth = 0;
let postFoodMarketCreditCanvasHeight = 0;
let postFoodMarketCreditsAmbienceAudio = null;

function startPostFoodMarketCreditsAmbience() {
    if (postFoodMarketCreditsAmbienceAudio) return;
    const audio = new Audio("Ambiance/Ethereal Ambiance.mp3");
    audio.loop = true;
    audio.volume = 0;
    postFoodMarketCreditsAmbienceAudio = audio;
    audio.play().then(() => {
        if (postFoodMarketCreditsAmbienceAudio !== audio) {
            audio.pause();
            return;
        }
        fadeOpeningAmbience(audio, .004, 1800);
    }).catch(() => {});
}

function stopPostFoodMarketCreditsAmbience() {
    const audio = postFoodMarketCreditsAmbienceAudio;
    if (!audio) return;
    postFoodMarketCreditsAmbienceAudio = null;
    fadeOpeningAmbience(audio, 0, 700, () => audio.pause());
}

function resizePostFoodMarketCreditsCanvas() {
    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.ceil(window.innerWidth * scale));
    const height = Math.max(1, Math.ceil(window.innerHeight * scale));
    if (postFoodMarketCreditsCanvas.width === width && postFoodMarketCreditsCanvas.height === height) return;
    postFoodMarketCreditsCanvas.width = width;
    postFoodMarketCreditsCanvas.height = height;
    postFoodMarketCreditsContext.setTransform(scale, 0, 0, scale, 0, 0);
    postFoodMarketCreditCanvasWidth = window.innerWidth;
    postFoodMarketCreditCanvasHeight = window.innerHeight;
    const creditDotSizes = [1.8, 2.7, 2.1, 3.4, 2.3, 3, 1.9, 2.5];
    const creditBluePalette = ["#35aaff", "#56c8ff", "#83e4ff", "#3989e8"];
    postFoodMarketCreditAmbient = Array.from({ length: 420 }, (_, index) => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - .5) * 5,
        vy: (Math.random() - .5) * 4,
        offsetX: 0,
        offsetY: 0,
        velocityX: 0,
        velocityY: 0,
        r: 1.2 + Math.random() * 1.1,
        color: creditBluePalette[index % creditBluePalette.length],
        alpha: .18 + Math.random() * .24,
        phase: Math.random() * Math.PI * 2
    }));
    postFoodMarketCreditGroups = postFoodMarketCreditGroups.map((group, index) =>
        makePostFoodMarketCreditGroup(group.text, index)
    );
}

function makePostFoodMarketCreditGroup(text, lineIndex) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const work = document.createElement("canvas");
    work.width = Math.ceil(width);
    work.height = Math.ceil(height);
    const context = work.getContext("2d", { willReadFrequently: true });
    let fontSize = Math.min(44, Math.max(18, width * .045), height * .065);
    const maxWidth = width * .84;
    const fontFamily = getComputedStyle(document.body).fontFamily || "sans-serif";
    context.font = `650 ${fontSize}px ${fontFamily}`;
    const measureCreditLine = line => {
        const characters = [...line];
        const letterGap = Math.max(.8, fontSize * .035);
        return characters.reduce((sum, character) => sum + context.measureText(character).width, 0) +
            Math.max(0, characters.length - 1) * letterGap;
    };
    while (measureCreditLine(text) > maxWidth && fontSize > 18) {
        fontSize -= 1;
        context.font = `650 ${fontSize}px ${fontFamily}`;
    }
    // Wrap at word boundaries. Do not pass maxWidth to fillText: that scales
    // long sentences horizontally and makes the particle lettering unreadable.
    const lines = [];
    let currentLine = "";
    for (const word of text.split(/\s+/)) {
        const candidate = currentLine ? `${currentLine} ${word}` : word;
        if (currentLine && measureCreditLine(candidate) > maxWidth) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = candidate;
        }
    }
    if (currentLine) lines.push(currentLine);
    const lineHeight = fontSize * 1.2;
    const blockHeight = lines.length * lineHeight;
    const lastCreditIndex = Math.max(1, postFoodMarketCreditLines.length - 1);
    // Keep even wrapped credits inside the viewport; the last line is long
    // enough to wrap on shorter windows, so reserve extra room below it.
    const centerY = height * (.1 + lineIndex * (.72 / lastCreditIndex));
    context.font = `650 ${fontSize}px ${fontFamily}`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#fff";
    lines.forEach((line, index) => {
        const characters = [...line];
        const letterGap = Math.max(.8, fontSize * .035);
        const lineWidth = measureCreditLine(line);
        let x = (width - lineWidth) / 2;
        const y = centerY - blockHeight / 2 + lineHeight * (index + .5);
        context.textAlign = "left";
        for (const character of characters) {
            context.fillText(character, x, y);
            x += context.measureText(character).width + letterGap;
        }
    });
    const pixels = context.getImageData(0, 0, work.width, work.height).data;
    // Tighter sampling fills thin strokes and keeps each glyph readable.
    const spacing = 3;
    const dotSizes = [1.45, 1.7, 1.9, 2.1];
    const textWidth = Math.min(maxWidth, Math.max(...lines.map(measureCreditLine)) + fontSize * .45);
    const textHeight = blockHeight + fontSize * .3;
    const left = Math.max(0, Math.floor((width - textWidth) / 2));
    const right = Math.min(work.width, Math.ceil((width + textWidth) / 2));
    const top = Math.max(0, Math.floor(centerY - textHeight / 2));
    const bottom = Math.min(work.height, Math.ceil(centerY + textHeight / 2));
    const targets = [];
    for (let y = top; y < bottom; y += spacing) {
        for (let x = left; x < right; x += spacing) {
            if (pixels[(y * work.width + x) * 4 + 3] > 80) {
                const edge = Math.floor(Math.random() * 4);
                targets.push({
                    x, y,
                    sx: edge === 0 ? -8 : edge === 1 ? width + 8 : Math.random() * width,
                    sy: edge === 2 ? -8 : edge === 3 ? height + 8 : Math.random() * height,
                    delay: Math.random() * 420,
                    radius: dotSizes[targets.length % dotSizes.length],
                    color: `hsl(${201 + (x / width) * 18 + (Math.random() - .5) * 6}, ${84 + Math.random() * 12}%, ${63 + Math.random() * 13}%)`,
                    offsetX: 0,
                    offsetY: 0,
                    velocityX: 0,
                    velocityY: 0,
                    phase: Math.random() * Math.PI * 2
                });
            }
        }
    }
    return { text, born: performance.now(), points: targets, dissolveAt: 0 };
}

function startPostFoodMarketCredits() {
    postFoodMarketCreditsActive = true;
    postFoodMarketCreditLineCount = 0;
    postFoodMarketCreditGroups = [];
    postFoodMarketScene.classList.add("showing-credits");
    postFoodMarketCredits.setAttribute("aria-hidden", "false");
    postFoodMarketCreditsHint.textContent = "SCROLL ↓";
    resizePostFoodMarketCreditsCanvas();
    startPostFoodMarketCreditsAmbience();
    if (!postFoodMarketCreditFrame) postFoodMarketCreditFrame = requestAnimationFrame(drawPostFoodMarketCredits);
}

function stopPostFoodMarketCredits() {
    postFoodMarketCreditsActive = false;
    stopPostFoodMarketCreditsAmbience();
    postFoodMarketScene.classList.remove("showing-credits");
    postFoodMarketCredits.setAttribute("aria-hidden", "true");
    postFoodMarketScrollHint.textContent = "SCROLL ↓";
    postFoodMarketScrollHint.classList.remove("is-dismissed");
    postFoodMarketScrollHint.setAttribute("aria-hidden", "false");
}

function drawPostFoodMarketCredits(now) {
    postFoodMarketCreditFrame = 0;
    if (!postFoodMarketCreditsActive || postFoodMarketScene.hidden) return;
    if (postFoodMarketCreditCanvasWidth !== window.innerWidth || postFoodMarketCreditCanvasHeight !== window.innerHeight) {
        resizePostFoodMarketCreditsCanvas();
    }
    const dt = Math.min(.04, Math.max(0, (now - (postFoodMarketCreditLastTime || now)) / 1000));
    postFoodMarketCreditLastTime = now;
    const context = postFoodMarketCreditsContext;
    const width = window.innerWidth;
    const height = window.innerHeight;
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#05080c";
    context.fillRect(0, 0, width, height);
    for (const p of postFoodMarketCreditAmbient) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -5) p.x = width + 5;
        if (p.x > width + 5) p.x = -5;
        if (p.y < -5) p.y = height + 5;
        if (p.y > height + 5) p.y = -5;
        updateMouseRepulsion(p, p.x, p.y, mouseX, dt, .1, mouseInside);
        const shimmer = .72 + Math.sin(now * .0014 + p.phase) * .28;
        context.globalAlpha = p.alpha * shimmer;
        context.fillStyle = p.color;
        context.beginPath();
        context.arc(p.x + p.offsetX, p.y + p.offsetY, p.r, 0, Math.PI * 2);
        context.fill();
    }
    context.globalAlpha = 1;
    const alive = [];
    for (const group of postFoodMarketCreditGroups) {
        const age = now - group.born;
        const dissolving = group.dissolveAt > 0;
        const dissolveProgress = dissolving ? Math.min(1, (now - group.dissolveAt) / 600) : 0;
        for (const p of group.points) {
            const progress = Math.max(0, Math.min(1, (age - p.delay) / 1050));
            const eased = 1 - Math.pow(1 - progress, 3);
            const baseX = p.sx + (p.x - p.sx) * eased;
            const baseY = p.sy + (p.y - p.sy) * eased;
            updateMouseRepulsion(p, baseX, baseY, mouseX, dt, .015, mouseInside);
            if (progress < 1) registerParticleMotionSound(.72 * (1 - progress), 1);
            if (dissolving) registerParticleMotionSound(.45 * (1 - dissolveProgress), -1);
            const x = baseX + p.offsetX;
            const y = baseY + p.offsetY;
            context.globalAlpha = (dissolving ? 1 - dissolveProgress : .94 + Math.sin(now * .002 + p.phase) * .06);
            context.fillStyle = p.color;
            context.beginPath();
            context.arc(x, y, p.radius, 0, Math.PI * 2);
            context.fill();
        }
        if (!dissolving || dissolveProgress < 1) alive.push(group);
    }
    postFoodMarketCreditGroups = alive;
    context.globalAlpha = 1;
    if (postFoodMarketCreditsActive) postFoodMarketCreditFrame = requestAnimationFrame(drawPostFoodMarketCredits);
}

function cropFoodPhotoBorders(source) {
    if (postFoodMarketFeatureImage.dataset.marketImageSource === source) return;
    postFoodMarketFeatureImage.onload = null;
    postFoodMarketFeatureImage.dataset.marketImageSource = source;

    const cached = postFoodMarketCroppedImages.get(source);
    if (cached) {
        postFoodMarketFeatureImage.src = cached;
        return;
    }

    postFoodMarketFeatureImage.onload = () => {
        if (postFoodMarketFeatureImage.dataset.marketImageSource !== source) return;
        postFoodMarketFeatureImage.onload = null;

        try {
            const image = postFoodMarketFeatureImage;
            const width = image.naturalWidth;
            const height = image.naturalHeight;
            if (!width || !height) return;

            // Inspect a reduced copy, then make the final crop at full resolution.
            // The screenshot bars can sit just inside a dark outer edge, so the
            // scan searches a narrow band near each edge instead of only row 0.
            const sampleScale = Math.min(1, 1200 / Math.max(width, height));
            const sampleWidth = Math.max(1, Math.round(width * sampleScale));
            const sampleHeight = Math.max(1, Math.round(height * sampleScale));
            const sample = document.createElement("canvas");
            sample.width = sampleWidth;
            sample.height = sampleHeight;
            const sampleContext = sample.getContext("2d", { willReadFrequently: true });
            sampleContext.drawImage(image, 0, 0, sampleWidth, sampleHeight);
            const pixels = sampleContext.getImageData(0, 0, sampleWidth, sampleHeight).data;

            const isWhite = (offset) => {
                const r = pixels[offset];
                const g = pixels[offset + 1];
                const b = pixels[offset + 2];
                return pixels[offset + 3] > 245 && r > 185 && g > 185 && b > 185 &&
                    Math.max(r, g, b) - Math.min(r, g, b) < 38;
            };
            const findWhiteBarFromEdge = (length, span, horizontal, reverse = false) => {
                const searchLimit = Math.min(72, Math.max(8, Math.ceil(length * .08)));
                let runLength = 0;
                let lastBarDistance = -1;
                let singlePixelBarDistance = -1;
                for (let distance = 0; distance < searchLimit; distance++) {
                    const index = reverse ? length - 1 - distance : distance;
                    let white = 0;
                    for (let p = 0; p < span; p++) {
                        const x = horizontal ? p : index;
                        const y = horizontal ? index : p;
                        const sampleIndex = (y * sampleWidth + x) * 4;
                        if (isWhite(sampleIndex)) white++;
                    }
                    const whiteRatio = white / span;
                    if (whiteRatio >= .92 && singlePixelBarDistance < 0) {
                        singlePixelBarDistance = distance;
                    }
                    if (whiteRatio >= .88) {
                        runLength++;
                        lastBarDistance = distance;
                    } else if (runLength >= 2) {
                        break;
                    } else {
                        runLength = 0;
                        lastBarDistance = -1;
                    }
                }
                // Requiring a short, nearly full-width white band avoids
                // trimming ordinary pale food; accept one exceptionally clean
                // white rule for the thin screenshot borders in these photos.
                if (runLength >= 2) return lastBarDistance + 1;
                return singlePixelBarDistance >= 0 ? singlePixelBarDistance + 1 : 0;
            };

            const top = findWhiteBarFromEdge(sampleHeight, sampleWidth, true);
            const bottom = findWhiteBarFromEdge(sampleHeight, sampleWidth, true, true);
            const left = findWhiteBarFromEdge(sampleWidth, sampleHeight, false);
            const right = findWhiteBarFromEdge(sampleWidth, sampleHeight, false, true);
            const cropLeft = left ? Math.max(0, Math.floor(left / sampleScale) + 1) : 0;
            const cropTop = top ? Math.max(0, Math.floor(top / sampleScale) + 1) : 0;
            const cropRight = right ? Math.max(0, Math.floor(right / sampleScale) + 1) : 0;
            const cropBottom = bottom ? Math.max(0, Math.floor(bottom / sampleScale) + 1) : 0;
            const cropWidth = width - cropLeft - cropRight;
            const cropHeight = height - cropTop - cropBottom;

            if (cropWidth <= 0 || cropHeight <= 0 || (!cropLeft && !cropTop && !cropRight && !cropBottom)) {
                postFoodMarketCroppedImages.set(source, source);
                return;
            }

            const output = document.createElement("canvas");
            output.width = cropWidth;
            output.height = cropHeight;
            output.getContext("2d").drawImage(
                image, cropLeft, cropTop, cropWidth, cropHeight,
                0, 0, cropWidth, cropHeight
            );
            const croppedSource = output.toDataURL("image/png");
            postFoodMarketCroppedImages.set(source, croppedSource);
            if (postFoodMarketFeatureImage.dataset.marketImageSource === source) {
                image.src = croppedSource;
            }
        } catch {
            // Keep the original image if the browser blocks canvas pixel access.
            postFoodMarketCroppedImages.set(source, source);
        }
    };
    postFoodMarketFeatureImage.src = source;
}

function updatePostFoodMarketCategory(direction = 0) {
    const count = postFoodMarketCategories.length;
    const current = postFoodMarketCategories[postFoodMarketCategoryIndex];
    if (direction) {
        window.clearTimeout(postFoodMarketScrollAudioCutoff);
        postFoodMarketScrollAudio.pause();
        postFoodMarketScrollAudio.currentTime = 0;
        postFoodMarketScrollAudio.play().then(() => {
            postFoodMarketScrollAudioCutoff = window.setTimeout(() => {
                postFoodMarketScrollAudio.pause();
                postFoodMarketScrollAudio.currentTime = 0;
                postFoodMarketScrollAudioCutoff = 0;
            }, 160);
        }).catch(() => {});
    }
    const findAdjacentSection = (step) => {
        for (let distance = 1; distance < count; distance++) {
            const index = (postFoodMarketCategoryIndex + step * distance + count) % count;
            const section = postFoodMarketCategories[index].category;
            if (section && section !== current.category) return section;
        }
        return "";
    };

    postFoodMarketPrevious.textContent = findAdjacentSection(-1);
    postFoodMarketCurrent.textContent = current.category || current.name || current.restaurant;
    postFoodMarketNext.textContent = findAdjacentSection(1);
    [
        [postFoodMarketPrevious, postFoodMarketPrevious.textContent],
        [postFoodMarketCurrent, postFoodMarketCurrent.textContent],
        [postFoodMarketNext, postFoodMarketNext.textContent]
    ].forEach(([element, category]) => {
        element.dataset.category = category;
        element.setAttribute("role", "button");
        element.setAttribute("aria-label", category ? `Jump to the first ${category} restaurant` : "");
        element.tabIndex = category ? 0 : -1;
        if (element === postFoodMarketCurrent) element.setAttribute("aria-current", "true");
        else element.removeAttribute("aria-current");
    });
    postFoodMarketRestaurantName.textContent = current.restaurant;
    postFoodMarketFeatureImage.alt = current.restaurant;
    const marketTags = current.tags || [];
    postFoodMarketFeatureLabel.replaceChildren(...marketTags.map(tag => {
        const chip = document.createElement("span");
        chip.className = "post-food-market-tag";
        chip.textContent = `#${tag}`;
        return chip;
    }));
    postFoodMarketFeatureLabel.hidden = marketTags.length === 0;
    const currentRegion = current.category === "AMERICAN CLASSICS"
        ? "united-states"
        : current.region;
    const regionShape = window.POST_MARKET_MAP_REGIONS?.[currentRegion] || "";
    postFoodMarketMapHighlightLeft.setAttribute("d", regionShape);
    postFoodMarketMapHighlightRight.setAttribute("d", regionShape);
    if (current.image) {
        cropFoodPhotoBorders(current.image);
        postFoodMarketFeatureImage.hidden = false;
    } else {
        postFoodMarketFeatureImage.removeAttribute("src");
        delete postFoodMarketFeatureImage.dataset.marketImageSource;
        postFoodMarketFeatureImage.hidden = true;
    }

    postFoodMarketFeatureImage.classList.remove("slide-from-left", "slide-from-right");
    window.clearTimeout(postFoodMarketSlideTimer);
    if (direction && !postFoodMarketFeatureImage.hidden) {
        void postFoodMarketFeatureImage.offsetWidth;
        postFoodMarketFeatureImage.classList.add(
            direction > 0 ? "slide-from-right" : "slide-from-left"
        );
        postFoodMarketSlideTimer = window.setTimeout(() => {
            postFoodMarketFeatureImage.classList.remove("slide-from-left", "slide-from-right");
        }, 460);
    }
}

function jumpToPostFoodMarketCategory(category) {
    if (!category || postFoodMarketCreditsActive) return;
    const firstIndex = postFoodMarketCategories.findIndex(item => item.category === category);
    if (firstIndex < 0) return;
    const direction = category === "AFRICAN SOUL"
        ? -1
        : firstIndex === postFoodMarketCategoryIndex
            ? 0
            : firstIndex > postFoodMarketCategoryIndex ? 1 : -1;
    postFoodMarketExploreRevealed = true;
    postFoodMarketScene.classList.add("has-entered-explore");
    postFoodMarketScrollHint.classList.add("is-dismissed");
    postFoodMarketScrollHint.setAttribute("aria-hidden", "true");
    postFoodMarketCategoryIndex = firstIndex;
    updatePostFoodMarketCategory(direction);
}

postFoodMarketCategoryRow.addEventListener("click", event => {
    const categoryTitle = event.target.closest("[data-category]");
    if (!categoryTitle || !postFoodMarketCategoryRow.contains(categoryTitle)) return;
    jumpToPostFoodMarketCategory(categoryTitle.dataset.category);
});
postFoodMarketCategoryRow.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const categoryTitle = event.target.closest("[data-category]");
    if (!categoryTitle || !postFoodMarketCategoryRow.contains(categoryTitle)) return;
    event.preventDefault();
    jumpToPostFoodMarketCategory(categoryTitle.dataset.category);
});

updatePostFoodMarketCategory();
postFoodMarketScene.addEventListener("wheel", event => {
    if (postFoodMarketScene.hidden) return;
    event.preventDefault();
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta || performance.now() - postFoodMarketLastScrollAt < 320) return;
    if (!postFoodMarketExploreRevealed && delta < 0) return;
    postFoodMarketLastScrollAt = performance.now();
    const direction = delta > 0 ? 1 : -1;
    if (postFoodMarketCreditsActive) {
        if (direction > 0 && postFoodMarketCreditLineCount < postFoodMarketCreditLines.length) {
            const lineIndex = postFoodMarketCreditLineCount++;
            postFoodMarketCreditGroups.push(makePostFoodMarketCreditGroup(postFoodMarketCreditLines[lineIndex], lineIndex));
            postFoodMarketCreditsHint.textContent = "SCROLL ↓";
        } else if (direction < 0 && postFoodMarketCreditLineCount > 0) {
            const removed = postFoodMarketCreditGroups.find(group => group.text === postFoodMarketCreditLines[postFoodMarketCreditLineCount - 1]);
            if (removed) removed.dissolveAt = performance.now();
            postFoodMarketCreditLineCount--;
            postFoodMarketCreditsHint.textContent = "SCROLL ↓";
        } else if (direction < 0) {
            stopPostFoodMarketCredits();
        }
        return;
    }
    if (!postFoodMarketExploreRevealed) {
        postFoodMarketExploreRevealed = true;
        postFoodMarketScene.classList.add("has-entered-explore");
        postFoodMarketScrollHint.textContent = "SCROLL ↓";
        postFoodMarketScrollHint.classList.remove("is-dismissed");
        postFoodMarketScrollHint.setAttribute("aria-hidden", "false");
        return;
    }
    if (direction < 0 && postFoodMarketCategoryIndex === 0) {
        postFoodMarketExploreRevealed = false;
        postFoodMarketScene.classList.remove("has-entered-explore");
        postFoodMarketScrollHint.textContent = "SCROLL ↓";
        postFoodMarketScrollHint.classList.remove("is-dismissed");
        postFoodMarketScrollHint.setAttribute("aria-hidden", "false");
        return;
    }
    const nextCategoryIndex = Math.max(0, Math.min(
        postFoodMarketCategories.length - 1,
        postFoodMarketCategoryIndex + direction
    ));
    if (nextCategoryIndex === postFoodMarketCategoryIndex) {
        if (direction > 0 && postFoodMarketCategoryIndex === postFoodMarketCategories.length - 1) {
            postFoodMarketScrollHint.classList.add("is-dismissed");
            postFoodMarketScrollHint.setAttribute("aria-hidden", "true");
            startPostFoodMarketCredits();
        }
        return;
    }
    postFoodMarketScrollHint.classList.add("is-dismissed");
    postFoodMarketScrollHint.setAttribute("aria-hidden", "true");
    postFoodMarketCategoryIndex = nextCategoryIndex;
    updatePostFoodMarketCategory(direction);
}, { passive: false });
const redFoodNames = ["TACOS", "PHỞ", "PIZZAS", "BURGERS"];
const redFoodGlyphs = "!<>?=+*#%$0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let redFoodGlyphRefreshAt = 0;
let redFoodFallbackCanvas = null;
let redFoodFallbackContext = null;

function resizeRedFoodFallbackCanvas() {
    if (!redFoodFallbackCanvas || !redFoodFallbackContext) return;
    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.ceil(window.innerWidth * scale);
    const height = Math.ceil(window.innerHeight * scale);
    if (redFoodFallbackCanvas.width !== width || redFoodFallbackCanvas.height !== height) {
        redFoodFallbackCanvas.width = width;
        redFoodFallbackCanvas.height = height;
    }
    redFoodFallbackContext.setTransform(scale, 0, 0, scale, 0, 0);
}

function ensureRedFoodFallbackCanvas() {
    if (!redFoodFallbackCanvas) {
        redFoodFallbackCanvas = document.createElement("canvas");
        redFoodFallbackCanvas.id = "redFoodFallbackCanvas";
        Object.assign(redFoodFallbackCanvas.style, {
            position: "fixed",
            inset: "0",
            width: "100vw",
            height: "100vh",
            zIndex: "4",
            pointerEvents: "none"
        });
        document.body.appendChild(redFoodFallbackCanvas);
        redFoodFallbackContext = redFoodFallbackCanvas.getContext("2d");
    }
    resizeRedFoodFallbackCanvas();
    redFoodFallbackCanvas.style.clipPath = `inset(0px 0px ${Math.max(0, window.innerHeight - getGroundY())}px 0px)`;
    redFoodFallbackCanvas.style.display = "block";
    redFoodFallbackContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
}

function resizeRedHandCanvas() {
    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    redHandCanvas.width = Math.ceil(window.innerWidth * scale);
    redHandCanvas.height = Math.ceil(window.innerHeight * scale);
    redHandContext.setTransform(scale, 0, 0, scale, 0, 0);
}




const adventureCanvas =
    document.getElementById("adventureCanvas");

const adventureContext =
    adventureCanvas.getContext("2d");

const cityFormationCanvas =
    document.getElementById("cityFormationCanvas");
const cityFormationContext =
    cityFormationCanvas.getContext("2d");
const cityFormationBitmap = document.createElement("canvas");
cityFormationBitmap.width = 477;
cityFormationBitmap.height = 161;
const cityFormationBitmapContext = cityFormationBitmap.getContext("2d");

function resizeParticleCanvas() {
    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    particleCanvas.width = Math.ceil(window.innerWidth * scale);
    particleCanvas.height = Math.ceil(window.innerHeight * scale);
    particleContext.setTransform(scale, 0, 0, scale, 0, 0);
}

function resizeGroundCanvas() {
    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    groundCanvas.width = Math.ceil(window.innerWidth * scale);
    groundCanvas.height = Math.ceil(window.innerHeight * scale);
    groundContext.setTransform(scale, 0, 0, scale, 0, 0);
}

function resizeAdventureCanvas() {
    const scale = 1;
    const worldCanvasRight = adventurePortalWorldX + Math.max(140, window.innerWidth * .65);
    adventureCanvas.width = Math.ceil(Math.max(window.innerWidth, worldCanvasRight) * scale);
    adventureCanvas.height = Math.ceil(window.innerHeight * scale);
    adventureCanvas.style.width = `${adventureCanvas.width}px`;
    adventureCanvas.style.height = `${window.innerHeight}px`;
    adventureContext.setTransform(scale, 0, 0, scale, 0, 0);
    cityFormationCanvas.width = Math.ceil(window.innerWidth * scale);
    cityFormationCanvas.height = Math.ceil(window.innerHeight * scale);
    cityFormationContext.setTransform(scale, 0, 0, scale, 0, 0);
}

resizeParticleCanvas();
resizeGroundCanvas();
resizeRedHandCanvas();
resizeAdventureCanvas();

const cityLeadPath =
    document.getElementById("cityLeadPath");

const cityImage =
    document.getElementById("cityImage");

// Use an HTML image for pixel sampling; SVG <image> elements do not expose naturalWidth.
const cityRaster = new Image();
cityRaster.src = cityImage.getAttribute("href");

const citySourceWidth = 477;

const citySourceHeight = 161;

const cityReveal =
    document.getElementById("cityReveal");

const cityFormationGroup =
    document.getElementById("cityFormationDots");

const cityTargetGroup =
    document.getElementById("cityTargetDots");

const cityRevealPrompt =
    document.getElementById("cityRevealPrompt");
const buildingsPrompt = document.getElementById("buildingsPrompt");
const doorDotCanvas = document.getElementById("doorDotCanvas");
let doorDotFieldBuilt = false;
let doorNeonIgniteStarted = 0;

const continuePrompt =
    document.getElementById("continuePrompt");

const inspectCopy =
    document.getElementById("inspectCopy");

let cityFormationDots = [];

let cityFormationComplete = false;

let inspectMode = false;
let buildingsKnockInProgress = false;

let inspectStartedAt = 0;

let inspectTransitionComplete = false;

let continueCameraLocked = false;
let continueCameraX = 0;
let continuePlayerMinX = 0;
let continuePlayerMaxX = 0;

let continuePromptDismissed = false;

let fallTransitionActive = false;

let fallTransitionStartedAt = 0;

let redPathActive = false;

const redFoodImageFiles = [
    "FOOD IMAGES/Taco.webp",
    "FOOD IMAGES/PHO.png",
    "FOOD IMAGES/Pizza.webp",
    "FOOD IMAGES/Burger.webp"
];
const redFoodOutlineFiles = {
    0: "FOOD IMAGES/TACO Outline.png",
    1: "FOOD IMAGES/PHO OUTLINE.png",
    2: "FOOD IMAGES/PIZZA outline.png",
    3: "FOOD IMAGES/Burger OUTLINE.png"
};
const redFoodMasks = [
    { type: "polygons", shapes: [
        [[0, .37], [.09, .31], [.2, .36], [.34, .46], [.41, .66], [.36, .86], [.29, .95], [.18, .88], [.08, .73], [0, .58]],
        [[.16, .27], [.24, .19], [.37, .18], [.48, .29], [.51, .46], [.47, .62], [.39, .67], [.3, .56], [.22, .46], [.17, .37]]
    ] },
    { type: "ellipse", x: .5, y: .61, rx: .49, ry: .34 },
    { type: "ellipse", x: .5, y: .5, rx: .475, ry: .475 },
    { type: "ellipse", x: .5, y: .5, rx: .48, ry: .48 }
];
const redFoodTargets = [null, null, null, null];
const redFoodImages = [null, null, null, null];
let redFoodTacoOutlineImage = null;
let redFoodPhoOutlineImage = null;
let redFoodPizzaOutlineImage = null;
let redFoodBurgerOutlineImage = null;
let redFoodSequenceStarted = false;
let redFoodTravelStep = 0;
let redFoodCameraAnchor = 0;
let redFoodProgressX = 0;
let redFoodVisualProgress = 0;
let redFoodBoundaryHoldAt = 0;
const redHandPalmPoint = Object.freeze({ x: .53, y: .36 });
let redFoodGlCanvas = null;
let redFoodGl = null;
let redFoodGlProgram = null;
let redFoodGlLocations = null;

function initRedFoodWebGL() {
    if (redFoodGl) return true;
    if (redFoodGlCanvas && redFoodGlCanvas.dataset.failed === "true") return false;
    if (!redFoodGlCanvas) {
        redFoodGlCanvas = document.createElement("canvas");
        redFoodGlCanvas.id = "redFoodParticleCanvas";
        Object.assign(redFoodGlCanvas.style, {
            position: "fixed",
            inset: "0",
            width: "100vw",
            height: "100vh",
            zIndex: "4",
            pointerEvents: "none",
            display: "none"
        });
        document.body.appendChild(redFoodGlCanvas);
    }

    redFoodGl = redFoodGlCanvas.getContext("webgl", {
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
        depth: false,
        stencil: false,
        powerPreference: "high-performance"
    });
    if (!redFoodGl) {
        redFoodGlCanvas.dataset.failed = "true";
        return false;
    }

    const vertexSource = `
        attribute vec2 aStart;
        attribute vec2 aTarget;
        attribute vec2 aEdge;
        attribute vec4 aColor;
        attribute vec4 aMeta;
        uniform vec2 uResolution;
        uniform vec2 uCenter;
        uniform float uProgress;
        uniform float uMode;
        uniform float uTime;
        uniform float uCameraShift;
        uniform float uDpr;
        varying vec4 vColor;
        void main() {
            float stagger = aMeta.x * 0.12;
            float p = clamp((uProgress - stagger) / (1.0 - stagger), 0.0, 1.0);
            float eased = p * p * (3.0 - 2.0 * p);
            vec2 target = uCenter + aTarget;
            float depthDrift = (uMode < 0.5 ? 1.0 - eased : eased) * (5.0 + aMeta.z * 14.0);
            vec2 position;
            float alpha;
            if (uMode < 0.5) {
                position = mix(aStart, target, eased);
                position += vec2(sin(uTime * 3.0 + aMeta.w), cos(uTime * 2.7 + aMeta.w)) * depthDrift;
                position.x += -uCameraShift * (aMeta.z - 0.5) * 0.1 * eased;
                alpha = p * (0.75 + aMeta.z * 0.2);
            } else if (uMode < 1.5) {
                position = mix(target, aEdge, eased);
                position += vec2(sin(uTime * 3.0 + aMeta.w), cos(uTime * 2.7 + aMeta.w)) * depthDrift;
                alpha = (1.0 - p) * (0.75 + aMeta.z * 0.2);
            } else {
                position = target;
                alpha = 1.0;
            }
            vec2 clip = vec2(position.x / uResolution.x * 2.0 - 1.0,
                             1.0 - position.y / uResolution.y * 2.0);
            gl_Position = vec4(clip, 0.0, 1.0);
            gl_PointSize = max(1.0, aMeta.y * 2.0 * uDpr * (0.72 + aMeta.z * 0.52));
            vColor = vec4(aColor.rgb, alpha);
        }
    `;
    const fragmentSource = `
        precision mediump float;
        varying vec4 vColor;
        void main() {
            float radius = length(gl_PointCoord - vec2(0.5));
            float coverage = 1.0 - smoothstep(0.38, 0.5, radius);
            if (coverage <= 0.01) discard;
            gl_FragColor = vec4(vColor.rgb, vColor.a * coverage);
        }
    `;
    const compileShader = (type, source) => {
        const shader = redFoodGl.createShader(type);
        redFoodGl.shaderSource(shader, source);
        redFoodGl.compileShader(shader);
        if (!redFoodGl.getShaderParameter(shader, redFoodGl.COMPILE_STATUS)) {
            redFoodGl.deleteShader(shader);
            return null;
        }
        return shader;
    };
    const vertexShader = compileShader(redFoodGl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(redFoodGl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) {
        redFoodGlCanvas.dataset.failed = "true";
        redFoodGl = null;
        return false;
    }
    redFoodGlProgram = redFoodGl.createProgram();
    redFoodGl.attachShader(redFoodGlProgram, vertexShader);
    redFoodGl.attachShader(redFoodGlProgram, fragmentShader);
    redFoodGl.linkProgram(redFoodGlProgram);
    if (!redFoodGl.getProgramParameter(redFoodGlProgram, redFoodGl.LINK_STATUS)) {
        redFoodGlCanvas.dataset.failed = "true";
        redFoodGl = null;
        return false;
    }
    redFoodGlLocations = {
        attributes: ["aStart", "aTarget", "aEdge", "aColor", "aMeta"]
            .map(name => redFoodGl.getAttribLocation(redFoodGlProgram, name)),
        uniforms: {
            resolution: redFoodGl.getUniformLocation(redFoodGlProgram, "uResolution"),
            center: redFoodGl.getUniformLocation(redFoodGlProgram, "uCenter"),
            progress: redFoodGl.getUniformLocation(redFoodGlProgram, "uProgress"),
            mode: redFoodGl.getUniformLocation(redFoodGlProgram, "uMode"),
            time: redFoodGl.getUniformLocation(redFoodGlProgram, "uTime"),
            cameraShift: redFoodGl.getUniformLocation(redFoodGlProgram, "uCameraShift"),
            dpr: redFoodGl.getUniformLocation(redFoodGlProgram, "uDpr")
        }
    };
    redFoodGl.enable(redFoodGl.BLEND);
    redFoodGl.blendFunc(redFoodGl.SRC_ALPHA, redFoodGl.ONE_MINUS_SRC_ALPHA);
    resizeRedFoodWebGL();
    return true;
}

function resizeRedFoodWebGL() {
    if (!redFoodGl || !redFoodGlCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    redFoodGlCanvas.width = Math.round(window.innerWidth * dpr);
    redFoodGlCanvas.height = Math.round(window.innerHeight * dpr);
    redFoodGl.viewport(0, 0, redFoodGlCanvas.width, redFoodGlCanvas.height);
}

function uploadRedFoodTarget(target) {
    if (!redFoodGl || !target || target.gpuBuffer) return;
    const values = new Float32Array(target.dots.length * 14);
    let cursor = 0;
    for (const dot of target.dots) {
        const color = dot.rgb;
        values[cursor++] = dot.startX;
        values[cursor++] = dot.startY;
        values[cursor++] = dot.x;
        values[cursor++] = dot.y;
        values[cursor++] = dot.edgeX;
        values[cursor++] = dot.edgeY;
        values[cursor++] = color[0] / 255;
        values[cursor++] = color[1] / 255;
        values[cursor++] = color[2] / 255;
        values[cursor++] = 1;
        values[cursor++] = dot.delay / 230;
        values[cursor++] = dot.radius;
        values[cursor++] = dot.depth;
        values[cursor++] = dot.phase;
    }
    target.gpuBuffer = redFoodGl.createBuffer();
    target.gpuCount = target.dots.length;
    redFoodGl.bindBuffer(redFoodGl.ARRAY_BUFFER, target.gpuBuffer);
    redFoodGl.bufferData(redFoodGl.ARRAY_BUFFER, values, redFoodGl.STATIC_DRAW);
}

function drawRedFoodGpuTarget(index, progress, mode, now) {
    const target = redFoodTargets[index];
    if (!target?.gpuBuffer) return;
    const gl = redFoodGl;
    const center = redFoodStageCenter(target);
    const stride = 14 * Float32Array.BYTES_PER_ELEMENT;
    const locations = redFoodGlLocations;
    gl.bindBuffer(gl.ARRAY_BUFFER, target.gpuBuffer);
    const attributes = locations.attributes;
    const sizes = [2, 2, 2, 4, 4];
    const offsets = [0, 2, 4, 6, 10];
    for (let i = 0; i < attributes.length; i++) {
        gl.enableVertexAttribArray(attributes[i]);
        gl.vertexAttribPointer(attributes[i], sizes[i], gl.FLOAT, false, stride,
            offsets[i] * Float32Array.BYTES_PER_ELEMENT);
    }
    gl.uniform2f(locations.uniforms.resolution, window.innerWidth, window.innerHeight);
    gl.uniform2f(locations.uniforms.center, center.x, center.y);
    gl.uniform1f(locations.uniforms.progress, progress);
    gl.uniform1f(locations.uniforms.mode, mode);
    gl.uniform1f(locations.uniforms.time, now / 1000);
    gl.uniform1f(locations.uniforms.cameraShift, getCameraX() - redFoodCameraAnchor);
    gl.uniform1f(locations.uniforms.dpr, Math.min(window.devicePixelRatio || 1, 1.5));
    gl.drawArrays(gl.POINTS, 0, target.gpuCount);
}

function beginRedFoodGpuFrame() {
    if (!initRedFoodWebGL()) {
        ensureRedFoodFallbackCanvas();
        return false;
    }
    if (redFoodFallbackCanvas) redFoodFallbackCanvas.style.display = "none";
    redFoodGlCanvas.style.display = "block";
    redFoodGlCanvas.style.clipPath = `inset(0px 0px ${Math.max(0, window.innerHeight - getGroundY())}px 0px)`;
    redFoodGl.viewport(0, 0, redFoodGlCanvas.width, redFoodGlCanvas.height);
    redFoodGl.clearColor(0, 0, 0, 0);
    redFoodGl.clear(redFoodGl.COLOR_BUFFER_BIT);
    redFoodGl.useProgram(redFoodGlProgram);
    return true;
}

let cubeLanded = false;

let floorParticles = [];
let redHandStartedAt = 0;
let redHandDebris = [];
let redHandDotBitmap = null;
let redFoodBurgerShownAt = 0;
let redHandExitStartedAt = 0;
let redHandLastExitShakeAt = 0;
let redHandExitFinished = false;
const redHandImage = new Image();
redHandImage.addEventListener("load", buildRedHandDotBitmap, { once: true });
redHandImage.src = encodeURI("Red Hand Statue.png");
const redHandRumbleAudio = new Audio("Ambiance/Rumble Sound Effect.mp3");
redHandRumbleAudio.preload = "auto";
redHandRumbleAudio.load();
const redHandRiseDuration = 5200;
const redHandLowerDuration = 2600;
const redFoodBurgerHoldDuration = 1600;

let stormRainDrops = [];
let stormSplashParticles = [];
let stormSplashRings = [];
let stormCityDots = [];
let stormCityDotGroups = [];
let stormRainFullScreenReset = false;
const stormArchitectureMaskCache = new Map();
const stormBuildingRevealStarts = new Map();
let stormLastBuildingRight = null;
let stormLastBuildingPassed = false;
let stormBuildingsPromptDismissed = false;
let buildingDoorWorldX = null;
let postBuildingCityRevealActive = false;
const stormArchitectureImages = [
    null,
    "Buildings/Building 1.png",
    "Buildings/Buildings 2.png",
    "Buildings/Building 3.png"
].map((src) => {
    if (!src) return null;
    const image = new Image();
    image.src = src;
    return image;
});
// Normalized silhouettes traced around the actual buildings in each photo.
// Separate polygons let sky, streets, and gaps between structures stay empty.
const stormArchitectureBuildingMasks = [
    [
        [[0, .48], [.04, .47], [.07, .50], [.08, .69], [.05, .76], [0, .75]],
        [[.045, .48], [.06, .29], [.085, .26], [.14, .28], [.16, .33], [.17, .61], [.21, .65], [.21, .78], [.18, .84], [.11, .84], [.10, 1], [.02, 1]],
        [[.21, .42], [.22, .12], [.25, .10], [.30, .11], [.32, .15], [.33, .42], [.31, .48], [.26, .48]],
        [[.29, .43], [.34, .40], [.38, .39], [.41, .42], [.42, .59], [.36, .62], [.30, .59]],
        [[.46, .37], [.49, .23], [.52, .20], [.55, .22], [.58, .27], [.61, .32], [.62, .61], [.58, .68], [.49, .68], [.46, .60]],
        [[.62, .37], [.68, .36], [.70, .32], [.77, .31], [.80, .36], [.81, .59], [.76, .62], [.69, .61], [.65, .57]],
        [[.80, .42], [.85, .41], [.88, .43], [.91, .47], [.96, .47], [1, .50], [1, .62], [.90, .62], [.84, .59]]
    ],
    [
        // Keep the dark sloped tower separate from its triangular glass base;
        // the shared diagonal is part of the architecture, not a vertical cut.
        [[.245, .216], [.491, .153], [.491, .676], [.238, .878]],
        [[.238, .878], [.499, .884], [.491, .676]],
        [[.511, .018], [.750, .220], [.748, .887], [.499, .884], [.488, .884], [.488, .676], [.503, .676]]
    ],
    [
        // Fallback silhouettes used only if the magenta image mask cannot load.
        [[.335, .047], [.441, .047], [.441, .218], [.335, .218]],
        [[.457, .096], [.471, .120], [.477, .154], [.487, .158], [.489, .184], [.507, .185], [.511, .206], [.525, .213], [.527, .241], [.541, .249], [.539, .270], [.551, .273], [.555, .423], [.543, .439], [.557, .455], [.557, .646], [.541, .659], [.559, .688], [.559, .982], [.387, .982], [.387, .844], [.369, .844], [.369, .704], [.375, .681], [.377, .454], [.389, .426], [.389, .270], [.401, .270], [.403, .244], [.417, .244], [.421, .215], [.431, .213], [.431, .187], [.439, .185], [.439, .158], [.451, .119]],
        [[.300, .438], [.387, .438], [.387, .704], [.300, .704]],
        [[.214, .982], [.214, .901], [.226, .901], [.226, .854], [.253, .854], [.253, .813], [.273, .811], [.273, .783], [.303, .727], [.315, .725], [.365, .766], [.367, .844], [.387, .844], [.387, .982]],
        [[.625, .696], [.878, .694], [.905, .711], [.925, .711], [.943, .755], [.990, .756], [.990, .943], [.969, .946], [.965, .931], [.682, .931], [.675, .951], [.663, .949], [.657, .936], [.625, .936]],
    ],
    [
        // Rear tower and its shorter neighboring rooftop stay separate so
        // the sky gap between their rooflines is not sampled as facade.
        [[.14, .12], [.37, .12], [.37, .35], [.14, .35]],
        [[.37, .30], [.52, .30], [.54, .35], [.54, .44], [.49, .45], [.46, .39], [.37, .38]],
        // Dark left glass tower.
        [[.16, .47], [.28, .40], [.31, .37], [.36, .39], [.36, .75], [.29, .78], [.16, .78]],
        // Central tan tower, following its stepped crown and full facade.
        [[.25, .43], [.31, .42], [.31, .38], [.36, .36], [.38, .34], [.41, .36], [.43, .33], [.47, .37], [.52, .39], [.60, .42], [.61, .73], [.57, .79], [.32, .79], [.25, .74]],
        // Right sloped glass facade.
        [[.50, .39], [.58, .39], [.72, .60], [.72, .73], [.63, .73], [.60, .68], [.60, .47]],
        // Foreground podium and the lower right wing begin at their actual roofline.
        [[.16, .77], [.22, .76], [.22, .71], [.71, .71], [.76, .76], [.82, .77], [.82, .98], [.16, .98]],
        [[.82, .76], [.89, .75], [.98, .77], [1, .80], [1, .99], [.83, .99]]
    ]
];
let stormCityDotsBuilt = false;
let stormRainWasActive = false;
let lastStormFrameTime = 0;
const stormBackgroundParallax = .48;

let adventureParticles = [];
let adventureAmbientParticles = [];

let adventureArrowStart = 0;

let adventurePromptStarted = 0;

let adventurePromptTriggered = false;

let adventureTargetWorldX = 0;

let adventureTargetWorldY = 0;

let adventurePromptBounds = null;

let adventureTriggerWorldX = 0;

let portalWorldActive = false;
let portalEnteredAt = 0;
let openingAmbienceAudio = null;
let openingAmbienceFadeTimer = 0;
let portalRainAudio = null;
let portalRainFadeTimer = 0;
let particleMotionAudioDrive = 0;
let particleMotionAudioDirection = 0;
let particleMotionAudioFoodDrive = 0;
let particleMotionAudioFoodPlaybackRate = .55;
let particleMotionAudioFoodWasActive = false;
let particleMotionAudioBlocked = false;
let particleMotionAudioLastFrame = 0;
let particleMotionAudioContext = null;
let particleMotionAudioSource = null;
const particleMotionAudio = new Audio("Ambiance/Particle.wav");
particleMotionAudio.preload = "auto";
particleMotionAudio.loop = true;
particleMotionAudio.volume = 0;
particleMotionAudio.preservesPitch = false;
particleMotionAudio.mozPreservesPitch = false;
particleMotionAudio.webkitPreservesPitch = false;
particleMotionAudio.load();
const portalAppearAudio = new Audio("Ambiance/Portal.wav");
portalAppearAudio.preload = "none";
let portalAppearAudioPreloaded = false;
const arrowNeonSound = new Audio("Ambiance/Neon Sound Effect.mp3");
arrowNeonSound.preload = "auto";
arrowNeonSound.volume = .04;
arrowNeonSound.load();
let arrowNeonFadeTimer = 0;
const doorKnockSound = new Audio("Ambiance/Door Knock.wav");
doorKnockSound.preload = "auto";
doorKnockSound.load();
let doorKnockCutoffTimer = 0;
const doorOpeningSound = new Audio("Ambiance/Door Opening.mp3");
doorOpeningSound.preload = "auto";
doorOpeningSound.load();
const glassBreakSound = new Audio("Ambiance/Glass break.wav");
glassBreakSound.preload = "auto";
glassBreakSound.load();

function fadeOpeningAmbience(audio, targetVolume, duration, onComplete) {
    window.clearInterval(openingAmbienceFadeTimer);
    const startVolume = audio.volume;
    const startedAt = performance.now();
    openingAmbienceFadeTimer = window.setInterval(() => {
        const progress = Math.min((performance.now() - startedAt) / duration, 1);
        audio.volume = startVolume + (targetVolume - startVolume) * progress;
        if (progress >= 1) {
            window.clearInterval(openingAmbienceFadeTimer);
            openingAmbienceFadeTimer = 0;
            onComplete?.();
        }
    }, 50);
}

function startOpeningAmbience() {
    if (portalWorldActive || fallTransitionActive || redPathActive || openingAmbienceAudio) return;
    const audio = new Audio("Ambiance/Ethereal Ambiance.mp3");
    audio.loop = true;
    audio.volume = 0;
    openingAmbienceAudio = audio;
    audio.play().then(() => {
        if (openingAmbienceAudio !== audio || portalWorldActive) {
            audio.pause();
            return;
        }
        fadeOpeningAmbience(audio, .004, 2200);
    }).catch(() => {
        if (openingAmbienceAudio !== audio) return;
        audio.muted = true;
        audio.volume = .004;
        audio.play().catch(() => {
            if (openingAmbienceAudio === audio) openingAmbienceAudio = null;
        });
    });
}

function unlockOpeningAmbience() {
    particleMotionAudioBlocked = false;
    if (!particleMotionAudioContext) {
        const AudioContextType = window.AudioContext || window.webkitAudioContext;
        if (AudioContextType) {
            try {
                particleMotionAudioContext = new AudioContextType();
                particleMotionAudioSource = particleMotionAudioContext.createMediaElementSource(particleMotionAudio);
                const filter = particleMotionAudioContext.createBiquadFilter();
                const delay = particleMotionAudioContext.createDelay(.2);
                const feedback = particleMotionAudioContext.createGain();
                const echoMix = particleMotionAudioContext.createGain();
                filter.type = "lowpass";
                filter.frequency.value = 2200;
                filter.Q.value = .7;
                delay.delayTime.value = .095;
                feedback.gain.value = .12;
                echoMix.gain.value = .14;
                particleMotionAudioSource.connect(filter);
                filter.connect(particleMotionAudioContext.destination);
                filter.connect(delay);
                delay.connect(feedback);
                feedback.connect(delay);
                delay.connect(echoMix);
                echoMix.connect(particleMotionAudioContext.destination);
            } catch {
                particleMotionAudioContext = null;
                particleMotionAudioSource = null;
            }
        }
    }
    if (particleMotionAudioContext?.state === "suspended") {
        particleMotionAudioContext.resume().catch(() => {});
    }

    if (!portalAppearAudioPreloaded) {
        portalAppearAudioPreloaded = true;
        portalAppearAudio.preload = "auto";
        portalAppearAudio.load();
    }

    if (!openingAmbienceAudio) {
        startOpeningAmbience();
        return;
    }
    if (!openingAmbienceAudio.muted) return;
    const audio = openingAmbienceAudio;
    audio.muted = false;
    audio.volume = 0;
    audio.play().then(() => {
        if (openingAmbienceAudio === audio && !portalWorldActive) {
            fadeOpeningAmbience(audio, .004, 2200);
        }
    }).catch(() => {
        audio.muted = true;
    });
}

function registerParticleMotionSound(amount, direction = 0, source = "general", pitchProgress = 0) {
    const strength = Math.max(0, Math.min(1, amount));
    if (source === "food") {
        particleMotionAudioFoodDrive = Math.max(particleMotionAudioFoodDrive, strength);
        particleMotionAudioFoodPlaybackRate = .55 + Math.max(0, Math.min(1, pitchProgress)) * 1.1;
        return;
    }
    particleMotionAudioDrive = Math.max(particleMotionAudioDrive, strength);
    if (direction && strength > .004) {
        particleMotionAudioDirection += Math.sign(direction) * strength;
    }
}

function updateParticleMotionSound() {
    const now = performance.now();
    const elapsed = particleMotionAudioLastFrame
        ? Math.min((now - particleMotionAudioLastFrame) / 1000, .05)
        : 1 / 60;
    particleMotionAudioLastFrame = now;
    const foodActive = particleMotionAudioFoodDrive > .004;
    const foodSequenceOwnsSound = redPathActive && redFoodSequenceStarted && postFoodMarketScene.hidden;
    const generalTarget = !foodSequenceOwnsSound && particleMotionAudioDrive > .004
        ? Math.min(.18, particleMotionAudioDrive * .18)
        : 0;
    const foodTarget = foodActive ? Math.min(.68, particleMotionAudioFoodDrive * .68) : 0;
    const target = Math.max(generalTarget, foodTarget);
    const motionDirection = Math.sign(particleMotionAudioDirection);
    const targetPlaybackRate = foodActive
        ? particleMotionAudioFoodPlaybackRate
        : particleMotionAudioDrive > .004 && !foodSequenceOwnsSound
            ? (motionDirection > 0 ? 1.32 : motionDirection < 0 ? .72 : 1)
            : 1;
    particleMotionAudioDrive = 0;
    particleMotionAudioDirection = 0;
    particleMotionAudioFoodDrive = 0;
    const timeConstant = target > particleMotionAudio.volume
        ? (foodActive ? .035 : .025)
        : (particleMotionAudioFoodWasActive ? .08 : .32);
    const smoothing = 1 - Math.exp(-elapsed / timeConstant);
    particleMotionAudio.volume += (target - particleMotionAudio.volume) * smoothing;
    particleMotionAudioFoodWasActive = foodActive ||
        (particleMotionAudioFoodWasActive && particleMotionAudio.volume > target + .001);
    particleMotionAudio.playbackRate += (targetPlaybackRate - particleMotionAudio.playbackRate) *
        (1 - Math.exp(-elapsed / .045));
    if (target > 0 && particleMotionAudio.paused && !particleMotionAudioBlocked) {
        particleMotionAudio.play().catch(() => {
            particleMotionAudioBlocked = true;
        });
    } else if (target === 0 && particleMotionAudio.volume < .001) {
        particleMotionAudio.pause();
        particleMotionAudio.currentTime = 0;
        particleMotionAudio.volume = 0;
    }
}

function playArrowNeonSound({ startAt = 1, volume = .04, playbackRate = 1, fadeDuration = 1800 } = {}) {
    window.clearInterval(arrowNeonFadeTimer);
    arrowNeonSound.pause();
    arrowNeonSound.currentTime = startAt;
    arrowNeonSound.playbackRate = playbackRate;
    arrowNeonSound.volume = volume;
    arrowNeonSound.play().then(() => {
        const fadeStartedAt = performance.now();
        arrowNeonFadeTimer = window.setInterval(() => {
            const progress = Math.min((performance.now() - fadeStartedAt) / fadeDuration, 1);
            arrowNeonSound.volume = volume * (1 - progress);
            if (progress >= 1) {
                window.clearInterval(arrowNeonFadeTimer);
                arrowNeonFadeTimer = 0;
                arrowNeonSound.pause();
                arrowNeonSound.currentTime = startAt;
                arrowNeonSound.playbackRate = 1;
            }
        }, 40);
    }).catch(() => {});
}

function playDoorKnockSound() {
    window.clearTimeout(doorKnockCutoffTimer);
    doorKnockSound.pause();
    doorKnockSound.currentTime = 1.27;
    doorKnockSound.volume = .35;
    doorKnockSound.play().then(() => {
        doorKnockCutoffTimer = window.setTimeout(() => {
            doorKnockSound.pause();
            doorKnockSound.currentTime = 1.27;
            doorKnockCutoffTimer = 0;
        playDoorOpeningSound();
        }, 850);
    }).catch(() => {});
}

function playDoorOpeningSound() {
    doorOpeningSound.pause();
    doorOpeningSound.currentTime = .45;
    doorOpeningSound.volume = .35;
    doorOpeningSound.play().catch(() => {});
}

function playRedLandingThump() {
    const context = particleMotionAudioContext;
    if (!context || context.state !== "running") return;

    const now = context.currentTime;
    const impact = context.createOscillator();
    const impactGain = context.createGain();
    impact.type = "sine";
    impact.frequency.setValueAtTime(98, now);
    impact.frequency.exponentialRampToValueAtTime(38, now + .28);
    impactGain.gain.setValueAtTime(.001, now);
    impactGain.gain.linearRampToValueAtTime(.22, now + .009);
    impactGain.gain.exponentialRampToValueAtTime(.001, now + .38);
    impact.connect(impactGain);
    impactGain.connect(context.destination);
    impact.start(now);
    impact.stop(now + .4);

    const noiseBuffer = context.createBuffer(1, Math.ceil(context.sampleRate * .07), context.sampleRate);
    const noiseSamples = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseSamples.length; i++) noiseSamples[i] = Math.random() * 2 - 1;
    const noise = context.createBufferSource();
    const lowPass = context.createBiquadFilter();
    const noiseGain = context.createGain();
    noise.buffer = noiseBuffer;
    lowPass.type = "lowpass";
    lowPass.frequency.value = 420;
    noiseGain.gain.setValueAtTime(.045, now);
    noiseGain.gain.exponentialRampToValueAtTime(.001, now + .07);
    noise.connect(lowPass);
    lowPass.connect(noiseGain);
    noiseGain.connect(context.destination);
    noise.start(now);
}

function stopArrowNeonSound() {
    window.clearInterval(arrowNeonFadeTimer);
    arrowNeonFadeTimer = 0;
    if (!arrowNeonSound.paused) arrowNeonSound.pause();
}

function playPortalAppearSound() {
    portalAppearAudio.pause();
    portalAppearAudio.currentTime = 0;
    portalAppearAudio.loop = true;
    portalAppearAudio.volume = .025;
    portalAppearAudio.play().catch(() => {});
}

function stopPortalAppearSound() {
    portalAppearAudio.pause();
    portalAppearAudio.currentTime = 0;
}

function fadePortalRainAudio(audio, targetVolume, duration, onComplete) {
    window.clearInterval(portalRainFadeTimer);
    const startVolume = audio.volume;
    const startedAt = performance.now();
    portalRainFadeTimer = window.setInterval(() => {
        const progress = Math.min((performance.now() - startedAt) / duration, 1);
        audio.volume = startVolume + (targetVolume - startVolume) * progress;
        if (progress >= 1) {
            window.clearInterval(portalRainFadeTimer);
            portalRainFadeTimer = 0;
            onComplete?.();
        }
    }, 50);
}

function startPortalRainAudio() {
    if (portalRainAudio) return;
    const audio = new Audio("Ambiance/Rain.mp3");
    audio.loop = true;
    audio.volume = 0;
    portalRainAudio = audio;
    audio.play().then(() => {
        if (portalRainAudio !== audio) {
            audio.pause();
            return;
        }
        fadePortalRainAudio(audio, .035, 1800);
    }).catch(() => {});
}

function stopPortalRainAudio() {
    const audio = portalRainAudio;
    if (!audio) return;
    portalRainAudio = null;
    fadePortalRainAudio(audio, 0, 450, () => audio.pause());
}

function stopOpeningAmbience() {
    const audio = openingAmbienceAudio;
    if (!audio) return;
    openingAmbienceAudio = null;
    fadeOpeningAmbience(audio, 0, 900, () => audio.pause());
}

document.addEventListener("pointerdown", unlockOpeningAmbience, { passive: true });
document.addEventListener("keydown", unlockOpeningAmbience);
startOpeningAmbience();

let fallProgress = 0;

let landingBurstStarted = false;

const fallTransitionDuration = 3600;

let cityRevealStarted = false;

let cityLineProgress = 0;

const controls =
    document.getElementById("controls");

const keyA =
    document.getElementById("keyA");

const keyD =
    document.getElementById("keyD");


/* ============================================================
   PLAYER POSITION
   ============================================================ */

let x = 120;

let lastGroundState = "";


/* ============================================================
   MOVEMENT SPEED
   ============================================================ */

const normalSpeed = 4;

const groundDotSpacing = 11;

let movingLeft = false;

let movingRight = false;

let movementDirection = 1;


/* ============================================================
   CITY DRAWING DATA
   The original skyline line segments.
   ============================================================ */

const cityLines = [

    [28,142,28,84],
    [28,84,44,74],
    [44,74,59,69],
    [59,69,59,51],
    [59,51,78,56],
    [78,56,78,91],

    [28,142,55,142],
    [37,80,37,142],
    [55,80,55,142],

    [62,138,62,95],
    [62,95,81,89],
    [81,89,81,138],

    [68,138,68,101],
    [75,138,75,139],

    [79,139,79,93],
    [79,93,93,87],
    [93,87,93,16],

    [93,16,119,15],
    [119,15,120,94],
    [120,94,126,96],
    [126,96,126,139],

    [107,17,107,94],

    [86,139,86,102],
    [86,102,110,96],
    [110,96,110,139],

    [111,139,111,95],
    [111,95,132,88],
    [132,88,132,139],

    [121,139,121,98],
    [121,98,140,92],
    [140,92,140,139],

    [132,139,132,90],
    [132,90,152,86],
    [152,86,152,139],

    [142,139,142,85],
    [142,85,158,84],
    [158,84,158,139],

    [149,84,149,139],

    [158,139,158,94],
    [158,94,176,94],
    [176,94,176,139],

    [160,91,170,88],
    [170,88,181,91],
    [181,91,181,139],

    [183,139,183,102],
    [183,102,207,85],
    [207,85,231,84],
    [231,84,247,106],
    [247,106,247,139],

    [184,103,247,103],
    [215,84,220,139],

    [250,139,250,113],
    [250,113,265,111],
    [265,111,265,139],

    [265,139,265,84],
    [265,84,272,47],
    [272,47,280,47],
    [280,47,291,84],
    [291,84,291,139],

    [269,58,281,58],
    [267,66,284,66],
    [265,74,287,74],
    [263,82,290,82],
    [270,91,291,91],
    [274,100,291,100],

    [293,139,293,101],
    [293,101,307,97],
    [307,97,307,139],

    [309,139,309,63],
    [309,63,331,62],
    [331,62,331,139],

    [329,62,329,28],
    [329,28,342,28],
    [342,28,342,139],

    [334,28,334,139],

    [342,139,342,64],
    [342,64,363,66],
    [363,66,363,139],

    [349,65,349,139],
    [355,65,355,139],

    [363,139,363,97],
    [363,97,378,98],
    [378,98,378,139],

    [377,139,377,111],
    [377,111,390,111],
    [390,111,390,139],

    [397,139,397,101],
    [397,101,413,97],
    [413,97,413,139],

    [413,139,413,69],
    [413,69,424,60],
    [424,60,436,60],
    [436,60,442,70],
    [442,70,442,139],

    [414,69,414,139],

    [441,139,441,73],
    [441,73,462,70],
    [462,70,462,139],

    [452,71,452,139],

    [462,139,462,103],
    [462,103,471,105],
    [471,105,471,139]
];


function blueParticleColor(horizontal = Math.random(), vertical = Math.random()) {
    const hue = 199 + horizontal * 24 + (Math.random() - .5) * 12;
    const saturation = 72 + Math.random() * 24;
    const lightness = 46 + vertical * 12 + Math.random() * 12;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function buildCityFormationDots() {
    const cellSize = 5;
    const uniquePoints = new Map();
    const canvas = document.createElement("canvas");
    canvas.width = citySourceWidth;
    canvas.height = citySourceHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (cityRaster.complete && cityRaster.naturalWidth > 0 && context) {
        try {
            context.drawImage(cityRaster, 0, 0, canvas.width, canvas.height);
            const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;

            // Pick one exact red pixel in each small cell to keep the tracing dense and light.
            for (let cellY = 0; cellY < canvas.height; cellY += cellSize) {
                for (let cellX = 0; cellX < canvas.width; cellX += cellSize) {
                    let bestPoint = null;
                    let bestRed = 8;

                    for (let y = cellY; y < Math.min(cellY + cellSize, canvas.height); y++) {
                        for (let x = cellX; x < Math.min(cellX + cellSize, canvas.width); x++) {
                            const offset = (y * canvas.width + x) * 4;
                            const redStrength = pixels[offset] - Math.max(pixels[offset + 1], pixels[offset + 2]);

                            if (pixels[offset + 3] > 8 && pixels[offset] > 20 && redStrength > bestRed) {
                                bestRed = redStrength;
                                bestPoint = { x: x + .5, y: y + .5 };
                            }
                        }
                    }

                    if (bestPoint) {
                        uniquePoints.set(`${cellX}:${cellY}`, bestPoint);
                    }
                }
            }
        } catch (error) {
            // Fall back to the vector outline if local image pixels are restricted.
            console.warn("Could not sample city image pixels; using vector outline.", error);
        }
    }

    // Use the original vector outline if the image cannot be sampled.
    if (uniquePoints.size === 0) {
        const fallbackSpacing = 5;
        for (const [x1, y1, x2, y2] of cityLines) {
            const distance = Math.hypot(x2 - x1, y2 - y1);
            const steps = Math.max(1, Math.ceil(distance / fallbackSpacing));

            for (let step = 0; step <= steps; step++) {
                const t = step / steps;
                const x = x1 + (x2 - x1) * t;
                const y = y1 + (y2 - y1) * t;
                uniquePoints.set(`${Math.round(x * 10)}:${Math.round(y * 10)}`, { x, y });
            }
        }
    }

    cityFormationDots = [...uniquePoints.values()].map((point, index) => {
        return {
            ...point,
            radius: index % 5 === 0 ? .9 : .78,
            color: blueParticleColor(point.x / citySourceWidth, 1 - point.y / citySourceHeight)
        };
    });

    cityFormationBitmapContext.clearRect(0, 0, cityFormationBitmap.width, cityFormationBitmap.height);
    for (const dot of cityFormationDots) {
        cityFormationBitmapContext.fillStyle = dot.color;
        cityFormationBitmapContext.beginPath();
        cityFormationBitmapContext.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        cityFormationBitmapContext.fill();
    }
}

function drawCityFormationDot(dot, x, y, alpha, scaleX, scaleY) {
    if (alpha <= 0 || x < -8 || x > window.innerWidth + 8 || y < -8 || y > window.innerHeight + 8) return;
    cityFormationContext.globalAlpha = alpha;
    cityFormationContext.fillStyle = dot.color;
    cityFormationContext.beginPath();
    cityFormationContext.arc(x, y, dot.radius * (scaleX + scaleY) * .5, 0, Math.PI * 2);
    cityFormationContext.fill();
}

/* ============================================================
   GET GROUND Y
   Keeps the cube on a level ground line.
   ============================================================ */

function getGroundY() {

    return window.innerHeight * 0.78;
}


/* ============================================================
   GET GROUND ANGLE
   Keeps the cube upright on level ground.
   ============================================================ */

function getGroundAngle() {

    return 0;
}


function getCameraX() {
    if (continueCameraLocked) return continueCameraX;
    return Math.max(
        0,
        x - window.innerWidth * 0.35
    );
}


/* ============================================================
   CITY TIMING
   Determines where the city image is placed.
   ============================================================ */

function getCityTiming() {

    const cacheKey = `${window.innerWidth}:${window.innerHeight}`;
    if (getCityTiming.cacheKey === cacheKey) return getCityTiming.cachedValue;

    const screenWidth =
        window.innerWidth;


    const imageWidth =
        Math.min(
            screenWidth * 0.68,
            800
        );


    const imageHeight =
        imageWidth * citySourceHeight / citySourceWidth;


    const imageX =
        (screenWidth - imageWidth) / 2;


    const imageY =
        window.innerHeight * 0.12;


    const drawingStartX =
        imageX + imageWidth * 28 / citySourceWidth;


    const drawingStartY =
        imageY + imageHeight * 142 / citySourceHeight;


    const orbStartX =
        Math.max(
            drawingStartX - Math.min(screenWidth * 0.18, 180),
            16
        );


    const lineStartWorld =
        screenWidth *
        1.55;


    const imageStartWorld =
        screenWidth *
        2 +
        orbStartX;


    const timing = {
        imageWidth,
        imageHeight,
        imageX,
        imageY,
        drawingStartX,
        drawingStartY,
        orbStartX,
        lineStartWorld,
        imageStartWorld
    };
    getCityTiming.cacheKey = cacheKey;
    getCityTiming.cachedValue = timing;
    return timing;
}


/* ============================================================
   DRAW CITY
   Handles the original city reveal.
   ============================================================ */

function drawCity() {

    const screenWidth = window.innerWidth;
    const currentScene = Math.floor(x / screenWidth);
    const cityShouldBeHidden = !cityRevealStarted && (currentScene < 1 || currentScene > 2);
    if (cityShouldBeHidden) {
        if (!drawCity.isHidden) {
            cityFormationContext.clearRect(0, 0, screenWidth, window.innerHeight);
            cityFormationGroup.style.display = "none";
            cityTargetGroup.style.display = "none";
            cityLeadPath.setAttribute("d", "");
            cityReveal.setAttribute("width", "0");
            cityRevealPrompt.hidden = true;
            drawCity.isHidden = true;
        }
        return;
    }
    drawCity.isHidden = false;

    if (cityRevealStarted) {
        cityFormationContext.globalAlpha = 1;
        cityFormationContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
    const city =
        getCityTiming();

    const lineToImage =
        city.drawingStartX - city.orbStartX;

    const imageStartOffset =
        city.drawingStartX - city.imageX;

    const lineLength =
        lineToImage + city.imageWidth - imageStartOffset;

    const revealComplete =
        cityRevealStarted && cityLineProgress >= lineLength;

    const cameraShift = cityRevealStarted ? getCameraX() - cityCameraAnchor : 0;
    const imageScreenX = city.imageX - cameraShift;
    const revealStartX = city.orbStartX - cameraShift;

    /*
       Position city image.
    */

    cityImage.setAttribute(
        "x",
        imageScreenX
    );

    cityImage.setAttribute(
        "y",
        city.imageY
    );

    cityImage.setAttribute(
        "width",
        city.imageWidth
    );

    cityImage.setAttribute(
        "height",
        city.imageHeight
    );


    /*
       Position reveal rectangle.
    */

    cityReveal.setAttribute(
        "x",
        imageScreenX
    );

    cityReveal.setAttribute(
        "y",
        city.imageY
    );

    cityReveal.setAttribute(
        "height",
        city.imageHeight
    );

    if (cityRevealStarted) {
        cityRevealPrompt.hidden = true;
        cityLeadPath.setAttribute("d", "");
        cityReveal.setAttribute("width", "0");
        cityFormationGroup.style.display = "none";
        cityTargetGroup.style.display = "none";

        const progress = Math.min(cityLineProgress / lineLength, 1);
        cityFormationComplete = cityFormationComplete || progress >= 1;
        if (cityFormationComplete && !inspectMode) enterInspectMode();

        const scaleX = city.imageWidth / citySourceWidth;
        const scaleY = city.imageHeight / citySourceHeight;
        const sourceY = (getGroundY() + 8 - city.imageY) / scaleY;
        const inspectDuration = 1400;
        const inspectRawProgress = inspectMode
            ? Math.min((performance.now() - inspectStartedAt) / inspectDuration, 1)
            : 0;
        const inspectShift = Math.min(screenWidth * 0.22, 250) * inspectRawProgress;
        const inspectShiftLocal = inspectShift / scaleX;
        const inspectCopyWidth = Math.min(320, screenWidth * 0.32);
        const inspectCopyLeft = screenWidth * .62;
        const inspectCopyScreenLeft = inspectCopyLeft - cameraShift;

        inspectCopy.style.left = `${inspectCopyScreenLeft}px`;
        inspectCopy.style.top = `${city.imageY + city.imageHeight / 2}px`;
        inspectCopy.style.right = "auto";
        inspectCopy.style.width = `${inspectCopyWidth}px`;

        const continueReady =
            !fallTransitionActive && !redPathActive && inspectMode &&
            inspectTransitionComplete && !continuePromptDismissed;
        if (continueReady && !continueCameraLocked) {
            continueCameraX = getCameraX();
            continuePlayerMinX = continueCameraX;
            continuePlayerMaxX = continueCameraX + window.innerWidth - 50;
            continueCameraLocked = true;
        }
        continuePrompt.hidden = !continueReady;
        const copyOutsideCamera =
            inspectCopyScreenLeft + inspectCopyWidth < 0 || inspectCopyScreenLeft > screenWidth;
        inspectCopy.hidden = fallTransitionActive || redPathActive || !inspectMode || copyOutsideCamera;

        const staticCityReady = cityFormationComplete &&
            (!inspectMode || inspectRawProgress >= 1);
        if (staticCityReady) {
            const inspectOffset = inspectMode ? inspectShift : 0;
            cityFormationContext.drawImage(
                cityFormationBitmap,
                imageScreenX - inspectOffset,
                city.imageY,
                city.imageWidth,
                city.imageHeight
            );
        } else {
            for (const dot of cityFormationDots) {
                const formationDelay = (dot.x / citySourceWidth) * .32;
                const riseProgress = Math.max(0, Math.min(1, (progress - formationDelay) / .68));
                const riseEased = riseProgress * riseProgress * (3 - 2 * riseProgress);
                const formedY = sourceY + (dot.y - sourceY) * riseEased;
                let localX = dot.x;
                let localY = cityFormationComplete ? dot.y : formedY;
                let alpha = cityFormationComplete ? 1 : riseProgress;

                if (inspectMode && cityFormationComplete) {
                    const inspectDelay = ((citySourceWidth - dot.x) / citySourceWidth) * .18;
                    const localProgress = Math.max(0, Math.min(1, (inspectRawProgress - inspectDelay) / .82));
                    const eased = localProgress * localProgress * (3 - 2 * localProgress);
                    localX -= inspectShiftLocal * eased;
                    localY -= Math.sin(eased * Math.PI) * (4 / scaleY);
                }

                drawCityFormationDot(
                    dot,
                    imageScreenX + localX * scaleX,
                    city.imageY + localY * scaleY,
                    alpha,
                    scaleX,
                    scaleY
                );
            }
        }

        inspectTransitionComplete = inspectMode && inspectRawProgress >= 1;

        return;
    }

    cityFormationGroup.style.display = "none";
    cityTargetGroup.style.display = "none";


    /*
       Do not show the city lead line
       until the player reaches it.
    */

    if (!cityRevealStarted && x < city.lineStartWorld) {

        cityLeadPath.setAttribute(
            "d",
            ""
        );

        cityReveal.setAttribute(
            "width",
            "0"
        );

        cityRevealPrompt.hidden = true;

        return;
    }


    cityLeadPath.style.strokeLinecap =
        "butt";


    if (!cityRevealStarted && x < city.imageStartWorld - screenWidth * 0.45) {

        cityLeadPath.setAttribute("d", "");
        cityReveal.setAttribute("width", "0");
        cityRevealPrompt.hidden = true;
        return;
    }


    if (!cityRevealStarted) {

        cityLeadPath.setAttribute("d", "");
        cityReveal.setAttribute("width", "0");
        cityRevealPrompt.hidden = false;
        return;
    }


    cityRevealPrompt.hidden = true;

    const lineProgress =
        Math.min(cityLineProgress, lineToImage);

    if (revealComplete) {
        cityLeadPath.setAttribute("d", "");
    } else {
        cityLeadPath.setAttribute(
            "d",
            `M ${revealStartX} ${city.drawingStartY}
             L ${revealStartX + lineProgress} ${city.drawingStartY}`
        );
    }

    const revealProgress =
        Math.min(
            Math.max(cityLineProgress - lineToImage, 0),
            city.imageWidth - imageStartOffset
        ) + imageStartOffset;

    cityReveal.setAttribute("x", imageScreenX);


    cityReveal.setAttribute(
        "width",
        revealProgress
    );

}


function startCityReveal() {

    if (cityRevealStarted) {
        return;
    }

    const city =
        getCityTiming();

    if (x < city.imageStartWorld - window.innerWidth * 0.45) {
        return;
    }

    cityRevealStarted = true;
    cityLineProgress = 0;
    cityCameraAnchor = getCameraX();
    cityFormationComplete = false;
    inspectMode = false;
    continueCameraLocked = false;
    inspectStartedAt = 0;
    inspectTransitionComplete = false;
    continuePromptDismissed = false;
    continuePrompt.hidden = true;
    inspectCopy.hidden = true;
    buildCityFormationDots();
    drawCity();
}

function startCityRevealAfterBuildings() {
    stopPortalRainAudio();
    postBuildingCityRevealActive = true;
    stormBuildingsPromptDismissed = true;
    buildingDoorWorldX = null;
    buildingsPrompt.hidden = true;
    buildingsPrompt.classList.remove("door-sign-on", "knocking");
    redPathActive = false;
    world.classList.remove("red-world", "city-gone");
    cityRevealStarted = true;
    cityLineProgress = 0;
    cityCameraAnchor = getCameraX();
    continueCameraX = cityCameraAnchor;
    continuePlayerMinX = continueCameraX;
    continuePlayerMaxX = continueCameraX + window.innerWidth - 50;
    continueCameraLocked = true;
    cityFormationComplete = false;
    inspectMode = false;
    inspectStartedAt = 0;
    inspectTransitionComplete = false;
    continuePromptDismissed = false;
    cityRevealPrompt.hidden = true;
    continuePrompt.hidden = true;
    inspectCopy.hidden = true;
    cityLeadPath.setAttribute("d", "");
    cityReveal.setAttribute("width", "0");
    cityFormationContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    buildCityFormationDots();
    drawCity();
}


buildingsPrompt.addEventListener("click", knockOnBuildingsDoor);

function knockOnBuildingsDoor() {
    if (buildingsPrompt.hidden || buildingsKnockInProgress) return;
    buildingsKnockInProgress = true;
    playDoorKnockSound();
    buildingsPrompt.classList.remove("knocking");
    // Restart the CSS knock animation even if the door was clicked twice quickly.
    void buildingsPrompt.offsetWidth;
    buildingsPrompt.classList.add("knocking");
    window.setTimeout(() => {
        buildingsPrompt.classList.remove("knocking");
        buildingsKnockInProgress = false;
        if (!buildingsPrompt.hidden) startCityRevealAfterBuildings();
    }, 500);
}

function enterInspectMode() {
    if (!cityFormationComplete || inspectMode) return;
    inspectMode = true;
    inspectStartedAt = performance.now();
    inspectTransitionComplete = false;
    continuePromptDismissed = false;
}

function startDropTransition() {
    if (!inspectTransitionComplete || fallTransitionActive || redPathActive) return;

    stopOpeningAmbience();
    glassBreakSound.pause();
    glassBreakSound.currentTime = 0;
    glassBreakSound.volume = .45;
    glassBreakSound.play().catch(() => {});

    fallTransitionActive = true;
    fallTransitionStartedAt = performance.now();
    fallProgress = 0;
    continuePromptDismissed = true;
    continuePrompt.hidden = true;
    world.classList.add("city-gone");
    movingLeft = false;
    movingRight = false;
    keyA.classList.remove("active");
    keyD.classList.remove("active");
    controls.classList.remove("is-visible");
    inspectCopy.hidden = true;
    fallVeil.hidden = false;
    fallVeil.style.opacity = "0";

    const centerX = x - getCameraX() + 25;
    const groundY = getGroundY();
    floorParticles = [];
    landingBurstStarted = false;
    spawnFloorBurst(
        centerX,
        groundY - 2,
        105,
        ["#68d7ff", "#b6f3ff", "#ffffff"],
        18,
        760,
        280,
        1.45,
        "shard"
    );
    spawnUpflowDots(groundY, centerX);
}

function spawnFloorBurst(centerX, centerY, count, colors, spreadX, speed, gravity, lifetime, shape = "circle") {
    const now = performance.now();
    for (let i = 0; i < count; i++) {
        const startX = centerX + (Math.random() - .5) * spreadX;
        const startY = centerY + (Math.random() - .5) * (shape === "shard" ? 5 : 9);
        const radius = shape === "shard"
            ? 2 + Math.random() * 5
            : 1.4 + Math.random() * 3.4;
        const isRedBurst = colors[0] === "#ff334f";
        const color = isRedBurst
            ? colors[Math.floor(Math.random() * colors.length)]
            : blueParticleColor(startX / Math.max(window.innerWidth, 1));

        const angle = shape === "shard"
            ? -Math.PI / 2 + (Math.random() - .5) * .32
            : Math.PI + Math.random() * Math.PI;
        const particleSpeed = speed * (.45 + Math.random() * .75);

        floorParticles.push({
            shape: isRedBurst ? "pixel" : shape,
            startX,
            startY,
            radius,
            color,
            startedAt: now,
            velocityX: Math.cos(angle) * particleSpeed,
            velocityY: Math.sin(angle) * particleSpeed,
            gravity: gravity * (.7 + Math.random() * .7),
            lifetime: lifetime * (.72 + Math.random() * .55),
            fadeStart: shape === "shard" ? .58 : .68,
            rotation: Math.random() * 360,
            spin: (Math.random() - .5) * 850
        });
    }
}

function spawnUpflowDots(groundY, centerX) {
    const now = performance.now();
    const step = 11;
    const farthestEdge = Math.max(centerX, window.innerWidth - centerX, 1);

    for (let screenX = 0; screenX <= window.innerWidth; screenX += step) {
        const radius = [1.4, 2.2, 1.5, 2.7, 1.7, 2.3][Math.floor(screenX / step) % 6];
        const distanceFromBreak = Math.abs(screenX - centerX);
        const delay = distanceFromBreak / farthestEdge * 750;

        floorParticles.push({
            shape: "circle",
            startX: screenX,
            startY: groundY,
            radius,
            color: blueParticleColor(screenX / Math.max(window.innerWidth, 1)),
            startedAt: now + delay,
            velocityX: (Math.random() - .5) * 16,
            velocityY: -420 - Math.random() * 240,
            gravity: 350 + Math.random() * 170,
            lifetime: 2.6 + Math.random() * .8,
            fadeStart: .82,
            rotation: 0,
            spin: 0
        });
    }
}

function buildAdventurePrompt() {
    const fontSize = Math.min(54, Math.max(25, window.innerWidth * .062));
    const lineHeight = fontSize * 1.18;
    const lines = ["Are you ready for an", "adventure\u2009?"];
    const textCanvas = document.createElement("canvas");
    const textContext = textCanvas.getContext("2d", { willReadFrequently: true });
    textContext.font = `650 ${fontSize}px ${getComputedStyle(document.body).fontFamily}`;
    textContext.textAlign = "center";
    textContext.textBaseline = "middle";

    const widths = lines.map(line => textContext.measureText(line).width);
    const canvasWidth = Math.ceil(Math.max(...widths) + 24);
    const canvasHeight = Math.ceil(lineHeight * lines.length + 20);
    textCanvas.width = canvasWidth;
    textCanvas.height = canvasHeight;
    textContext.font = `650 ${fontSize}px ${getComputedStyle(document.body).fontFamily}`;
    textContext.textAlign = "center";
    textContext.textBaseline = "middle";
    lines.forEach((line, index) => {
        textContext.fillText(line, canvasWidth / 2, 10 + lineHeight * (index + .5));
    });

    const pixels = textContext.getImageData(0, 0, canvasWidth, canvasHeight).data;
    const centerX = window.innerWidth / 2;
    const targetLeft = (window.innerWidth - canvasWidth) / 2;
    const targetTop = window.innerHeight * .43 - canvasHeight / 2;
    adventurePromptBounds = { left: targetLeft, top: targetTop, width: canvasWidth, height: canvasHeight };
    adventureTargetWorldX = centerX;
    adventureTargetWorldY = targetTop + canvasHeight / 2;
    adventureTriggerWorldX = Math.max(260, Math.min(window.innerWidth * .32, 560));
    adventurePortalWorldX = adventureTriggerWorldX + Math.max(1700, window.innerWidth * .85);
    portalCloudParticles = [];
    portalCloudBuilt = false;
    resizeAdventureCanvas();
    adventurePromptStarted = 0;
    adventureArrowStart = 0;
    adventureParticles = [];
    adventureAmbientParticles = [];
    const adventureDotSizes = [1.8, 2.7, 2.1, 3.4, 2.3, 3, 1.9, 2.5];
    const ambientStartX = 0;
    const ambientEndX = Math.max(ambientStartX + 1, adventurePortalWorldX + window.innerWidth * .6);
    const ambientColors = ["#35aaff", "#56c8ff", "#83e4ff", "#3989e8"];
    for (let i = 0; i < 420; i++) {
        adventureAmbientParticles.push({
            x: ambientStartX + Math.random() * (ambientEndX - ambientStartX),
            y: 28 + Math.random() * Math.max(40, getGroundY() - 58),
            radius: adventureDotSizes[i % adventureDotSizes.length],
            color: ambientColors[i % ambientColors.length],
            phase: Math.random() * Math.PI * 2,
            floatX: 5 + Math.random() * 18,
            floatY: 5 + Math.random() * 15,
            speed: .00025 + Math.random() * .00055,
            offsetX: 0,
            offsetY: 0,
            velocityX: 0,
            velocityY: 0
        });
    }
    const startSpreadX = window.innerWidth * .8;
    const startSpreadY = window.innerHeight * .65;

    for (let py = 0; py < canvasHeight; py += 4) {
        for (let px = 0; px < canvasWidth; px += 4) {
            if (pixels[(py * canvasWidth + px) * 4 + 3] < 100) continue;
            adventureParticles.push({
                x: targetLeft + px,
                y: targetTop + py,
                startX: centerX + (Math.random() - .5) * 2 * startSpreadX,
                startY: targetTop + canvasHeight / 2 + (Math.random() - .5) * 2 * startSpreadY,
                color: `hsl(${201 + (px / canvasWidth) * 22 + (Math.random() - .5) * 10}, ${76 + Math.random() * 20}%, ${48 + (1 - py / canvasHeight) * 13 + Math.random() * 12}%)`,
                radius: adventureDotSizes[adventureParticles.length % adventureDotSizes.length],
                offsetX: 0,
                offsetY: 0,
                velocityX: 0,
                velocityY: 0,
                scatterAngle: 0,
                scatterStrength: 1,
                delay: 0,
                duration: 700,
                phase: Math.random() * Math.PI * 2,
                drift: 2 + Math.random() * 5,
                twinkle: .65 + Math.random() * .35
            });
        }
    }

    const longestLine = Math.max(...widths);
    adventureArrow = {
        x: centerX + longestLine / 2 + fontSize * .75,
        y: targetTop + canvasHeight / 2,
        size: Math.min(76, fontSize * 1.65),
        start: 0,
        soundPlayed: false,
        portalSoundPlayed: false,
        dots: []
    };
    const { x: arrowX, y: arrowY, size: arrowSize } = adventureArrow;
    const arrowTip = { x: arrowX + arrowSize * .43, y: arrowY };
    const arrowCurves = [
        [{ x: arrowX - arrowSize * .55, y: arrowY + arrowSize * .06 }, { x: arrowX - arrowSize * .08, y: arrowY - arrowSize * .12 }, arrowTip, 13],
        [{ x: arrowX + arrowSize * .13, y: arrowY - arrowSize * .31 }, { x: arrowX + arrowSize * .29, y: arrowY - arrowSize * .24 }, arrowTip, 7],
        [arrowTip, { x: arrowX + arrowSize * .28, y: arrowY + arrowSize * .25 }, { x: arrowX + arrowSize * .12, y: arrowY + arrowSize * .32 }, 7]
    ];
    for (const [start, control, end, count] of arrowCurves) {
        for (let i = 0; i <= count; i++) {
            const t = i / count;
            const inverse = 1 - t;
            adventureArrow.dots.push({
                x: inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
                y: inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * end.y,
                offsetX: 0,
                offsetY: 0,
                velocityX: 0,
                velocityY: 0,
                scatterStrength: 1,
                phase: Math.random() * Math.PI * 2
            });
        }
    }
    adventurePromptTriggered = false;
}

let adventureArrow = null;

buildAdventurePrompt();
document.fonts.ready.then(() => {
    if (!adventurePromptTriggered) buildAdventurePrompt();
});

function drawAdventurePrompt(now) {
    const cameraX = getCameraX();
    const mouseWorldX = mouseX + cameraX;
    adventureContext.clearRect(cameraX, 0, window.innerWidth, window.innerHeight);
    if (adventureParticles.length === 0) return;

    adventureContext.save();
    adventureContext.beginPath();
    const adventureClipLeft = portalWorldActive ? adventurePortalWorldX : 0;
    adventureContext.rect(
        adventureClipLeft,
        0,
        Math.max(0, adventureCanvas.width - adventureClipLeft),
        Math.max(0, getGroundY() - 2)
    );
    adventureContext.clip();

    const dt = Math.min((now - (drawAdventurePrompt.lastTime || now)) / 1000, .04);
    drawAdventurePrompt.lastTime = now;
    const ambientPortalStart = adventureArrow ? adventureArrow.start + 850 : Infinity;
    const ambientPortalX = adventurePortalWorldX;
    const ambientPortalY = getGroundY() - 105;
    const ambientPortalScreenX = ambientPortalX - cameraX;
    const ambientPortalVisible = ambientPortalScreenX > -110 && ambientPortalScreenX < window.innerWidth + 110;
    const ambientPortalReady = adventurePromptTriggered && adventureArrow &&
        now >= ambientPortalStart && ambientPortalVisible && !portalWorldActive;
    const ambientPortalProgress = ambientPortalReady
        ? Math.max(0, Math.min((now - ambientPortalStart) / 1350, 1))
        : 0;
    const ambientPortalAppear = ambientPortalProgress * ambientPortalProgress *
        (3 - 2 * ambientPortalProgress);
    const ambientPortalSpin = now * .0015;
    if (!portalWorldActive) {
        adventureContext.globalAlpha = .68;
        for (let particleIndex = 0; particleIndex < adventureAmbientParticles.length; particleIndex++) {
            const particle = adventureAmbientParticles[particleIndex];
            const floatX = Math.sin(now * particle.speed + particle.phase) * particle.floatX;
            const floatY = Math.cos(now * particle.speed * .83 + particle.phase * 1.4) * particle.floatY;
            const baseX = particle.x + floatX;
            const baseY = particle.y + floatY;
            updateMouseRepulsion(particle, baseX, baseY, mouseWorldX, dt);
            let particleX = baseX + particle.offsetX;
            let particleY = baseY + particle.offsetY;
            if (ambientPortalAppear > 0) {
                const dx = particleX - ambientPortalX;
                const dy = particleY - ambientPortalY;
                const captureDistance = Math.hypot(dx * .78, dy);
                const captureT = Math.max(0, Math.min((captureDistance - 65) / 300, 1));
                const capture = ambientPortalAppear * (1 - captureT * captureT * (3 - 2 * captureT));
                if (capture > .005) {
                    registerParticleMotionSound(capture * .28, 1);
                    const angle = Math.atan2(dy, dx * .72) + ambientPortalSpin * 1.4;
                    const turbulence = Math.sin(angle * 5 + particle.phase + ambientPortalSpin * 2) * 11;
                    const rimX = ambientPortalX + Math.cos(angle) * (59 + turbulence);
                    const rimY = ambientPortalY + Math.sin(angle) * (98 + turbulence * 1.4);
                    particleX += (rimX - particleX) * capture;
                    particleY += (rimY - particleY) * capture;
                }
            }
            const screenX = particleX - cameraX;
            if (screenX < -4 || screenX > window.innerWidth + 4) continue;
            adventureContext.fillStyle = particle.color;
            adventureContext.beginPath();
            adventureContext.arc(particleX, particleY, particle.radius, 0, Math.PI * 2);
            adventureContext.fill();
        }
        adventureContext.globalAlpha = 1;
    }
    const signVisible = !adventurePromptTriggered || !adventurePromptBounds || (
        adventurePromptBounds.left - cameraX < window.innerWidth &&
        adventurePromptBounds.left + adventurePromptBounds.width - cameraX > 0
    );
    adventureContext.globalAlpha = .88;
    adventureContext.shadowBlur = 0;
    if (signVisible) for (const dot of adventureParticles) {
        const progress = adventurePromptTriggered
            ? Math.max(0, Math.min((now - adventurePromptStarted - dot.delay) / dot.duration, 1))
            : 0;
        if (adventurePromptTriggered && progress < 1) {
            registerParticleMotionSound(.72 * (1 - progress), 1);
        }
        const eased = 1 - Math.pow(1 - progress, 3);
        const floatX = Math.sin(now * .0017 + dot.phase) * dot.drift * (1 - eased)
            + Math.sin(now * .0007 + dot.phase * 2.3) * 12 * (1 - eased);
        const floatY = Math.cos(now * .0013 + dot.phase * 1.4) * dot.drift * (1 - eased)
            + Math.cos(now * .0009 + dot.phase * 1.8) * 9 * (1 - eased);
        const baseX = dot.startX + (dot.x - dot.startX) * eased + floatX;
        const baseY = dot.startY + (dot.y - dot.startY) * eased + floatY;
        const formationStrength = .2 + progress * .8;
        updateMouseRepulsion(dot, baseX, baseY, mouseWorldX, dt, formationStrength);
        const wobble = Math.sin(now * .003 + dot.phase) * .55;
        const currentX = baseX + dot.offsetX + wobble;
        const currentY = baseY + dot.offsetY + Math.cos(now * .0027 + dot.phase * 1.3) * .55;
        if (currentX < -dot.radius || currentX > window.innerWidth + dot.radius
            || currentY < -dot.radius || currentY > window.innerHeight + dot.radius) continue;
        adventureContext.fillStyle = dot.color;
        adventureContext.beginPath();
        adventureContext.arc(currentX, currentY, dot.radius, 0, Math.PI * 2);
        adventureContext.fill();
    }

    adventureContext.globalAlpha = 1;
    adventureContext.shadowBlur = 0;
    if (signVisible && adventurePromptTriggered && adventureArrow && now >= adventureArrow.start && !portalWorldActive) {
        if (!adventureArrow.soundPlayed) {
            adventureArrow.soundPlayed = true;
            playArrowNeonSound();
        }
        const ignite = Math.min((now - adventureArrow.start) / 1100, 1);
        const igniteFade = ignite * ignite * (3 - 2 * ignite);
        const flicker = ignite < 1
            ? [.08, 1, .2, .85, 0, 1, .35, .95, .12, 1][Math.floor(ignite * 10)]
            : 1;
        adventureContext.globalAlpha = flicker * igniteFade;
        adventureContext.shadowColor = "#2daaf0";
        adventureContext.shadowBlur = 5 + 14 * flicker;
        for (let i = 0; i < adventureArrow.dots.length; i++) {
            const dot = adventureArrow.dots[i];
            updateMouseRepulsion(dot, dot.x, dot.y, mouseWorldX, dt, dot.scatterStrength,
                mouseInside && ignite > .55);

            const dotX = dot.x + dot.offsetX;
            const dotY = dot.y + dot.offsetY;
            const dotRadius = 1.8 + (i % 4) * .38;
            const hue = 201 + (dotX / window.innerWidth) * 22;
            const lightness = 48 + (1 - dotY / window.innerHeight) * 13;
            adventureContext.fillStyle = `hsl(${hue}, 86%, ${lightness}%)`;
            adventureContext.beginPath();
            adventureContext.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
            adventureContext.fill();
        }
    }

    if (adventureArrow?.soundPlayed) {
        const arrowScreenX = adventureArrow.x - cameraX;
        if (arrowScreenX + adventureArrow.size < 0 ||
            arrowScreenX - adventureArrow.size > window.innerWidth) {
            stopArrowNeonSound();
        }
    }

    const portalStart = adventureArrow ? adventureArrow.start + 850 : Infinity;
    const portalScreenX = adventurePortalWorldX - cameraX;
    const portalIsVisible = portalScreenX > -110 && portalScreenX < window.innerWidth + 110;
    if (adventurePromptTriggered && adventureArrow && now >= portalStart && portalIsVisible && !stormCityDotsBuilt) {
        buildStormCityDots(getGroundY(), now);
    }
    if (adventurePromptTriggered && adventureArrow && now >= portalStart &&
        portalIsVisible && !portalWorldActive) {
        if (!adventureArrow.portalSoundPlayed) {
            adventureArrow.portalSoundPlayed = true;
            playPortalAppearSound();
        }
        const appearProgress = Math.min((now - portalStart) / 1450, 1);
        const appear = appearProgress * appearProgress * (3 - 2 * appearProgress);
        const portalX = adventurePortalWorldX;
        const portalY = getGroundY() - 105;
        const spin = now * .00075;
        adventureContext.globalAlpha = appear * (.82 + Math.sin(now * .002) * .12);
        const glowKey = `${portalX}:${portalY}`;
        if (portalGlowGradientKey !== glowKey) {
            portalGlowGradient = adventureContext.createRadialGradient(
                portalX, portalY, 4, portalX, portalY, 92
            );
            portalGlowGradient.addColorStop(0, "rgba(47, 184, 255, .17)");
            portalGlowGradient.addColorStop(.55, "rgba(35, 111, 220, .08)");
            portalGlowGradient.addColorStop(1, "rgba(15, 40, 100, 0)");
            portalGlowGradientKey = glowKey;
        }
        adventureContext.fillStyle = portalGlowGradient;
        adventureContext.beginPath();
        adventureContext.ellipse(portalX, portalY, 58, 92, 0, 0, Math.PI * 2);
        adventureContext.fill();
        adventureContext.shadowBlur = 0;

        const cloudColors = ["#35aaff", "#56c8ff", "#83e4ff", "#3989e8"];
        // A dense, rough-edged upright swirl with a clear open center.
        if (!portalCloudBuilt) {
            portalCloudParticles = Array.from({ length: 1040 }, (_, i) => {
                const source = adventureAmbientParticles[i % Math.max(1, adventureAmbientParticles.length)];
                return {
                    angle: Math.random() * Math.PI * 2,
                    band: Math.random() - .5,
                    phase: Math.random() * Math.PI * 2,
                    speed: .62 + Math.random() * .76,
                    direction: i % 2 === 0 ? 1 : -1,
                    colorGroup: i % 4,
                    radius: (source?.radius || 2.2) * (.72 + Math.random() * .48)
                };
            });
            portalCloudBuilt = true;
        }
        const cloudGroups = portalCloudDotGroups;
        for (const group of cloudGroups) group.length = 0;
        const cloudScale = .2 + appear * .8;
        for (const particle of portalCloudParticles) {
            const angle = particle.angle + spin * particle.speed * particle.direction * 1.65 +
                Math.sin(spin * 1.7 + particle.phase) * .2;
            const breathingBand = particle.band + Math.sin(spin * 1.4 + particle.phase) * .075;
            const curl = Math.sin(angle * 4.2 + particle.phase + spin * 1.3) * 13;
            const radiusX = (56 + breathingBand * 28 + curl) * cloudScale;
            const radiusY = (92 + breathingBand * 40 + curl * 1.55) * cloudScale;
            const dotX = portalX + Math.cos(angle) * radiusX;
            const dotY = portalY + Math.sin(angle) * radiusY;
            const radius = particle.radius * (.78 + breathingBand * .42);
            cloudGroups[particle.colorGroup].push([dotX, dotY, radius]);
        }
        adventureContext.globalAlpha = appear * .9;
        for (let group = 0; group < cloudGroups.length; group++) {
            adventureContext.fillStyle = cloudColors[group];
            adventureContext.beginPath();
            for (const [dotX, dotY, radius] of cloudGroups[group]) {
                adventureContext.moveTo(dotX + radius, dotY);
                adventureContext.arc(dotX, dotY, radius, 0, Math.PI * 2);
            }
            adventureContext.fill();
        }

        adventureContext.globalAlpha = appear * (.82 + Math.sin(now * .002) * .12);
    }
    adventureContext.globalAlpha = 1;
    adventureContext.shadowBlur = 0;
    adventureContext.restore();
}

function activateAdventurePromptAfterPassingPoint(now) {
    if (adventurePromptTriggered || x + 25 < adventureTriggerWorldX) return;

    adventurePromptTriggered = true;
    cityRevealPrompt.hidden = true;
    adventurePromptStarted = now;
    adventureArrowStart = now + 900;
    if (adventureArrow) adventureArrow.start = adventureArrowStart;
}

function spawnStormSplash(x, groundY, now) {
    for (let i = 0; i < 3; i++) {
        stormSplashParticles.push({
            x,
            y: groundY - 2,
            velocityX: (Math.random() - .5) * 150,
            velocityY: -65 - Math.random() * 100,
            radius: 1.1 + Math.random() * 1.5,
            color: Math.random() < .5 ? "#36baff" : "#8beaff",
            startedAt: now,
            lifetime: .32 + Math.random() * .18
        });
    }
    stormSplashRings.push({ x, y: groundY - 1, startedAt: now, lifetime: .34 });
}

function buildColoredOutlineInteriorMask(image) {
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    const pixelCount = width * height;
    const source = document.createElement("canvas");
    source.width = width;
    source.height = height;
    const context = source.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, width, height).data;
    const outlineLine = new Uint8Array(pixelCount);
    for (let i = 0, p = 0; i < pixelCount; i++, p += 4) {
        const red = pixels[p];
        const green = pixels[p + 1];
        const blue = pixels[p + 2];
        const magenta = red > 145 && blue > 145 && green < 155 &&
            red - green > 60 && blue - green > 60;
        const redOutline = red > 150 && green < 115 && blue < 130 &&
            red - green > 70 && red - blue > 45;
        outlineLine[i] = magenta || redOutline ? 1 : 0;
    }

    // Close small breaks in the colored hand-drawn boundaries so every
    // outlined building fills as one solid region.
    const barrier = new Uint8Array(pixelCount);
    // Keep the mask close to the magenta edge so the outline does not eat
    // into the building facade, while still sealing tiny hand-drawn gaps.
    const closeRadius = 2;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (!outlineLine[y * width + x]) continue;
            for (let dy = -closeRadius; dy <= closeRadius; dy++) {
                const nearY = y + dy;
                if (nearY < 0 || nearY >= height) continue;
                for (let dx = -closeRadius; dx <= closeRadius; dx++) {
                    const nearX = x + dx;
                    if (nearX >= 0 && nearX < width) barrier[nearY * width + nearX] = 1;
                }
            }
        }
    }

    const outside = new Uint8Array(pixelCount);
    const stack = new Int32Array(pixelCount);
    let stackSize = 0;
    const addOutside = (index) => {
        if (!barrier[index] && !outside[index]) {
            outside[index] = 1;
            stack[stackSize++] = index;
        }
    };
    for (let x = 0; x < width; x++) {
        addOutside(x);
        addOutside((height - 1) * width + x);
    }
    for (let y = 1; y < height - 1; y++) {
        addOutside(y * width);
        addOutside(y * width + width - 1);
    }
    while (stackSize) {
        const index = stack[--stackSize];
        const x = index % width;
        if (x > 0) addOutside(index - 1);
        if (x + 1 < width) addOutside(index + 1);
        if (index >= width) addOutside(index - width);
        if (index + width < pixelCount) addOutside(index + width);
    }

    const inside = new Uint8Array(pixelCount);
    let insideCount = 0;
    for (let i = 0; i < pixelCount; i++) {
        if (!outside[i] && !barrier[i]) {
            inside[i] = 1;
            insideCount++;
        }
    }

    // Drop tiny disconnected fills caused by stray magenta marks while keeping
    // each of the three large outlined building regions.
    const visited = new Uint8Array(pixelCount);
    const componentQueue = new Int32Array(pixelCount);
    const minimumBuildingArea = 1200;
    for (let i = 0; i < pixelCount; i++) {
        if (!inside[i] || visited[i]) continue;
        let head = 0;
        let tail = 0;
        componentQueue[tail++] = i;
        visited[i] = 1;
        while (head < tail) {
            const index = componentQueue[head++];
            const x = index % width;
            let neighbor;
            if (x > 0) {
                neighbor = index - 1;
                if (inside[neighbor] && !visited[neighbor]) {
                    visited[neighbor] = 1;
                    componentQueue[tail++] = neighbor;
                }
            }
            if (x + 1 < width) {
                neighbor = index + 1;
                if (inside[neighbor] && !visited[neighbor]) {
                    visited[neighbor] = 1;
                    componentQueue[tail++] = neighbor;
                }
            }
            if (index >= width) {
                neighbor = index - width;
                if (inside[neighbor] && !visited[neighbor]) {
                    visited[neighbor] = 1;
                    componentQueue[tail++] = neighbor;
                }
            }
            if (index + width < pixelCount) {
                neighbor = index + width;
                if (inside[neighbor] && !visited[neighbor]) {
                    visited[neighbor] = 1;
                    componentQueue[tail++] = neighbor;
                }
            }
        }
        if (tail < minimumBuildingArea) {
            for (let j = 0; j < tail; j++) inside[componentQueue[j]] = 0;
            insideCount -= tail;
        }
    }
    if (insideCount <= pixelCount * .015) return null;
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let lightTotal = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const pixelIndex = y * width + x;
            if (!inside[pixelIndex]) continue;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x + 1);
            maxY = Math.max(maxY, y + 1);
            const pixelOffset = pixelIndex * 4;
            const red = pixels[pixelOffset];
            const green = pixels[pixelOffset + 1];
            const blue = pixels[pixelOffset + 2];
            lightTotal += Math.sqrt((red * red * .24 + green * green * .58 + blue * blue * .18)) / 255;
        }
    }
    return {
        width,
        height,
        inside,
        meanLight: lightTotal / insideCount,
        bounds: { minX, minY, maxX, maxY }
    };
}

function buildStormCityDots(groundY, now) {
    stormCityDots = [];
    stormCityDotGroups = [];
    const entryCameraX = Math.max(0, adventurePortalWorldX - 25 - window.innerWidth * .35);
    const cameraAnchor = entryCameraX * stormBackgroundParallax;
    for (const imageIndex of [1, 2, 3]) {
        const image = stormArchitectureImages[imageIndex];
        if (!image.complete || !image.naturalWidth) return false;
    }

    stormBuildingRevealStarts.clear();
    stormLastBuildingRight = null;
    stormLastBuildingPassed = false;
    buildingDoorWorldX = null;
    buildingsPrompt.classList.remove("door-sign-on", "knocking");
    stormBuildingsPromptDismissed = postBuildingCityRevealActive;
    buildingsPrompt.hidden = true;

    for (const imageIndex of [1, 2, 3]) {
        if (!stormArchitectureMaskCache.has(imageIndex)) {
            stormArchitectureMaskCache.set(
                imageIndex,
                buildColoredOutlineInteriorMask(stormArchitectureImages[imageIndex])
            );
        }
    }

    // Each image is kept as its own view. Sample its actual pixels on a coarse
    // grid and use per-photo building silhouettes, leaving surrounding scenery
    // and sky out while preserving the original facade pixels.
    const sampleStep = 11;
    const gap = Math.max(22, window.innerWidth * .035);
    const viewWidth = Math.max(210, Math.min(window.innerWidth * .68, 560));
    const viewHeight = groundY * .9;
    // Reserve the first slot for the removed legacy skyline so the three
    // outlined building views stay in their established world positions.
    let viewIndex = 1;
    let nextViewLeft = cameraAnchor + viewWidth + gap;
    // Keep the Houston skyline sequence between Building 1 and Buildings 2.
    for (const imageIndex of [1, 3, 2]) {
        const image = stormArchitectureImages[imageIndex];
        if (!image.complete || !image.naturalWidth) continue;
        const outlineMask = stormArchitectureMaskCache.get(imageIndex);
        // Fine sampling on outlined buildings gives their edges a smoother
        // contour and fills narrow facade sections without changing the mask.
        const imageSampleStep = imageIndex === 2 ? 4 : imageIndex === 3 ? 3 : sampleStep;
        const sourceBounds = outlineMask
            ? outlineMask.bounds
            : null;
        const gridWidth = sourceBounds
            ? Math.ceil((sourceBounds.maxX - sourceBounds.minX) / imageSampleStep)
            : Math.ceil(image.naturalWidth / imageSampleStep);
        const gridHeight = sourceBounds
            ? Math.ceil((sourceBounds.maxY - sourceBounds.minY) / imageSampleStep)
            : Math.ceil(image.naturalHeight / imageSampleStep);
        const source = document.createElement("canvas");
        source.width = image.naturalWidth;
        source.height = image.naturalHeight;
        const sourceContext = source.getContext("2d", { willReadFrequently: true });
        sourceContext.drawImage(image, 0, 0);
        const pixels = sourceContext.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data;
        const sourceMeanLight = outlineMask?.meanLight ?? .42;

        const aspect = sourceBounds
            ? (sourceBounds.maxX - sourceBounds.minX) / (sourceBounds.maxY - sourceBounds.minY)
            : image.naturalWidth / image.naturalHeight;
        const buildingScale = imageIndex === 1 ? 1.12 : imageIndex === 3 ? 1.08 : 1;
        const width = Math.min(viewWidth * buildingScale, viewHeight * buildingScale * aspect);
        const height = width / aspect;
        const left = nextViewLeft;
        if (imageIndex === 2) stormLastBuildingRight = left + width;
        const buildingMasks = stormArchitectureBuildingMasks[imageIndex];
        const maskBottom = sourceBounds ? 1 : Math.max(...buildingMasks.flat().map((point) => point[1]));
        const top = groundY - height * maskBottom + (imageIndex === 3 ? 24 : 0);
        const cellWidth = width / gridWidth;
        const cellHeight = height / gridHeight;
        const maskInsetPixels = 0;
        for (let row = 0; row < gridHeight; row++) {
            for (let col = 0; col < gridWidth; col++) {
                const u = sourceBounds
                    ? Math.min((sourceBounds.minX + (col + .5) * imageSampleStep) / image.naturalWidth,
                        (sourceBounds.maxX - .5) / image.naturalWidth)
                    : (col + .5) / gridWidth;
                const v = sourceBounds
                    ? Math.min((sourceBounds.minY + (row + .5) * imageSampleStep) / image.naturalHeight,
                        (sourceBounds.maxY - .5) / image.naturalHeight)
                    : (row + .5) / gridHeight;
                let insideBuilding = false;
                let sampleU = u;
                let sampleV = v;
                const isInsidePolygon = (polygon, pointU, pointV, inset = 0) => {
                    let inside = false;
                    let edgeDistanceSquared = Infinity;
                    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                        const [xi, yi] = polygon[i];
                        const [xj, yj] = polygon[j];
                        if ((yi > pointV) !== (yj > pointV) &&
                            pointU < (xj - xi) * (pointV - yi) / (yj - yi) + xi) inside = !inside;
                        const ax = xi * image.naturalWidth;
                        const ay = yi * image.naturalHeight;
                        const segmentX = (xj - xi) * image.naturalWidth;
                        const segmentY = (yj - yi) * image.naturalHeight;
                        const lengthSquared = segmentX * segmentX + segmentY * segmentY;
                        const t = lengthSquared
                            ? Math.max(0, Math.min(((pointU * image.naturalWidth - ax) * segmentX +
                                (pointV * image.naturalHeight - ay) * segmentY) / lengthSquared, 1))
                            : 0;
                        const dx = pointU * image.naturalWidth - (ax + t * segmentX);
                        const dy = pointV * image.naturalHeight - (ay + t * segmentY);
                        edgeDistanceSquared = Math.min(edgeDistanceSquared, dx * dx + dy * dy);
                    }
                    return inside && edgeDistanceSquared >= inset * inset;
                };
                const isInsideMask = (pointU, pointV) => {
                    if (outlineMask) {
                        const maskX = Math.min(outlineMask.width - 1,
                            Math.floor(pointU * outlineMask.width));
                        const maskY = Math.min(outlineMask.height - 1,
                            Math.floor(pointV * outlineMask.height));
                        const insideOutlinedArea = outlineMask.inside[
                            maskY * outlineMask.width + maskX
                        ] === 1;
                        return insideOutlinedArea;
                    }
                    for (const polygon of buildingMasks) {
                        if (isInsidePolygon(polygon, pointU, pointV, maskInsetPixels)) return true;
                    }
                    return false;
                };
                insideBuilding = isInsideMask(u, v);

                // At the silhouette, a cell can contain building pixels even
                // when its center falls just outside the polygon. Sample a few
                // interior candidates and place the dot at an inside point.
                // This fills clipped-looking edges without putting dots past
                // the traced red boundary.
                if (!insideBuilding && outlineMask) {
                    let closestCandidate = null;
                    let closestDistance = Infinity;
                    const edgeOffsets = [.1, .5, .9];
                    for (const cellOffsetY of edgeOffsets) {
                        for (const cellOffsetX of edgeOffsets) {
                            const candidateU = sourceBounds
                                ? Math.min((sourceBounds.minX + (col + cellOffsetX) * imageSampleStep) / image.naturalWidth,
                                    (sourceBounds.maxX - .5) / image.naturalWidth)
                                : (col + cellOffsetX) / gridWidth;
                            const candidateV = sourceBounds
                                ? Math.min((sourceBounds.minY + (row + cellOffsetY) * imageSampleStep) / image.naturalHeight,
                                    (sourceBounds.maxY - .5) / image.naturalHeight)
                                : (row + cellOffsetY) / gridHeight;
                            const distance = (cellOffsetX - .5) ** 2 + (cellOffsetY - .5) ** 2;
                            if (distance < closestDistance && isInsideMask(candidateU, candidateV)) {
                                closestCandidate = [candidateU, candidateV];
                                closestDistance = distance;
                            }
                        }
                    }
                    if (closestCandidate) {
                        insideBuilding = true;
                        [sampleU, sampleV] = closestCandidate;
                    }
                }
                if (!insideBuilding) continue;
                let textureU = sampleU;
                let textureV = sampleV;
                if (imageIndex === 3) {
                    // The outlined tower is partly hidden by neighboring
                    // facades in the source photo. Continue its visible facade
                    // texture through those occluded portions.
                    if (sampleU >= .24 && sampleU <= .267 && sampleV >= .36 && sampleV <= .76) {
                        textureU = .215 + ((sampleU - .24) / (.267 - .24)) * .02;
                    } else if (sampleU >= .075 && sampleU <= .225 && sampleV >= .76 && sampleV <= .89) {
                        textureV = .70 + ((sampleV - .76) / (.89 - .76)) * .045;
                    }
                }
                const sourceX = Math.min(image.naturalWidth - 1, Math.floor(textureU * image.naturalWidth));
                const sourceY = Math.min(image.naturalHeight - 1, Math.floor(textureV * image.naturalHeight));
                const offset = (sourceY * image.naturalWidth + sourceX) * 4;
                const index = row * gridWidth + col;
                const brightness = (pixels[offset] + pixels[offset + 1] + pixels[offset + 2]) / 3;
                const noise = Math.sin((index + 1) * 12.9898 + (viewIndex + 1) * 78.233) * 43758.5453;
                const variation = noise - Math.floor(noise);
                const noiseY = Math.sin((index + 1) * 39.346 + (viewIndex + 1) * 11.135) * 24634.6345;
                const variationY = noiseY - Math.floor(noiseY);
                let displayU = sampleU;
                let displayV = sampleV;
                if (sourceBounds) {
                    displayU = (sampleU - sourceBounds.minX / image.naturalWidth) /
                        ((sourceBounds.maxX - sourceBounds.minX) / image.naturalWidth);
                    displayV = (sampleV - sourceBounds.minY / image.naturalHeight) /
                        ((sourceBounds.maxY - sourceBounds.minY) / image.naturalHeight);
                }
                const dotColor = imageIndex >= 1
                    ? (() => {
                        // Preserve facade and sunset-reflection color changes,
                        // remapped into the scene's blue/cyan particle palette.
                        const red = pixels[offset];
                        const green = pixels[offset + 1];
                        const blue = pixels[offset + 2];
                        const sourceLight = Math.sqrt((red * red * .24 + green * green * .58 + blue * blue * .18)) / 255;
                        const light = imageIndex === 2
                            ? Math.max(.12, Math.min(.54, .28 + (sourceLight - sourceMeanLight) * .65))
                            : Math.max(.2, Math.min(.72, .42 + (sourceLight - sourceMeanLight) * .75));
                        const warm = Math.max(0, red - blue) / 255;
                        const r = Math.round(15 + light * 70 + warm * 5);
                        const g = Math.round(52 + light * 130 + warm * 4);
                        const b = Math.round(82 + light * 150);
                        return `rgb(${r}, ${g}, ${b})`;
                    })()
                    : brightness > 205 ? "#9be8ff"
                    : brightness > 155 ? "#45b5ef"
                    : brightness > 95 ? "#3284b2"
                    : brightness > 45 ? "#24618a"
                    : "#1b4a68";
                stormCityDots.push({
                    buildingIndex: imageIndex,
                    buildingViewLeft: left,
                    buildingViewRight: left + width,
                    x: left + (imageIndex >= 1 ? displayU * gridWidth : col + .38 + variation * .24) * cellWidth,
                    y: top + (imageIndex >= 1 ? displayV * gridHeight : row + .38 + variationY * .24) * cellHeight,
                    radius: outlineMask
                        ? Math.min((2.05 + brightness / 250) * (.9 + variation * .2), cellWidth * .58, cellHeight * .58)
                        : (2.05 + brightness / 250) * (.9 + variation * .2),
                    color: dotColor,
                    delay: (1 - row / gridHeight) * 900 + Math.random() * 150,
                    startedAt: now
                });
            }
        }
        const nextGap = imageIndex === 1
            ? Math.max(24, window.innerWidth * .04)
            : Math.max(34, window.innerWidth * .055);
        nextViewLeft = left + width + nextGap;
        viewIndex++;
    }
    const dotsByBuilding = new Map();
    for (const dot of stormCityDots) {
        let group = dotsByBuilding.get(dot.buildingIndex);
        if (!group) {
            group = {
                buildingIndex: dot.buildingIndex,
                left: dot.buildingViewLeft,
                right: dot.buildingViewRight,
                dots: []
            };
            dotsByBuilding.set(dot.buildingIndex, group);
        }
        group.dots.push(dot);
    }
    stormCityDotGroups = [...dotsByBuilding.values()];
    const renderScale = Math.min(window.devicePixelRatio || 1, 1.5);
    for (const building of stormCityDotGroups) {
        building.top = building.dots.reduce((top, dot) => Math.min(top, dot.y), groundY);
        building.height = Math.max(1, groundY - building.top);
        building.width = Math.max(1, building.right - building.left);
        building.dissolveProgress = 0;
        building.canvas = document.createElement("canvas");
        building.canvas.width = Math.ceil(building.width * renderScale);
        building.canvas.height = Math.ceil(building.height * renderScale);
        const buildingContext = building.canvas.getContext("2d");
        buildingContext.setTransform(renderScale, 0, 0, renderScale, 0, 0);
        for (const dot of building.dots) {
            if (building.buildingIndex === 3 && dot.y >= groundY) continue;
            buildingContext.fillStyle = dot.color;
            buildingContext.beginPath();
            buildingContext.arc(dot.x - building.left, dot.y - building.top, dot.radius, 0, Math.PI * 2);
            buildingContext.fill();
        }
    }
    stormCityDotsBuilt = true;
    return true;
}

function drawStormRain(now, groundY) {
    const elapsed = lastStormFrameTime ? Math.min((now - lastStormFrameTime) / 1000, .04) : 1 / 60;
    const cameraOffset = getCameraX() * stormBackgroundParallax;
    let cityGraphicVisibleInCamera = false;
    if (cityRevealStarted && !redPathActive) {
        const city = getCityTiming();
        const lineToImage = city.drawingStartX - city.orbStartX;
        const imageStartOffset = city.drawingStartX - city.imageX;
        const imageScreenX = city.imageX - (getCameraX() - cityCameraAnchor);
        const revealedWidth = Math.min(
            Math.max(cityLineProgress - lineToImage, 0),
            city.imageWidth - imageStartOffset
        ) + imageStartOffset;
        cityGraphicVisibleInCamera = revealedWidth > 0 &&
            imageScreenX < window.innerWidth && imageScreenX + revealedWidth > 0 &&
            city.imageY < groundY && city.imageY + city.imageHeight > 0;
    }
    const barrierScreenX = portalWorldActive
        ? Math.max(0, Math.min(window.innerWidth, adventurePortalWorldX - getCameraX()))
        : 0;
    particleContext.save();
    lastStormFrameTime = now;

    if (stormRainDrops.length === 0) {
        const cameraAnchor = cameraOffset;
        for (let i = 0; i < 54; i++) {
            stormRainDrops.push({
                x: cameraAnchor + Math.random() * window.innerWidth,
                y: Math.random() * groundY,
                speed: 430 + Math.random() * 420,
                radius: 1.3 + Math.random() * 1.4,
                color: Math.random() < .5 ? "#38aaff" : "#72dcff",
                drift: -22 - Math.random() * 35
            });
        }
    }
    if (!stormRainFullScreenReset) {
        for (const drop of stormRainDrops) {
            drop.x = cameraOffset + Math.random() * window.innerWidth;
            drop.y = Math.random() * groundY;
        }
        stormRainFullScreenReset = true;
    }
    if (!stormCityDotsBuilt) buildStormCityDots(groundY, now);

    const playerScreenX = x - getCameraX() + 25;
    const approachDistance = Math.max(120, window.innerWidth * .22);
    for (const building of stormCityDotGroups) {
        const buildingScreenLeft = building.left - cameraOffset;
        const buildingScreenRight = building.right - cameraOffset;
        if (buildingScreenRight < -8 || buildingScreenLeft > window.innerWidth + 8) continue;
        if (buildingScreenLeft > playerScreenX + approachDistance) continue;
        if (portalWorldActive && buildingScreenRight <= barrierScreenX) continue;
        let revealStartedAt = stormBuildingRevealStarts.get(building.buildingIndex);
        if (revealStartedAt === undefined) {
            revealStartedAt = now;
            stormBuildingRevealStarts.set(building.buildingIndex, revealStartedAt);
        }
        const revealProgress = Math.max(0, Math.min((now - revealStartedAt) / 1550, 1));
        const revealEase = 1 - Math.pow(1 - revealProgress, 3);
        const dissolveStep = elapsed / .8;
        building.dissolveProgress = Math.max(0, Math.min(1,
            building.dissolveProgress + (cityGraphicVisibleInCamera ? dissolveStep : -dissolveStep)
        ));
        const dissolveEase = building.dissolveProgress * building.dissolveProgress *
            (3 - 2 * building.dissolveProgress);
        const visibleHeight = building.height * revealEase * (1 - dissolveEase);
        if (visibleHeight <= 0) continue;
        const screenLeft = building.left - cameraOffset;
        const clipLeft = Math.max(0, screenLeft);
        const clipRight = Math.min(window.innerWidth, screenLeft + building.width);
        if (clipRight <= clipLeft) continue;
        const screenTop = groundY - visibleHeight;
        particleContext.save();
        particleContext.beginPath();
        particleContext.rect(clipLeft, screenTop, clipRight - clipLeft, visibleHeight);
        particleContext.clip();
        particleContext.globalAlpha = .92;
        particleContext.drawImage(building.canvas, screenLeft, building.top, building.width, building.height);
        particleContext.restore();
    }
    particleContext.globalAlpha = 1;

    particleContext.save();
    particleContext.beginPath();
    particleContext.rect(0, 0, window.innerWidth, window.innerHeight);
    particleContext.clip();
    const rainOpacity = 1;
    particleContext.globalAlpha = rainOpacity;
    for (const drop of stormRainDrops) {
        drop.x += drop.drift * elapsed;
        drop.y += drop.speed * elapsed;
        const screenX = drop.x - cameraOffset;
        if (drop.y >= groundY) {
            spawnStormSplash(drop.x, groundY, now);
            drop.x = cameraOffset + Math.random() * window.innerWidth;
            drop.y = -Math.random() * groundY * .35;
            drop.speed = 430 + Math.random() * 420;
        } else if (screenX < -20 || screenX > window.innerWidth + 20) {
            drop.x = cameraOffset + Math.random() * window.innerWidth;
            drop.y = -Math.random() * groundY * .25;
        }

        const drawX = drop.x - cameraOffset;
        particleContext.fillStyle = drop.color;
        particleContext.beginPath();
        particleContext.arc(drawX, drop.y, drop.radius, 0, Math.PI * 2);
        particleContext.fill();
        particleContext.fillStyle = `rgba(220, 249, 255, ${.8 * rainOpacity})`;
        particleContext.beginPath();
        particleContext.arc(drawX - drop.radius * .3, drop.y - drop.radius * .3, drop.radius * .27, 0, Math.PI * 2);
        particleContext.fill();
    }

    for (let i = stormSplashParticles.length - 1; i >= 0; i--) {
        const splash = stormSplashParticles[i];
        const age = (now - splash.startedAt) / 1000;
        const progress = age / splash.lifetime;
        if (progress >= 1) {
            stormSplashParticles.splice(i, 1);
            continue;
        }
        const px = splash.x + splash.velocityX * age - cameraOffset;
        const py = splash.y + splash.velocityY * age + 250 * age * age;
        particleContext.globalAlpha = 1 - progress;
        particleContext.fillStyle = splash.color;
        particleContext.beginPath();
        particleContext.arc(px, py, splash.radius * (1 - progress * .35), 0, Math.PI * 2);
        particleContext.fill();
    }
    particleContext.globalAlpha = 1;

    for (let i = stormSplashRings.length - 1; i >= 0; i--) {
        const ring = stormSplashRings[i];
        const progress = (now - ring.startedAt) / (ring.lifetime * 1000);
        if (progress >= 1) {
            stormSplashRings.splice(i, 1);
            continue;
        }
        particleContext.globalAlpha = 1 - progress;
        particleContext.strokeStyle = "#62d5ff";
        particleContext.lineWidth = 1.5;
        particleContext.beginPath();
        particleContext.ellipse(ring.x - cameraOffset, ring.y, 1.5 + progress * 8, .8 + progress * 2.5, 0, 0, Math.PI * 2);
        particleContext.stroke();
    }
    particleContext.globalAlpha = 1;
    particleContext.restore();
    particleContext.restore();
}

function updateBuildingsPrompt() {
    if (redPathActive) {
        buildingsPrompt.hidden = true;
        return;
    }
    if (postBuildingCityRevealActive) {
        buildingsPrompt.hidden = true;
        return;
    }
    if (portalWorldActive && stormLastBuildingRight !== null) {
        const cameraX = getCameraX();
        const playerScreenX = x - cameraX + 25;
        const lastBuildingScreenRight = stormLastBuildingRight - cameraX * stormBackgroundParallax;
        const clearPastBuildingGap = Math.max(60, window.innerWidth * .04);
        if (stormBuildingRevealStarts.has(2) &&
            lastBuildingScreenRight <= playerScreenX - clearPastBuildingGap) {
            if (!stormLastBuildingPassed) {
                stormLastBuildingPassed = true;
                // Fix the doorway in world coordinates; the camera then scrolls
                // past it with the rest of the scene.
                buildingDoorWorldX = x + 50 + 170;
                buildDoorDotField();
                doorNeonIgniteStarted = performance.now();
                buildingsPrompt.classList.add("door-sign-on");
                playArrowNeonSound({ startAt: 1, volume: .055, playbackRate: 1.35, fadeDuration: 1500 });
            }
        }
    }

    buildingsPrompt.hidden = !stormLastBuildingPassed || stormBuildingsPromptDismissed;
    if (!buildingsPrompt.hidden && buildingDoorWorldX !== null) {
        buildingsPrompt.style.left = `${buildingDoorWorldX - getCameraX()}px`;
        buildingsPrompt.style.top = `${getGroundY() - 164}px`;
    }
}

function buildDoorDotField() {
    if (doorDotFieldBuilt || !doorDotCanvas) return;

    const width = 84;
    const height = 156;
    const scale = Math.max(1, window.devicePixelRatio || 1);
    const context = doorDotCanvas.getContext("2d");
    doorDotCanvas.width = Math.round(width * scale);
    doorDotCanvas.height = Math.round(height * scale);
    context.scale(scale, scale);

    const step = 5;
    for (let y = 2.5, row = 0; y <= height - 2.5; y += step, row++) {
        for (let x = 2.5, col = 0; x <= width - 2.5; x += step, col++) {
            const noiseValue = Math.sin(col * 12.9898 + row * 78.233) * 43758.5453;
            const variation = noiseValue - Math.floor(noiseValue);
            const outerFrame = x <= 7.5 || x >= width - 7.5 || y <= 7.5 || y >= height - 7.5;
            const inPanel = x >= 12.5 && x <= 72.5 &&
                ((y >= 17.5 && y <= 67.5) || (y >= 82.5 && y <= 132.5));
            const panelEdge = inPanel && (
                Math.abs(x - 12.5) < 2 || Math.abs(x - 72.5) < 2 ||
                Math.abs(y - 17.5) < 2 || Math.abs(y - 67.5) < 2 ||
                Math.abs(y - 82.5) < 2 || Math.abs(y - 132.5) < 2
            );
            const knobDot = Math.hypot(x - 67.5, y - 97.5) < 5.5;

            let lightness = 32 + variation * 15;
            let radius = 1.3 + variation * .45;
            const hue = 197 + variation * 9;
            if (inPanel) lightness -= 7;
            if (outerFrame) {
                lightness += 13;
                radius += .12;
            }
            if (panelEdge) {
                lightness += 11;
                radius = 1.55;
            }
            if (knobDot) {
                lightness = 76 + variation * 8;
                radius = 2;
            }

            context.fillStyle = `hsl(${hue}, 82%, ${Math.max(20, Math.min(86, lightness))}%)`;
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fill();
        }
    }
    doorDotFieldBuilt = true;
}

function updateFallTransition() {
    if (!fallTransitionActive && floorParticles.length === 0 && (!portalWorldActive || redPathActive) &&
        !stormRainWasActive && !redPathActive) return;
    particleContext.clearRect(0, 0, window.innerWidth, window.innerHeight);

    const now = performance.now();
    if (portalWorldActive && !redPathActive && portalEnteredAt) {
        drawStormRain(now, getGroundY());
        if (!stormRainWasActive) {
            showSettingIntro("Downtown Houston, Texas — a rainy day");
            startPortalRainAudio();
        }
        stormRainWasActive = true;
    } else if (stormRainWasActive) {
        stormRainDrops = [];
        stormSplashParticles = [];
        stormSplashRings = [];
        stormCityDots = [];
        stormCityDotGroups = [];
        stormCityDotsBuilt = false;
        lastStormFrameTime = 0;
        stormRainWasActive = false;
    }
    if (redPathActive && cubeLanded && redHandStartedAt) drawRedFoodSequence(now);
    if (fallTransitionActive) {
        const elapsed = now - fallTransitionStartedAt;
        fallProgress = Math.min(elapsed / fallTransitionDuration, 1);

        let veilOpacity;
        if (fallProgress < .36) {
            veilOpacity = fallProgress / .36;
        } else if (fallProgress < .68) {
            veilOpacity = 1;
        } else {
            veilOpacity = (1 - fallProgress) / .32;
        }
        fallVeil.style.opacity = String(Math.max(0, Math.min(veilOpacity, 1)));
    }

    for (let i = floorParticles.length - 1; i >= 0; i--) {
        const particle = floorParticles[i];
        if (now < particle.startedAt) continue;
        const seconds = (now - particle.startedAt) / 1000;
        const lifeProgress = Math.min(seconds / particle.lifetime, 1);
        if (lifeProgress >= 1) {
            floorParticles.splice(i, 1);
            continue;
        }

        const currentX = particle.startX + particle.velocityX * seconds;
        const currentY = particle.startY + particle.velocityY * seconds + .5 * particle.gravity * seconds * seconds;

        if (
            currentX >= -12 && currentX <= window.innerWidth + 12 &&
            currentY >= -12 && currentY <= window.innerHeight + 12
        ) {
            const fadeProgress = Math.max(
                0,
                (lifeProgress - particle.fadeStart) / (1 - particle.fadeStart)
            );
            particleContext.globalAlpha = 1 - fadeProgress;
            particleContext.fillStyle = particle.color;
            particleContext.beginPath();
            if (particle.shape === "shard") {
                const rotation = (particle.rotation + particle.spin * seconds) * Math.PI / 180;
                const cos = Math.cos(rotation);
                const sin = Math.sin(rotation);
                const points = [
                    [0, -particle.radius * 1.5],
                    [particle.radius * .45, -particle.radius * .12],
                    [particle.radius * .18, particle.radius],
                    [-particle.radius * .28, particle.radius * .18]
                ].map(([px, py]) => [
                    currentX + px * cos - py * sin,
                    currentY + px * sin + py * cos
                ]);
                particleContext.moveTo(points[0][0], points[0][1]);
                for (let pointIndex = 1; pointIndex < points.length; pointIndex++) {
                    particleContext.lineTo(points[pointIndex][0], points[pointIndex][1]);
                }
                particleContext.closePath();
            } else if (particle.shape === "pixel") {
                particleContext.fillRect(
                    currentX - particle.radius,
                    currentY - particle.radius,
                    particle.radius * 2,
                    particle.radius * 2
                );
                particleContext.globalAlpha = 1;
                continue;
            } else {
                particleContext.arc(currentX, currentY, particle.radius, 0, Math.PI * 2);
            }
            particleContext.fill();
            particleContext.globalAlpha = 1;
        }
    }

    if (fallTransitionActive && fallProgress >= .48 && !redPathActive) {
        redPathActive = true;
        continueCameraLocked = false;
        portalWorldActive = false;
        portalEnteredAt = 0;
        adventureParticles = [];
        adventureAmbientParticles = [];
        floorParticles = [];
        particleContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
        stormRainDrops = [];
        stormSplashParticles = [];
        stormSplashRings = [];
        stormCityDots = [];
        stormCityDotGroups = [];
        stormCityDotsBuilt = false;
        stormRainWasActive = false;
        world.classList.add("red-world");
        cityRevealPrompt.hidden = true;
        continuePrompt.hidden = true;
        buildingsPrompt.hidden = true;
        inspectCopy.hidden = true;
        settingIntro.hidden = true;
        settingIntro.classList.remove("is-visible");
        controls.classList.remove("is-visible");
        adventureContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

    if (fallTransitionActive && fallProgress >= .91 && !landingBurstStarted) {
        landingBurstStarted = true;
        spawnFloorBurst(
            x - getCameraX() + 25,
            getGroundY() - 2,
            115,
            ["#ff334f", "#ff6675", "#ffc1c7", "#ffffff"],
            210,
            330,
            300,
            1.1
        );
    }

    if (fallTransitionActive && fallProgress >= 1) {
        playRedLandingThump();
        fallTransitionActive = false;
        cubeLanded = true;
        showSettingIntro("POST Food Market");
        beginRedHandSequence(now);
        fallVeil.hidden = true;
        fallVeil.style.opacity = "0";
        fallProgress = 0;
    }

    if (redPathActive && cubeLanded && redHandStartedAt) drawRedHandScene(now);
}

function redFoodStageCenter(target) {
    const dimensions = getRedHandDimensions();
    const elapsed = redHandStartedAt ? Math.max(0, performance.now() - redHandStartedAt) : redHandRiseDuration;
    const riseProgress = Math.max(0, Math.min(1, elapsed / redHandRiseDuration));
    const riseEase = riseProgress * riseProgress * (3 - 2 * riseProgress);
    const lowerProgress = redHandExitStartedAt
        ? Math.max(0, Math.min(1, (performance.now() - redHandExitStartedAt) / redHandLowerDuration))
        : 0;
    const lowerEase = lowerProgress * lowerProgress * (3 - 2 * lowerProgress);
    const handTop = getGroundY() - dimensions.height * riseEase + dimensions.height * lowerEase;
    const handLeft = x - getCameraX() + 25 - dimensions.width * .5;
    const palmX = handLeft + dimensions.width * redHandPalmPoint.x;
    const palmY = handTop + dimensions.height * redHandPalmPoint.y;
    return {
        x: palmX - (target?.centerOffsetX || 0),
        y: palmY - (target?.centerOffsetY || 0)
    };
}

function buildRedFoodTarget(index, image) {
    const hand = getRedHandDimensions();
    const isBurger = index === 3;
    // Burger.webp is a portrait with substantial empty red background above
    // and below the food. Crop that away first so the burger itself can be
    // rendered at the same readable scale as the other foods.
    const crop = isBurger
        ? { x: image.naturalWidth * .025, y: image.naturalHeight * .18,
            width: image.naturalWidth * .95, height: image.naturalHeight * .64 }
        : { x: 0, y: 0, width: image.naturalWidth, height: image.naturalHeight };
    const maxWidth = Math.max(200, Math.min(window.innerWidth * .68, hand.width * 1.05));
    const maxHeight = Math.max(140, Math.min(getGroundY() * .48, hand.height * .48));
    const scale = Math.min(maxWidth / crop.width, maxHeight / crop.height) *
        (index === 2 ? .82 : 1);
    const width = Math.max(1, Math.round(crop.width * scale));
    const height = Math.max(1, Math.round(crop.height * scale));
    const sample = document.createElement("canvas");
    sample.width = width;
    sample.height = height;
    const sampleContext = sample.getContext("2d", { willReadFrequently: true });
    sampleContext.filter = index === 2
            ? "saturate(1.45) brightness(1.12) contrast(1.05)"
            : "saturate(1.32) brightness(1.1) contrast(1.04)";
    sampleContext.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);
    sampleContext.filter = "none";
    const pixels = sampleContext.getImageData(0, 0, width, height).data;

    const outlineImage = index === 0 ? redFoodTacoOutlineImage
        : index === 1 ? redFoodPhoOutlineImage
            : index === 2 ? redFoodPizzaOutlineImage
                : index === 3 ? redFoodBurgerOutlineImage : null;
    // The burger photo and its magenta tracing can use different pixel sizes.
    // Convert the photo crop to normalized coordinates before sampling the mask.
    const outlineCrop = isBurger && outlineImage?.naturalWidth && outlineImage?.naturalHeight
        ? {
            x: crop.x / image.naturalWidth * outlineImage.naturalWidth,
            y: crop.y / image.naturalHeight * outlineImage.naturalHeight,
            width: crop.width / image.naturalWidth * outlineImage.naturalWidth,
            height: crop.height / image.naturalHeight * outlineImage.naturalHeight
        }
        : crop;
    let maskPixels = isBurger
        ? buildMagentaOutlineSpanMask(outlineImage, width, height, outlineCrop)
        : index === 2
        ? buildPizzaOutlineMask(outlineImage, width, height)
        : redFoodOutlineFiles[index]
            ? buildMagentaOutlineMask(outlineImage, width, height, index, isBurger ? crop : null)
            : buildRedFoodShapeMask(index, width, height);
    // Keep a food visible if an outline asset is missing, unreadable, or has
    // no detectable enclosed area; valid outline masks remain the source.
    let maskedPixelCount = 0;
    for (let pixel = 3; pixel < maskPixels.length; pixel += 4) {
        if (maskPixels[pixel] >= 128) maskedPixelCount++;
    }
    const maskCoverage = maskedPixelCount / (width * height);
    if (maskCoverage < (isBurger ? .1 : index === 2 ? .16 : .005)) {
        // A broken magenta trace gets a second magenta-derived mask attempt;
        // never replace the burger tracing with a guessed shape.
        maskPixels = isBurger
            ? buildMagentaOutlineMask(outlineImage, width, height, index, outlineCrop)
            : buildRedFoodShapeMask(index, width, height);
    }
    const dots = [];
    const step = index === 2 || isBurger ? 1.5 : 1.7;
    for (let y = 2; y < height; y += step) {
        for (let x = 2; x < width; x += step) {
            const jitterXSeed = Math.sin(x * 91.7 + y * 17.3) * 43758.5453;
            const jitterYSeed = Math.sin(x * 23.1 + y * 73.9) * 24634.6345;
            const jitterXAmount = 1.5;
            const jitterYAmount = 1.5;
            const jitterX = ((jitterXSeed - Math.floor(jitterXSeed)) - .5) * jitterXAmount;
            const jitterY = ((jitterYSeed - Math.floor(jitterYSeed)) - .5) * jitterYAmount;
            const sampleX = Math.max(0, Math.min(width - 1, Math.round(x + jitterX)));
            const sampleY = Math.max(0, Math.min(height - 1, Math.round(y + jitterY)));
            const offset = (sampleY * width + sampleX) * 4;
            if (maskPixels[offset + 3] < 128) continue;
            const depthNoise = Math.abs(Math.sin(sampleX * 12.9898 + sampleY * 78.233) * 43758.5453) % 1;
            const animated = (sampleX * 7 + sampleY * 11) % 37 === 0;
            dots.push({
                x: sampleX - width * .5,
                y: sampleY - height * .5,
                rgb: [pixels[offset], pixels[offset + 1], pixels[offset + 2]],
                color: `rgb(${pixels[offset]},${pixels[offset + 1]},${pixels[offset + 2]})`,
                radius: (index === 2 ? 1.32 : 1.25) +
                    (pixels[offset] + pixels[offset + 1] + pixels[offset + 2]) / 765 * .48 +
                    ((sampleX * 17 + sampleY * 31) % 4) * .08,
                delay: ((sampleX * 13 + sampleY * 7) % 101) / 101 * 230,
                phase: ((sampleX * 19 + sampleY * 23) % 360) * Math.PI / 180,
                depth: depthNoise,
                animated
            });
        }
    }

    let centerOffsetX = 0;
    let centerOffsetY = 0;
    if (dots.length) {
        for (const dot of dots) {
            centerOffsetX += dot.x;
            centerOffsetY += dot.y;
        }
        centerOffsetX /= dots.length;
        centerOffsetY /= dots.length;
    }

    const bitmap = document.createElement("canvas");
    bitmap.width = width;
    bitmap.height = height;
    const bitmapContext = bitmap.getContext("2d");
    for (const dot of dots) {
        if (!dot.animated) {
            bitmapContext.fillStyle = dot.color;
            bitmapContext.beginPath();
            bitmapContext.arc(dot.x + width * .5, dot.y + height * .5,
                dot.radius, 0, Math.PI * 2);
            bitmapContext.fill();
        }
    }
    return { index, width, height, dots, bitmap, centerOffsetX, centerOffsetY };
}

function buildRedFoodShapeMask(index, width, height) {
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskContext = maskCanvas.getContext("2d", { willReadFrequently: true });
    const mask = redFoodMasks[index];
    maskContext.fillStyle = "#fff";
    if (mask.type === "ellipse") {
        maskContext.beginPath();
        maskContext.ellipse(mask.x * width, mask.y * height,
            mask.rx * width, mask.ry * height, 0, 0, Math.PI * 2);
        maskContext.fill();
    } else {
        const shapes = mask.type === "polygons" ? mask.shapes : [mask.points];
        for (const shape of shapes) {
            maskContext.beginPath();
            shape.forEach(([u, v], pointIndex) => {
                const px = u * width;
                const py = v * height;
                if (pointIndex === 0) maskContext.moveTo(px, py);
                else maskContext.lineTo(px, py);
            });
            maskContext.closePath();
            maskContext.fill();
        }
    }
    return maskContext.getImageData(0, 0, width, height).data;
}

function buildMagentaOutlineSpanMask(outlineImage, width, height, crop) {
    const mask = new Uint8ClampedArray(width * height * 4);
    if (!outlineImage?.complete || !outlineImage.naturalWidth) return mask;
    const outlineCanvas = document.createElement("canvas");
    outlineCanvas.width = width;
    outlineCanvas.height = height;
    const context = outlineCanvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(outlineImage, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);
    const pixels = context.getImageData(0, 0, width, height).data;
    const spans = new Array(height).fill(null);
    for (let y = 0; y < height; y++) {
        let left = width;
        let right = -1;
        for (let x = 0; x < width; x++) {
            const offset = (y * width + x) * 4;
            const red = pixels[offset];
            const green = pixels[offset + 1];
            const blue = pixels[offset + 2];
            if (red > 125 && blue > 105 && green < 165 &&
                red - green > 55 && blue - green > 30 && red > blue * .68) {
                left = Math.min(left, x);
                right = Math.max(right, x);
            }
        }
        if (right >= left) spans[y] = [left, right];
    }

    const first = spans.findIndex(Boolean);
    let last = height - 1;
    while (last >= 0 && !spans[last]) last--;
    if (first < 0 || last <= first) return mask;

    // A partially detected outline row can collapse to a narrow horizontal
    // sliver. Treat sudden interior width drops as missed contour data so the
    // fill below interpolates across them instead of turning them into stripes.
    const rowWidth = span => span ? span[1] - span[0] : 0;
    const anomalousRows = [];
    const contourNeighborhood = Math.max(8, Math.ceil(height * .045));
    const edgeGuard = Math.max(2, Math.ceil(height * .025));
    for (let y = first + edgeGuard; y < last - edgeGuard; y++) {
        const nearbyWidths = [];
        for (let offset = -contourNeighborhood; offset <= contourNeighborhood; offset++) {
            if (!offset || y + offset < first || y + offset > last) continue;
            const widthAtRow = rowWidth(spans[y + offset]);
            if (widthAtRow > width * .08) nearbyWidths.push(widthAtRow);
        }
        if (nearbyWidths.length < 3 || !spans[y]) continue;
        nearbyWidths.sort((a, b) => a - b);
        const localMedianWidth = nearbyWidths[Math.floor(nearbyWidths.length / 2)];
        if (rowWidth(spans[y]) < Math.max(2, localMedianWidth * .28)) {
            anomalousRows.push(y);
        }
    }
    for (const y of anomalousRows) spans[y] = null;

    for (let y = first; y <= last; y++) {
        if (spans[y]) continue;
        let before = y - 1;
        let after = y + 1;
        while (before >= first && !spans[before]) before--;
        while (after <= last && !spans[after]) after++;
        if (before < first || after > last) continue;
        const amount = (y - before) / (after - before);
        spans[y] = [
            Math.round(spans[before][0] + (spans[after][0] - spans[before][0]) * amount),
            Math.round(spans[before][1] + (spans[after][1] - spans[before][1]) * amount)
        ];
    }
    for (let y = first; y <= last; y++) {
        const span = spans[y];
        if (!span) continue;
        for (let x = Math.max(0, span[0]); x <= Math.min(width - 1, span[1]); x++) {
            mask[(y * width + x) * 4 + 3] = 255;
        }
    }
    return mask;
}

function buildMagentaOutlineMask(outlineImage, width, height, fallbackIndex, crop = null) {
    if (!outlineImage || (!outlineImage.complete && !outlineImage.width) ||
        !(outlineImage.naturalWidth || outlineImage.width)) {
        if (fallbackIndex === 3) return new Uint8ClampedArray(width * height * 4);
        return buildRedFoodShapeMask(fallbackIndex, width, height);
    }
    const outlineCanvas = document.createElement("canvas");
    outlineCanvas.width = width;
    outlineCanvas.height = height;
    const outlineContext = outlineCanvas.getContext("2d", { willReadFrequently: true });
    if (crop) {
        outlineContext.drawImage(outlineImage, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);
    } else {
        outlineContext.drawImage(outlineImage, 0, 0, width, height);
    }
    const pixels = outlineContext.getImageData(0, 0, width, height).data;
    const total = width * height;
    const barrier = new Uint8Array(total);
    const exterior = new Uint8Array(total);

    // Detect only the magenta tracing line. The sampled food colors still come
    // from the original image, so none of the outline color reaches the scene.
    for (let i = 0; i < total; i++) {
        const offset = i * 4;
        const red = pixels[offset];
        const green = pixels[offset + 1];
        const blue = pixels[offset + 2];
        if (red > 125 && blue > 105 && green < 165 &&
            red - green > 55 && blue - green > 30 && red > blue * .68) {
            barrier[i] = 1;
        }
    }

    // Thicken antialiased sections of the outline by one small mask pixel to
    // keep exterior flood-fill from slipping through tiny raster gaps.
    const sealedBarrier = new Uint8Array(barrier);
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const index = y * width + x;
            if (!barrier[index]) continue;
            sealedBarrier[index - 1] = 1;
            sealedBarrier[index + 1] = 1;
            sealedBarrier[index - width] = 1;
            sealedBarrier[index + width] = 1;
        }
    }

    const leftOutlineRows = [];
    for (let y = 0; y < height; y++) {
        if (sealedBarrier[y * width]) leftOutlineRows.push(y);
    }
    const firstLeftOutlineRow = leftOutlineRows[0];
    const lastLeftOutlineRow = leftOutlineRows[leftOutlineRows.length - 1];
    const queue = new Int32Array(total);
    let queueRead = 0;
    let queueWrite = 0;
    const seed = index => {
        if (sealedBarrier[index] || exterior[index]) return;
        exterior[index] = 1;
        queue[queueWrite++] = index;
    };
    for (let x = 0; x < width; x++) {
        seed(x);
        seed((height - 1) * width + x);
    }
    for (let y = 0; y < height; y++) {
        const insideCroppedOutline = leftOutlineRows.length >= 2 &&
            y > firstLeftOutlineRow && y < lastLeftOutlineRow;
        if (!insideCroppedOutline) seed(y * width);
        seed(y * width + width - 1);
    }
    while (queueRead < queueWrite) {
        const index = queue[queueRead++];
        const x = index % width;
        if (x > 0) seed(index - 1);
        if (x + 1 < width) seed(index + 1);
        if (index >= width) seed(index - width);
        if (index + width < total) seed(index + width);
    }

    const mask = new Uint8ClampedArray(total * 4);
    for (let i = 0; i < total; i++) {
        if (!exterior[i] && !sealedBarrier[i]) mask[i * 4 + 3] = 255;
    }
    return mask;
}

function buildPizzaOutlineMask(outlineImage, width, height) {
    if (!outlineImage?.complete || !outlineImage.naturalWidth) {
        return buildRedFoodShapeMask(2, width, height);
    }
    const outlineCanvas = document.createElement("canvas");
    outlineCanvas.width = width;
    outlineCanvas.height = height;
    const outlineContext = outlineCanvas.getContext("2d", { willReadFrequently: true });
    outlineContext.drawImage(outlineImage, 0, 0, width, height);
    const pixels = outlineContext.getImageData(0, 0, width, height).data;
    const total = width * height;
    const outlinePixels = new Uint8Array(total);
    const visited = new Uint8Array(total);
    for (let i = 0; i < total; i++) {
        const offset = i * 4;
        const red = pixels[offset];
        const green = pixels[offset + 1];
        const blue = pixels[offset + 2];
        if (red > 125 && blue > 105 && green < 165 &&
            red - green > 55 && blue - green > 30 && red > blue * .68) {
            outlinePixels[i] = 1;
        }
    }

    // Keep the main connected pizza contour and discard isolated pink specks
    // that otherwise create detached streaks in the row-based mask.
    let largestOutline = [];
    for (let start = 0; start < total; start++) {
        if (!outlinePixels[start] || visited[start]) continue;
        const component = [];
        const queue = [start];
        visited[start] = 1;
        for (let read = 0; read < queue.length; read++) {
            const index = queue[read];
            component.push(index);
            const x = index % width;
            const y = Math.floor(index / width);
            for (let dy = -1; dy <= 1; dy++) {
                const ny = y + dy;
                if (ny < 0 || ny >= height) continue;
                for (let dx = -1; dx <= 1; dx++) {
                    if (!dx && !dy) continue;
                    const nx = x + dx;
                    if (nx < 0 || nx >= width) continue;
                    const neighbor = ny * width + nx;
                    if (outlinePixels[neighbor] && !visited[neighbor]) {
                        visited[neighbor] = 1;
                        queue.push(neighbor);
                    }
                }
            }
        }
        if (component.length > largestOutline.length) largestOutline = component;
    }
    const mainOutline = new Uint8Array(total);
    for (const index of largestOutline) mainOutline[index] = 1;
    const spans = new Array(height).fill(null);

    // The pizza contour is partly cropped by the left edge of the source.
    // Find each magenta outline span directly so exterior flood-fill cannot
    // leak through that cropped side and erase the pizza interior.
    for (let y = 0; y < height; y++) {
        let left = width;
        let right = -1;
        for (let x = 0; x < width; x++) {
            if (mainOutline[y * width + x]) {
                left = Math.min(left, x);
                right = Math.max(right, x);
            }
        }
        if (right < 0) continue;

        if (right - left < 2) {
            if (left < width * .25) spans[y] = [left, width - 1];
            else if (left > width * .75) spans[y] = [0, right];
            else spans[y] = [left, right];
        } else {
            spans[y] = [left, right];
        }
    }

    const first = spans.findIndex(Boolean);
    let last = spans.length - 1;
    while (last >= 0 && !spans[last]) last--;
    if (first < 0 || last < first) return buildRedFoodShapeMask(2, width, height);

    // A diagonal section of the magenta outline can leave a row with only a
    // one-pixel span. Keeping that as a real row creates a visible horizontal
    // break in the particle fill. Treat isolated interior width collapses as
    // missing contour samples and interpolate the neighboring rows instead.
    const rowWidth = span => span ? span[1] - span[0] : 0;
    const contourNeighborhood = Math.max(8, Math.ceil(height * .045));
    const edgeGuard = Math.max(2, Math.ceil(height * .025));
    const collapsedRows = [];
    for (let y = first + edgeGuard; y < last - edgeGuard; y++) {
        if (!spans[y]) continue;
        const currentWidth = rowWidth(spans[y]);
        // The source outline has an open horizontal band through the pizza's
        // middle. Rows where only one side of that contour survives can look
        // like valid tiny spans, so catch them directly instead of requiring a
        // local median (which is also tiny inside the whole broken band).
        if (currentWidth < Math.max(3, width * .08)) {
            collapsedRows.push(y);
            continue;
        }
        const nearbyWidths = [];
        for (let offset = -contourNeighborhood; offset <= contourNeighborhood; offset++) {
            if (!offset || y + offset < first || y + offset > last) continue;
            const widthAtRow = rowWidth(spans[y + offset]);
            if (widthAtRow > width * .08) nearbyWidths.push(widthAtRow);
        }
        if (nearbyWidths.length < 3) continue;
        nearbyWidths.sort((a, b) => a - b);
        const medianWidth = nearbyWidths[Math.floor(nearbyWidths.length / 2)];
        if (currentWidth < medianWidth * .28) collapsedRows.push(y);
    }
    for (const y of collapsedRows) spans[y] = null;

    for (let y = first; y <= last; y++) {
        if (spans[y]) continue;
        let before = y - 1;
        let after = y + 1;
        while (before >= first && !spans[before]) before--;
        while (after <= last && !spans[after]) after++;
        if (before < first || after > last) continue;
        const t = (y - before) / (after - before);
        spans[y] = [
            Math.round(spans[before][0] + (spans[after][0] - spans[before][0]) * t),
            Math.round(spans[before][1] + (spans[after][1] - spans[before][1]) * t)
        ];
    }

    const mask = new Uint8ClampedArray(width * height * 4);
    for (let y = first; y <= last; y++) {
        const span = spans[y];
        if (!span) continue;
        const left = Math.max(0, Math.ceil(span[0] + 2));
        const right = Math.min(width - 1, Math.floor(span[1] - 2));
        for (let x = left; x <= right; x++) mask[(y * width + x) * 4 + 3] = 255;
    }
    return mask;
}

function ensureRedFoodTarget(index) {
    if (index < 0 || index >= redFoodImageFiles.length) return;
    if (redFoodTargets[index]) return;
    if (redFoodImages[index]) return;

    const image = new Image();
    redFoodImages[index] = image;
    let outlineImage = redFoodOutlineFiles[index] === redFoodImageFiles[index] ? image : null;
    if (outlineImage === image) {
        if (index === 3) redFoodBurgerOutlineImage = image;
    }
    const prepareTarget = () => {
        const sourceImage = image.complete && image.naturalWidth
            ? image
            : image.dataset.failed === "true" && outlineImage?.complete && outlineImage.naturalWidth
                ? outlineImage
                : null;
        if (!sourceImage || redFoodTargets[index]) return;
        const outlineFile = redFoodOutlineFiles[index];
        if (outlineFile && !outlineImage?.dataset.failed &&
            (!outlineImage?.complete || !outlineImage.naturalWidth)) return;
        const target = buildRedFoodTarget(index, sourceImage);
        for (const dot of target.dots) {
            const start = randomRedFoodEdgePoint();
            const edge = randomRedFoodEdgePoint();
            dot.startX = start.x;
            dot.startY = start.y;
            dot.edgeX = edge.x;
            dot.edgeY = edge.y;
        }
        redFoodTargets[index] = target;
        uploadRedFoodTarget(target);
    };
    image.addEventListener("load", prepareTarget, { once: true });
    image.addEventListener("error", () => {
        image.dataset.failed = "true";
        prepareTarget();
    }, { once: true });
    image.src = encodeURI(redFoodImageFiles[index]);
    if (redFoodOutlineFiles[index] && outlineImage !== image) {
        outlineImage = new Image();
        if (index === 0) redFoodTacoOutlineImage = outlineImage;
        else if (index === 1) redFoodPhoOutlineImage = outlineImage;
        else if (index === 2) redFoodPizzaOutlineImage = outlineImage;
        else if (index === 3) redFoodBurgerOutlineImage = outlineImage;
        outlineImage.addEventListener("load", prepareTarget, { once: true });
        outlineImage.addEventListener("error", () => {
            outlineImage.dataset.failed = "true";
            prepareTarget();
        }, { once: true });
        outlineImage.src = encodeURI(redFoodOutlineFiles[index]);
    }
}

function randomRedFoodEdgePoint() {
    const side = Math.floor(Math.random() * 4);
    if (side === 0) return { x: -8, y: Math.random() * window.innerHeight };
    if (side === 1) return { x: window.innerWidth + 8, y: Math.random() * window.innerHeight };
    if (side === 2) return { x: Math.random() * window.innerWidth, y: -8 };
    return { x: Math.random() * window.innerWidth, y: window.innerHeight + 8 };
}

function redFoodDotPosition(dot, target, progress, now, center, cameraShift, dispersing = false) {
    const stagger = dot.delay / 230 * .12;
    const particleProgress = Math.max(0, Math.min(1,
        (progress - stagger) / (1 - stagger)));
    const eased = particleProgress * particleProgress * (3 - 2 * particleProgress);
    const targetX = center.x + dot.x;
    const targetY = center.y + dot.y;
    const depthDrift = (dispersing ? eased : 1 - eased) * (5 + dot.depth * 14);
    const parallax = -cameraShift * (dot.depth - .5) * .1;
    if (dispersing) {
        return {
            x: targetX + (dot.edgeX - targetX) * eased + Math.sin(now * .003 + dot.phase) * depthDrift,
            y: targetY + (dot.edgeY - targetY) * eased + Math.cos(now * .0027 + dot.phase) * depthDrift,
            alpha: 1 - particleProgress
        };
    }
    return {
        x: dot.startX + (targetX - dot.startX) * eased + Math.sin(now * .003 + dot.phase) * depthDrift + parallax * eased,
        y: dot.startY + (targetY - dot.startY) * eased + Math.cos(now * .0027 + dot.phase) * depthDrift,
        alpha: particleProgress
    };
}

function drawRedFoodFormation(index, progress, now) {
    const target = redFoodTargets[index];
    if (!target) return;
    if (progress >= 1) {
        drawRedFoodResting(index, now);
        return;
    }
    const center = redFoodStageCenter(target);
    const cameraShift = getCameraX() - redFoodCameraAnchor;
    for (const dot of target.dots) {
        const position = redFoodDotPosition(dot, target, progress, now, center, cameraShift);
        if (position.alpha <= 0) continue;
        redFoodFallbackContext.globalAlpha = position.alpha * (.75 + dot.depth * .2);
        redFoodFallbackContext.fillStyle = dot.color;
        redFoodFallbackContext.beginPath();
        redFoodFallbackContext.arc(position.x, position.y,
            dot.radius * (.72 + dot.depth * .52), 0, Math.PI * 2);
        redFoodFallbackContext.fill();
    }
    redFoodFallbackContext.globalAlpha = 1;
}

function drawRedFoodDissolve(index, progress, now) {
    const target = redFoodTargets[index];
    if (!target || progress >= 1) return;
    if (progress <= 0) {
        drawRedFoodResting(index, now);
        return;
    }
    const center = redFoodStageCenter(target);
    const cameraShift = getCameraX() - redFoodCameraAnchor;
    for (const dot of target.dots) {
        const position = redFoodDotPosition(dot, target, progress, now, center, cameraShift, true);
        if (position.alpha <= 0) continue;
        redFoodFallbackContext.globalAlpha = position.alpha * (.75 + dot.depth * .2);
        redFoodFallbackContext.fillStyle = dot.color;
        redFoodFallbackContext.beginPath();
        redFoodFallbackContext.arc(position.x, position.y,
            dot.radius * (.72 + dot.depth * .52), 0, Math.PI * 2);
        redFoodFallbackContext.fill();
    }
    redFoodFallbackContext.globalAlpha = 1;
}

function drawRedFoodResting(index, now) {
    const target = redFoodTargets[index];
    if (!target) return;
    const center = redFoodStageCenter(target);
    redFoodFallbackContext.drawImage(target.bitmap,
        center.x - target.width * .5,
        center.y - target.height * .5);
    const cameraShift = getCameraX() - redFoodCameraAnchor;
    for (const dot of target.dots) {
        if (!dot.animated) continue;
        const parallax = -cameraShift * (dot.depth - .5) * .045;
        const drift = .35 + dot.depth * 1.25;
        const px = center.x + dot.x + parallax + Math.sin(now * .0014 + dot.phase) * drift;
        const py = center.y + dot.y + Math.cos(now * .0011 + dot.phase * 1.3) * drift;
        redFoodFallbackContext.globalAlpha = .48 + dot.depth * .3;
        redFoodFallbackContext.fillStyle = dot.color;
        redFoodFallbackContext.beginPath();
        redFoodFallbackContext.arc(px, py, dot.radius * (.72 + dot.depth * .52), 0, Math.PI * 2);
        redFoodFallbackContext.fill();
    }
    redFoodFallbackContext.globalAlpha = 1;
}

function drawRedFoodSequence(now) {
    const gpuReady = beginRedFoodGpuFrame();
    if (redHandExitFinished) {
        if (redFoodGlCanvas) redFoodGlCanvas.style.display = "none";
        if (redFoodFallbackCanvas) redFoodFallbackCanvas.style.display = "none";
        redFoodHeadline.classList.remove("is-visible");
        redFoodHeadline.setAttribute("aria-hidden", "true");
        if (postFoodMarketScene.hidden) {
            postFoodMarketScene.hidden = false;
            requestAnimationFrame(() => postFoodMarketScene.classList.add("is-visible"));
            postFoodMarketScene.setAttribute("aria-hidden", "false");
            player.style.display = "none";
        }
        return;
    }
    if (!redFoodSequenceStarted) {
        redFoodSequenceStarted = true;
        redFoodProgressX = x;
        redFoodVisualProgress = 0;
        redFoodBoundaryHoldAt = 0;
        redFoodCameraAnchor = getCameraX();
        redFoodTravelStep = Math.max(300, window.innerWidth * .34);
    }

    updateRedFoodHeadline(now);

    const previousFoodProgress = redFoodVisualProgress;
    const movementX = x - redFoodProgressX;
    redFoodProgressX = x;
    if (redHandExitStartedAt) {
        redFoodVisualProgress = 4;
    } else if (movementX < 0) {
        redFoodVisualProgress = Math.max(0, redFoodVisualProgress + movementX / redFoodTravelStep);
        redFoodBoundaryHoldAt = 0;
    } else {
        if (redFoodBoundaryHoldAt && now - redFoodBoundaryHoldAt >= 1000) {
            redFoodBoundaryHoldAt = 0;
        }
        if (!redFoodBoundaryHoldAt && redFoodVisualProgress < 4) {
            const nextBoundary = Math.min(4, Math.floor(redFoodVisualProgress + 0.000001) + 1);
            redFoodVisualProgress = Math.min(
                nextBoundary,
                redFoodVisualProgress + movementX / redFoodTravelStep
            );
            if (nextBoundary < 4 && redFoodVisualProgress >= nextBoundary) {
                redFoodVisualProgress = nextBoundary;
                redFoodBoundaryHoldAt = now;
            }
        }
    }
    if (redFoodVisualProgress > .1 && !redFoodTargets[2]) {
        ensureRedFoodTarget(2);
    }
    // Prepare the final food while the pizza is visible so the burger is
    // ready to form as soon as the player reaches its stage.
    if (redFoodVisualProgress >= 2 && !redFoodTargets[3]) {
        ensureRedFoodTarget(3);
    }
    const maximumProgress = redFoodTargets[2] ? 4 : 2;
    if (redFoodVisualProgress > maximumProgress) redFoodVisualProgress = maximumProgress;
    let progress = redFoodVisualProgress;
    const foodProgressDelta = progress - previousFoodProgress;
    if (Math.abs(foodProgressDelta) > .00001 && !redHandExitStartedAt) {
        const foodPitchProgress = Math.max(0, Math.min(1, progress / 4));
        registerParticleMotionSound(1, Math.sign(foodProgressDelta), "food", foodPitchProgress);
    }
    if (progress < 4 && !redHandExitStartedAt) redFoodBurgerShownAt = 0;
    if (progress < 1) {
        ensureRedFoodTarget(0);
        if (progress > .72) ensureRedFoodTarget(1);
        if (gpuReady) drawRedFoodGpuTarget(0, progress, 0, now);
        else drawRedFoodFormation(0, progress, now);
    } else if (progress < 4) {
        const outgoingIndex = Math.floor(progress) - 1;
        const incomingIndex = outgoingIndex + 1;
        const transitionProgress = progress - Math.floor(progress);
        ensureRedFoodTarget(outgoingIndex);
        ensureRedFoodTarget(incomingIndex);
        if (incomingIndex < redFoodImageFiles.length - 1 && transitionProgress > .72) {
            ensureRedFoodTarget(incomingIndex + 1);
        }
        if (gpuReady) {
            drawRedFoodGpuTarget(outgoingIndex, transitionProgress, 1, now);
            drawRedFoodGpuTarget(incomingIndex, transitionProgress, 0, now);
        } else {
            drawRedFoodDissolve(outgoingIndex, transitionProgress, now);
            drawRedFoodFormation(incomingIndex, transitionProgress, now);
        }
    } else {
        ensureRedFoodTarget(3);
        if (!redFoodTargets[3]) return;
        if (!redFoodBurgerShownAt) redFoodBurgerShownAt = now;
        if (!redHandExitStartedAt && now - redFoodBurgerShownAt >= redFoodBurgerHoldDuration) {
            redHandExitStartedAt = now;
            redHandLastExitShakeAt = now;
            startRedHandRumble();
            triggerRedHandShake();
        }
        if (redHandExitStartedAt) {
            const exitElapsed = now - redHandExitStartedAt;
            if (exitElapsed < redHandLowerDuration && now - redHandLastExitShakeAt >= 900) {
                redHandLastExitShakeAt = now;
                triggerRedHandShake();
            }
            if (exitElapsed >= redHandLowerDuration) {
                redHandExitFinished = true;
                redHandCanvas.style.display = "none";
                if (redFoodGlCanvas) redFoodGlCanvas.style.display = "none";
                if (redFoodFallbackCanvas) redFoodFallbackCanvas.style.display = "none";
                redFoodHeadline.classList.remove("is-visible");
                redFoodHeadline.setAttribute("aria-hidden", "true");
                postFoodMarketScene.hidden = false;
                requestAnimationFrame(() => postFoodMarketScene.classList.add("is-visible"));
                postFoodMarketScene.setAttribute("aria-hidden", "false");
                player.style.display = "none";
                return;
            }
        }
        // Keep the final burger visible even if the WebGL buffer for this last
        // target cannot be allocated. Its bitmap is already built from the
        // same dense, outline-masked particles.
        if (gpuReady) redFoodGlCanvas.style.display = "none";
        ensureRedFoodFallbackCanvas();
        drawRedFoodResting(3, now);
    }
}

function updateRedFoodHeadline(now) {
    if (!redFoodSequenceStarted || redHandExitStartedAt || redHandExitFinished) {
        redFoodHeadline.classList.remove("is-visible");
        redFoodHeadline.setAttribute("aria-hidden", "true");
        return;
    }

    const progress = Math.max(0, Math.min(4, redFoodVisualProgress));
    const foodIndex = Math.max(0, Math.min(3, Math.ceil(progress) - 1));
    const fullyFormed = progress >= foodIndex + 1;
    if (fullyFormed) {
        redFoodBlank.textContent = redFoodNames[foodIndex];
    } else if (now >= redFoodGlyphRefreshAt) {
        redFoodGlyphRefreshAt = now + 24;
        const glyphCount = redFoodNames[foodIndex].length;
        let scramble = "";
        for (let i = 0; i < glyphCount; i++) {
            scramble += redFoodGlyphs[Math.floor(Math.random() * redFoodGlyphs.length)];
        }
        redFoodBlank.textContent = scramble;
    }

    const dimensions = getRedHandDimensions();
    const elapsed = Math.max(0, now - redHandStartedAt);
    const riseProgress = Math.max(0, Math.min(1, elapsed / redHandRiseDuration));
    const riseEase = riseProgress * riseProgress * (3 - 2 * riseProgress);
    const lowerProgress = redHandExitStartedAt
        ? Math.max(0, Math.min(1, (now - redHandExitStartedAt) / redHandLowerDuration))
        : 0;
    const lowerEase = lowerProgress * lowerProgress * (3 - 2 * lowerProgress);
    const handTop = getGroundY() - dimensions.height * riseEase + dimensions.height * lowerEase;
    const handScreenX = x - getCameraX() + 25;
    redFoodHeadline.style.left = `${handScreenX}px`;
    redFoodHeadline.style.top = `${Math.max(12, handTop - 44)}px`;
    redFoodHeadline.classList.add("is-visible");
    redFoodHeadline.setAttribute("aria-hidden", "false");
}

function getRedHandDimensions() {
    const aspect = redHandImage.naturalWidth && redHandImage.naturalHeight
        ? redHandImage.naturalWidth / redHandImage.naturalHeight
        : .742;
    const height = Math.min(getGroundY() * .74, window.innerWidth * .6 / aspect);
    return { width: height * aspect, height };
}

function buildRedHandDotBitmap() {
    if (!redHandImage.complete || !redHandImage.naturalWidth) return;
    const bitmap = document.createElement("canvas");
    bitmap.width = redHandImage.naturalWidth;
    bitmap.height = redHandImage.naturalHeight;
    const context = bitmap.getContext("2d", { willReadFrequently: true });
    context.drawImage(redHandImage, 0, 0);
    const pixels = context.getImageData(0, 0, bitmap.width, bitmap.height).data;
    context.clearRect(0, 0, bitmap.width, bitmap.height);

    // Sample the source at near-native resolution so its lighting and red
    // surface variation stay visible through the dense particle pattern.
    const step = 8;
    for (let y = step * .5; y < bitmap.height; y += step) {
        for (let x = step * .5; x < bitmap.width; x += step) {
            const offset = (Math.floor(y) * bitmap.width + Math.floor(x)) * 4;
            const alpha = pixels[offset + 3];
            if (alpha < 80) continue;
            const variation = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
            const radius = step * (.38 + variation * .06);
            context.globalAlpha = alpha / 255;
            const red = Math.min(255, pixels[offset] * 1.08 + 18);
            const green = Math.min(210, pixels[offset + 1] * 1.05 + 6);
            const blue = Math.min(210, pixels[offset + 2] * 1.05 + 8);
            context.fillStyle = `rgb(${red},${green},${blue})`;
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fill();
        }
    }
    context.globalAlpha = 1;
    redHandDotBitmap = bitmap;
}

function startRedHandRumble() {
    redHandRumbleAudio.pause();
    redHandRumbleAudio.currentTime = 0;
    redHandRumbleAudio.loop = true;
    redHandRumbleAudio.volume = 0;
    redHandRumbleAudio.play().catch(() => {});
}

function beginRedHandSequence(now) {
    if (redHandStartedAt) return;
    redHandStartedAt = now;
    startRedHandRumble();

    movingLeft = false;
    movingRight = false;
    keyA.classList.remove("active");
    keyD.classList.remove("active");

    const debrisColors = ["#ff5369", "#ff8794", "#e3c5c8", "#fff0f1"];
    for (let i = 0; i < 120; i++) {
        redHandDebris.push({
            x: getCameraX() + Math.random() * window.innerWidth,
            y: -12 - Math.random() * window.innerHeight * .14,
            velocityX: (Math.random() - .5) * 145,
            velocityY: 45 + Math.random() * 145,
            gravity: 360 + Math.random() * 360,
            radius: 2.5 + Math.random() * 5.5,
            rotation: Math.random() * 360,
            spin: (Math.random() - .5) * 460,
            color: debrisColors[Math.floor(Math.random() * debrisColors.length)],
            shape: Math.random() < .72 ? "shard" : "pixel",
            startedAt: now + Math.random() * 2200,
            lifetime: 2.4 + Math.random() * .8
        });
    }

    triggerRedHandShake();
}

function triggerRedHandShake() {
    document.body.classList.remove("red-hand-shake");
    void document.body.offsetWidth;
    document.body.classList.add("red-hand-shake");
}

function drawRedHandScene(now) {
    if (redHandExitFinished) {
        redHandRumbleAudio.pause();
        redHandCanvas.style.display = "none";
        return;
    }
    redHandCanvas.style.display = "block";
    redHandContext.clearRect(0, 0, window.innerWidth, window.innerHeight);

    const elapsed = Math.max(0, now - redHandStartedAt);
    const riseProgress = Math.max(0, Math.min(1, elapsed / redHandRiseDuration));
    const riseEase = riseProgress * riseProgress * (3 - 2 * riseProgress);
    const lowerProgress = redHandExitStartedAt
        ? Math.max(0, Math.min(1, (now - redHandExitStartedAt) / redHandLowerDuration))
        : 0;
    const rumbleProgress = redHandExitStartedAt ? lowerProgress : riseProgress;
    const rumbleAttack = Math.min(1, rumbleProgress / .16);
    const rumbleRelease = Math.min(1, (1 - rumbleProgress) / .2);
    redHandRumbleAudio.volume = .14 * rumbleAttack * rumbleRelease;
    if (rumbleProgress >= 1 && !redHandRumbleAudio.paused) {
        redHandRumbleAudio.pause();
        redHandRumbleAudio.currentTime = 0;
    }
    const lowerEase = lowerProgress * lowerProgress * (3 - 2 * lowerProgress);
    const dimensions = getRedHandDimensions();
    const handScreenX = x - getCameraX() + 25;
    const left = handScreenX - dimensions.width * .5;
    const top = getGroundY() - dimensions.height * riseEase + dimensions.height * lowerEase;

    for (const debris of redHandDebris) {
        if (now < debris.startedAt) continue;
        const age = (now - debris.startedAt) / 1000;
        if (age > debris.lifetime) continue;
        const px = debris.x + debris.velocityX * age - getCameraX();
        const py = debris.y + debris.velocityY * age + .5 * debris.gravity * age * age;
        if (px < -20 || px > window.innerWidth + 20 || py < -20 || py > window.innerHeight + 20) continue;
        const fade = Math.min(1, (debris.lifetime - age) * 2);
        redHandContext.globalAlpha = fade;
        redHandContext.fillStyle = debris.color;
        redHandContext.beginPath();
        if (debris.shape === "pixel") {
            redHandContext.fillRect(px - debris.radius, py - debris.radius,
                debris.radius * 2, debris.radius * 2);
        } else {
            const rotation = (debris.rotation + debris.spin * age) * Math.PI / 180;
            const c = Math.cos(rotation);
            const s = Math.sin(rotation);
            const points = [[0, -1.6], [.55, -.1], [.15, 1], [-.3, .2]]
                .map(([dx, dy]) => [px + (dx * c - dy * s) * debris.radius,
                    py + (dx * s + dy * c) * debris.radius]);
            redHandContext.moveTo(points[0][0], points[0][1]);
            for (let p = 1; p < points.length; p++) redHandContext.lineTo(points[p][0], points[p][1]);
            redHandContext.closePath();
            redHandContext.fill();
        }
    }
    redHandContext.globalAlpha = 1;
    if (redHandDotBitmap) {
        redHandContext.save();
        redHandContext.beginPath();
        redHandContext.rect(0, 0, window.innerWidth, getGroundY());
        redHandContext.clip();
        redHandContext.drawImage(redHandDotBitmap, left, top, dimensions.width, dimensions.height);
        redHandContext.restore();
    } else if (redHandImage.complete && redHandImage.naturalWidth > 0) {
        redHandContext.save();
        redHandContext.beginPath();
        redHandContext.rect(0, 0, window.innerWidth, getGroundY());
        redHandContext.clip();
        redHandContext.drawImage(redHandImage, left, top, dimensions.width, dimensions.height);
        redHandContext.restore();
    }
}

/* ============================================================
   WALK CONTROLS
   Only show them during the first scene.
   ============================================================ */

function updateControls() {
    const cubeIsStill = !redPathActive && !fallTransitionActive && !movingLeft && !movingRight;
    controls.classList.toggle("is-visible", cubeIsStill);
}


/* ============================================================
   DRAW GROUND
   Draws a straight ground line across the screen.
   ============================================================ */

function drawGround() {

    const screenWidth =
        window.innerWidth;

    const groundY =
        getGroundY();
    const cameraX = getCameraX();
    const playerScreenX = x - cameraX;
    const isMoving = movingLeft || movingRight;
    const groundState = [
        screenWidth,
        window.innerHeight,
        cameraX,
        playerScreenX,
        movementDirection,
        isMoving,
        redPathActive,
        fallTransitionActive,
        fallProgress,
        cityRevealStarted,
        cityLineProgress
    ].join(":");
    if (groundState === lastGroundState) return;
    lastGroundState = groundState;
    groundContext.clearRect(0, 0, screenWidth, window.innerHeight);

    const spacing = groundDotSpacing;
    const startX = Math.floor(cameraX / spacing) * spacing;
    const dotSizes = [1.6, 2.5, 1.7, 3, 1.9, 2.6, 1.5];
    const colors = redPathActive ? [
        [112, 20, 36],
        [192, 35, 54],
        [255, 83, 98]
    ] : [
        [35, 78, 154],
        [37, 119, 210],
        [45, 170, 239]
    ];
    const city = cityRevealStarted && !redPathActive ? getCityTiming() : null;
    const cityScreenX = city ? city.imageX - (cameraX - cityCameraAnchor) : 0;
    const cityLineLength = city
        ? (city.drawingStartX - city.orbStartX) + city.imageWidth - (city.drawingStartX - city.imageX)
        : 1;
    const cityProgress = city ? Math.min(cityLineProgress / cityLineLength, 1) : 0;
    for (let worldX = startX; worldX <= cameraX + screenWidth + spacing; worldX += spacing) {
        const screenX = worldX - cameraX;
        if (fallTransitionActive) {
            const breakCenterX = playerScreenX + 25;
            const farthestEdge = Math.max(breakCenterX, screenWidth - breakCenterX, 1);
            const liftDelay = Math.abs(screenX - breakCenterX) / farthestEdge * (750 / fallTransitionDuration);
            if (fallProgress >= liftDelay) continue;
        }

        const breakRadius = 18 + fallProgress * 72;
        if (
            fallTransitionActive &&
            Math.abs(screenX - (playerScreenX + 25)) < breakRadius
        ) continue;

        if (!redPathActive && city && screenX >= cityScreenX && screenX <= cityScreenX + city.imageWidth) {
            const cityXProgress = (screenX - cityScreenX) / city.imageWidth;
            const revealDelay = cityXProgress * 0.32;
            const floorDotReveal = Math.max(0, Math.min(1, (cityProgress - revealDelay) / 0.68));
            const dotInterval = Math.abs(Math.round(worldX / spacing)) % 3;
            if (floorDotReveal > 0.08 && dotInterval === 0) continue;
        }
        const blend = Math.max(0, Math.min(1, screenX / screenWidth));
        const scaled = blend * (colors.length - 1);
        const colorIndex = Math.min(Math.floor(scaled), colors.length - 2);
        const colorBlend = scaled - colorIndex;
        const color = colors[colorIndex].map((channel, i) =>
            Math.round(channel + (colors[colorIndex + 1][i] - channel) * colorBlend)
        );
        const dotColor = redPathActive
            ? `rgb(${color.join(",")})`
            : `hsl(${201 + blend * 20 + Math.sin(worldX * .047) * 8}, ${78 + Math.sin(worldX * .091) * 17}%, ${45 + blend * 13 + Math.cos(worldX * .063) * 9}%)`;
        const radius = dotSizes[Math.abs(Math.round(worldX / spacing)) % dotSizes.length];
        const behindDistance = (playerScreenX - screenX) * movementDirection;
        const waveFade = isMoving && behindDistance >= 0 && behindDistance < 176
            ? Math.exp(-behindDistance / 150)
            : 0;
        const waveOffset = Math.sin((behindDistance / 176) * Math.PI * 2) * 4 * waveFade;

        groundContext.fillStyle = dotColor;
        if (redPathActive) {
            const pixelSize = radius * 2;
            groundContext.fillRect(screenX - radius, groundY + waveOffset - radius, pixelSize, pixelSize);
        } else {
            groundContext.beginPath();
            groundContext.arc(screenX, groundY + waveOffset, radius, 0, Math.PI * 2);
            groundContext.fill();
        }
    }
}


/* ============================================================
   UPDATE PLAYER
   Places the cube on the flat ground under the camera.
   ============================================================ */

function updatePlayer() {
    const screenX =
        x - getCameraX();
    const playerHeight = player.offsetHeight || 50;


    const groundY =
        getGroundY(
            x + 25
        );

    const angle =
        getGroundAngle(
            x + 25
        );


    let dropOffset = 0;
    let playerOpacity = 1;
    if (fallTransitionActive) {
        if (fallProgress < .34) {
            const drop = Math.min(fallProgress / .34, 1);
            const easedDrop = drop * drop * (3 - 2 * drop);
            dropOffset = easedDrop * window.innerHeight * 1.2;
            playerOpacity = 1 - easedDrop;
        } else if (fallProgress < .68) {
            dropOffset = window.innerHeight * 1.2;
            playerOpacity = 0;
        } else {
            const entry = Math.min((fallProgress - .68) / .32, 1);
            const easedEntry = 1 - Math.pow(1 - entry, 3);
            dropOffset = -window.innerHeight * 1.3 * (1 - easedEntry);
            playerOpacity = Math.min(entry * 2.5, 1);
        }
    }

    player.classList.toggle("is-walking", (movingLeft || movingRight) && !fallTransitionActive);
    player.classList.toggle("is-falling", fallTransitionActive);
    player.style.opacity = String(playerOpacity);

    player.style.transform =
        `translate3d(${screenX}px, ${groundY - playerHeight + dropOffset}px, 0) rotate(${angle}deg)`;

    const promptLeft = screenX + 25;
    const promptTop = groundY - 62 + dropOffset;
    controls.style.left = `${screenX + 25}px`;
    controls.style.top = `${groundY + 72 + dropOffset}px`;
    for (const prompt of [cityRevealPrompt, continuePrompt]) {
        prompt.style.left = `${promptLeft}px`;
        prompt.style.top = `${promptTop}px`;
    }
}


/* ============================================================
   KEYDOWN
   Handles A and D movement.
   ============================================================ */

document.addEventListener(
    "keydown",
    function(event) {

        const key = event.key.toLowerCase();
        const isLeftKey = key === "a" || event.code === "KeyA";
        const isRightKey = key === "d" || event.code === "KeyD";

        if ((event.key === "\\" || event.code === "Backslash") && !event.repeat &&
            !fallTransitionActive && !redPathActive) {
            event.preventDefault();
            movingLeft = false;
            movingRight = false;
            keyA.classList.remove("active");
            keyD.classList.remove("active");
            portalWorldActive = false;
            portalEnteredAt = 0;
            continueCameraLocked = false;
            world.classList.remove("portal-world");
            cityRevealPrompt.hidden = true;
            continuePrompt.hidden = true;
            buildingsPrompt.hidden = true;
            inspectCopy.hidden = true;
            settingIntro.hidden = true;
            settingIntro.classList.remove("is-visible");
            inspectTransitionComplete = true;
            startDropTransition();
            return;
        }

if (key === " " && !event.repeat && !buildingsPrompt.hidden) {
            event.preventDefault();
            knockOnBuildingsDoor();
            return;
        }

        if (key === " " && !event.repeat && !adventurePromptTriggered &&
            !portalWorldActive && !cityRevealStarted && !cityRevealPrompt.hidden) {
            event.preventDefault();
            startCityReveal();
            return;
        }

        if (key === " " && !event.repeat) {
            if (inspectMode && inspectTransitionComplete && !continuePromptDismissed) {
                event.preventDefault();
                startDropTransition();
            }
        }

        if (continueCameraLocked && (
            (isLeftKey && x <= continuePlayerMinX) ||
            (isRightKey && x >= continuePlayerMaxX)
        )) {
            event.preventDefault();
            return;
        }


        if (isLeftKey) {

            movingLeft = true;
            movementDirection = -1;

            keyA.classList.add(
                "active"
            );
        }


        if (isRightKey) {

            movingRight = true;
            movementDirection = 1;

            keyD.classList.add(
                "active"
            );
        }
    }
);


/* ============================================================
   KEYUP
   Stops A and D movement.
   ============================================================ */

document.addEventListener(
    "keyup",
    function(event) {

        const key = event.key.toLowerCase();
        const isLeftKey = key === "a" || event.code === "KeyA";
        const isRightKey = key === "d" || event.code === "KeyD";


        if (isLeftKey) {

            movingLeft = false;

            keyA.classList.remove(
                "active"
            );
        }


        if (isRightKey) {

            movingRight = false;

            keyD.classList.remove(
                "active"
            );
        }
    }
);


window.addEventListener(
    "blur",
    function() {

        movingLeft = false;
        movingRight = false;

        keyA.classList.remove("active");
        keyD.classList.remove("active");
    }
);


/* ============================================================
   RESIZE
   Rebuilds the scene after resizing the window.
   ============================================================ */

window.addEventListener(
    "resize",
    function() {

        resizeParticleCanvas();
        resizeGroundCanvas();
        resizeRedHandCanvas();
        resizeAdventureCanvas();
        resizeRedFoodWebGL();
        resizeRedFoodFallbackCanvas();
        lastGroundState = "";
        drawGround();
        updatePlayer();

        if (!redPathActive) drawCity();

        updateControls();
    }
);


/* ============================================================
   MAIN GAME LOOP
   ============================================================ */

function gameLoop() {
    const frameTime = performance.now();

    if (cityRevealStarted && !redPathActive) {

        const city =
            getCityTiming();

        const lineLength =
            (city.drawingStartX - city.orbStartX) +
            city.imageWidth -
            (city.drawingStartX - city.imageX);

        cityLineProgress =
            Math.min(cityLineProgress + normalSpeed * 2.2, lineLength);
    }

    updateFallTransition();

    const currentSpeed = normalSpeed;


    /*
       Move left.
    */

    const previousPlayerCenterX = x + 25;
    const redHandPickupInProgress = redHandStartedAt &&
        frameTime < redHandStartedAt + redHandRiseDuration;

    if (movingLeft && !fallTransitionActive && !redHandPickupInProgress) {

        x -= currentSpeed;
    }


    /*
       Move right.
    */

    if (movingRight && !fallTransitionActive && !redHandPickupInProgress) {

        x += currentSpeed;
    }

    if (adventurePromptTriggered && !fallTransitionActive) {
        const playerCenterX = x + 25;
        const crossedPortalMovingRight = movingRight &&
            previousPlayerCenterX < adventurePortalWorldX && playerCenterX >= adventurePortalWorldX;

        if (crossedPortalMovingRight && !portalWorldActive) {
            stopOpeningAmbience();
            stopPortalAppearSound();
            portalWorldActive = true;
            portalEnteredAt = performance.now();
            stormRainFullScreenReset = false;
            cityRevealPrompt.hidden = true;
            world.classList.add("portal-world");
        }
    }

    // The portal is a one-way boundary: allow back-and-forth movement beyond it,
    // but keep the cube from crossing back to the adventure sign.
    if (portalWorldActive && x + 25 < adventurePortalWorldX) {
        x = adventurePortalWorldX - 25;
    }

    // The closed doorway blocks movement until its bell is rung.
    if (buildingDoorWorldX !== null && !stormBuildingsPromptDismissed) {
        const doorPlayerLimit = buildingDoorWorldX - 50 - 10;
        if (x > doorPlayerLimit) {
            x = doorPlayerLimit;
            if (movingRight) {
                movingRight = false;
                keyD.classList.remove("active");
            }
        }
    }

    /*
       Prevent going before the beginning.
    */

    if (
        x < 0
    ) {

        x = 0;
    }

    // Keep the cube between invisible viewport-edge limits while the city
    // stays fixed in the camera view.
    if (continueCameraLocked) {
        continuePlayerMinX = continueCameraX;
        continuePlayerMaxX = continueCameraX + window.innerWidth - 50;
        if (x < continuePlayerMinX) {
            x = continuePlayerMinX;
            movingLeft = false;
            keyA.classList.remove("active");
        } else if (x > continuePlayerMaxX) {
            x = continuePlayerMaxX;
            movingRight = false;
            keyD.classList.remove("active");
        }
    }

    // The adventure sign belongs to the world, so let the camera scroll it away.
    const cameraX = getCameraX();
    if (gameLoop.lastCameraX !== cameraX) {
        gameLoop.lastCameraX = cameraX;
        worldOverlay.style.transform = `translate3d(${-cameraX}px, 0, 0)`;
    }

    activateAdventurePromptAfterPassingPoint(frameTime);
    drawAdventurePrompt(frameTime);
    if (doorNeonIgniteStarted && frameTime - doorNeonIgniteStarted < 2200) {
        const neonProgress = Math.max(0, (frameTime - doorNeonIgniteStarted) / 2200);
        registerParticleMotionSound(.32 * Math.sin(neonProgress * Math.PI));
    }
    updateParticleMotionSound();

    drawGround();

    updatePlayer();
    updateBuildingsPrompt();

    if (!redPathActive) drawCity();

    updateControls();


    requestAnimationFrame(
        gameLoop
    );
}


/* ============================================================
   MOUSE TRAIL CANVAS
   Creates the custom neon cursor.
   ============================================================ */

const trailCanvas =
    document.createElement(
        "canvas"
    );


trailCanvas.id =
    "mouseTrailCanvas";


document.body.appendChild(
    trailCanvas
);


const trailContext =
    trailCanvas.getContext(
        "2d"
    );


let mouseX = 0;

let mouseY = 0;

let mouseInside = false;


/*
   Stores previous cursor positions.
*/

const trailPoints = [];

const maxTrailPoints = 40;


/* ============================================================
   RESIZE TRAIL CANVAS
   Keeps the canvas sharp on high-DPI displays.
   ============================================================ */

function resizeTrailCanvas() {

    const ratio =
        window.devicePixelRatio ||
        1;


    trailCanvas.width =
        window.innerWidth *
        ratio;


    trailCanvas.height =
        window.innerHeight *
        ratio;


    trailCanvas.style.width =
        window.innerWidth +
        "px";


    trailCanvas.style.height =
        window.innerHeight +
        "px";


    trailContext.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );
}


/* ============================================================
   MOUSE MOVE
   Adds the current cursor position to the trail.
   ============================================================ */

document.addEventListener(
    "mousemove",
    function(event) {

        mouseX =
            event.clientX;

        mouseY =
            event.clientY;

        mouseInside = true;


        trailPoints.unshift({

            x: mouseX,

            y: mouseY,

            life: 1

        });


        /*
           Limit the number of trail points.
        */

        if (
            trailPoints.length >
            maxTrailPoints
        ) {

            trailPoints.pop();
        }
    }
);


/* ============================================================
   DRAW MOUSE TRAIL
   Draws the glowing blue line and cursor dot.
   ============================================================ */

function updateMouseTrail() {

    if (!mouseInside && trailPoints.length <= 1) {
        if (updateMouseTrail.hadVisibleTrail) {
            const bounds = updateMouseTrail.drawBounds;
            if (bounds) {
                trailContext.clearRect(bounds.left, bounds.top, bounds.width, bounds.height);
            }
            updateMouseTrail.drawBounds = null;
            updateMouseTrail.hadVisibleTrail = false;
        }
        requestAnimationFrame(updateMouseTrail);
        return;
    }

    const now = performance.now();
    const elapsed = Math.min(now - (updateMouseTrail.lastTime || now), 50);
    updateMouseTrail.lastTime = now;

    const trailColor = redPathActive || cubeLanded
        ? { rgb: "255, 83, 98", hex: "#ff5362" }
        : { rgb: "0, 170, 255", hex: "#00aaff" };
    const cameraX = getCameraX();
    let targetInteractionGlow = 0;
    const glowRadius = 190;
    const proximityToRect = rect => {
        const dx = Math.max(rect.left - mouseX, 0, mouseX - rect.right);
        const dy = Math.max(rect.top - mouseY, 0, mouseY - rect.bottom);
        return Math.max(0, 1 - Math.hypot(dx, dy) / glowRadius);
    };

    if (mouseInside && !redPathActive) {
        if (adventurePromptTriggered && adventurePromptBounds) {
            targetInteractionGlow = Math.max(targetInteractionGlow, proximityToRect({
                left: adventurePromptBounds.left - cameraX,
                top: adventurePromptBounds.top,
                right: adventurePromptBounds.left + adventurePromptBounds.width - cameraX,
                bottom: adventurePromptBounds.top + adventurePromptBounds.height
            }));
        }

        for (const prompt of [cityRevealPrompt, continuePrompt]) {
            if (prompt.hidden) continue;
            const bounds = prompt.getBoundingClientRect();
            targetInteractionGlow = Math.max(targetInteractionGlow, proximityToRect(bounds));
        }

        if (cityRevealStarted) {
            const city = getCityTiming();
            const cityScreenX = city.imageX - (cameraX - cityCameraAnchor);
            targetInteractionGlow = Math.max(targetInteractionGlow, proximityToRect({
                left: cityScreenX,
                top: city.imageY,
                right: cityScreenX + city.imageWidth,
                bottom: city.imageY + city.imageHeight
            }));
        }
    }

    const glowBlend = 1 - Math.exp(-Math.max(elapsed, 1) / 120);
    const currentGlow = updateMouseTrail.glow || 0;
    updateMouseTrail.glow = currentGlow + (targetInteractionGlow - currentGlow) * glowBlend;
    const interactionGlow = updateMouseTrail.glow;

    const previousBounds = updateMouseTrail.drawBounds;
    if (previousBounds) {
        trailContext.clearRect(
            previousBounds.left,
            previousBounds.top,
            previousBounds.width,
            previousBounds.height
        );
    }


    if (
        mouseInside &&
        trailPoints.length > 1
    ) {
        updateMouseTrail.hadVisibleTrail = true;

        /*
           Keep the front of the trail
           exactly underneath the cursor.
        */

        trailPoints[0].x =
            mouseX;

        trailPoints[0].y =
            mouseY;


        /*
           Smoothly pull older trail points
           toward the points in front of them.
        */

        for (
            let i = 1;
            i <
            trailPoints.length;
            i++
        ) {

            const point =
                trailPoints[i];

            const previous =
                trailPoints[i - 1];


            point.x +=
                (
                    previous.x -
                    point.x
                ) * 0.3;


            point.y +=
                (
                    previous.y -
                    point.y
                ) * 0.3;


            point.life *=
                0.94;
        }


        trailContext.lineCap =
            "round";


        trailContext.lineJoin =
            "round";

        // Apply the soft glow once to the whole trail instead of blurring every segment.
        trailContext.beginPath();
        trailContext.moveTo(trailPoints[0].x, trailPoints[0].y);
        for (let i = 1; i < trailPoints.length; i++) {
            trailContext.lineTo(trailPoints[i].x, trailPoints[i].y);
        }
        trailContext.globalAlpha = .2 + interactionGlow * .2;
        trailContext.strokeStyle = trailColor.hex;
        trailContext.lineWidth = 5 + interactionGlow * 4;
        trailContext.shadowColor = trailColor.hex;
        trailContext.shadowBlur = 5 + interactionGlow * 55;
        trailContext.stroke();
        trailContext.globalAlpha = 1;
        trailContext.shadowBlur = 0;

        /*
           Draw each section of the trail.
        */

        for (
            let i = 0;
            i <
            trailPoints.length - 1;
            i++
        ) {

            const point =
                trailPoints[i];

            const next =
                trailPoints[i + 1];


            const progress =
                i /
                trailPoints.length;


            const alpha =
                (1 - progress) * (0.12 + interactionGlow * 0.88);


            const width =
                3.5 - progress * 2 + interactionGlow * 8;


            trailContext.beginPath();


            trailContext.moveTo(
                point.x,
                point.y
            );


            trailContext.lineTo(
                next.x,
                next.y
            );


            trailContext.strokeStyle =
                `rgba(
                    ${trailColor.rgb},
                    ${alpha}
                )`;
            trailContext.lineWidth =
                width;


            trailContext.shadowBlur = 0;
            trailContext.stroke();
        }


        trailContext.shadowBlur =
            0;


        trailContext.beginPath();


        trailContext.arc(
            mouseX,
            mouseY,
            4 + interactionGlow * 5,
            0,
            Math.PI * 2
        );


        trailContext.fillStyle =
            `rgba(${trailColor.rgb}, ${0.22 + interactionGlow * 0.78})`;


        trailContext.shadowColor =
            trailColor.hex;


        trailContext.shadowBlur =
            6 + interactionGlow * 70;


        trailContext.fill();


        trailContext.beginPath();


        trailContext.arc(
            mouseX,
            mouseY,
            2,
            0,
            Math.PI * 2
        );


        trailContext.fillStyle =
            "white";


        trailContext.shadowBlur =
            0;


        trailContext.fill();
    }

    if (mouseInside && trailPoints.length > 1) {
        let minX = mouseX;
        let maxX = mouseX;
        let minY = mouseY;
        let maxY = mouseY;
        for (const point of trailPoints) {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        }
        const padding = 96;
        const left = Math.max(0, minX - padding);
        const top = Math.max(0, minY - padding);
        updateMouseTrail.drawBounds = {
            left,
            top,
            width: Math.min(window.innerWidth, maxX + padding) - left,
            height: Math.min(window.innerHeight, maxY + padding) - top
        };
    } else {
        updateMouseTrail.drawBounds = null;
    }


    requestAnimationFrame(
        updateMouseTrail
    );
}


/* ============================================================
   MOUSE LEAVE
   Clears the trail when the cursor leaves the page.
   ============================================================ */

document.addEventListener(
    "mouseleave",
    function() {

        mouseInside = false;

        trailPoints.length = 0;
    }
);


/* ============================================================
   MOUSE ENTER
   Restarts the trail when the cursor returns.
   ============================================================ */

document.addEventListener(
    "mouseenter",
    function(event) {

        mouseInside = true;

        mouseX =
            event.clientX;

        mouseY =
            event.clientY;


        trailPoints.length = 0;


        trailPoints.push({

            x: mouseX,

            y: mouseY,

            life: 1

        });
    }
);


/* ============================================================
   INITIALIZE
   ============================================================ */

window.addEventListener(
    "resize",
    resizeTrailCanvas
);


resizeTrailCanvas();

drawGround();

drawCity();

updateControls();


updatePlayer();

gameLoop();

updateMouseTrail();

