document.getElementById('generateBtn').addEventListener('click', generatePalette);
document.getElementById('hueSlider').addEventListener('input', updateHueValue);
document.getElementById('saturationSlider').addEventListener('input', updateSaturationValue);
document.getElementById('luminanceSlider').addEventListener('input', updateLuminanceValue);
document.getElementById('interpolation').addEventListener('change', updatePaletteInterpolation);
document.getElementById('copyImageBtn').addEventListener('click', savePaletteImage);
document.getElementById('decreasePaletteSize').addEventListener('click', decreasePaletteSize);
document.getElementById('increasePaletteSize').addEventListener('click', increasePaletteSize);

let currentPaletteColors = [];

function getInterpolationFunction(name) {
    switch (name) {
        case 'easeInQuart':
            return easeInQuart;
        case 'easeOutElastic':
            return easeOutElastic;
        case 'easeOutBounce':
            return easeOutBounce;
        case 'spike':
            return spike;
        case 'lerp':
        default:
            return lerp;
    }
}

function generatePalette() {
    const colorPicker = document.getElementById('colorPicker');
    const initialColor = colorPicker.value;
    const paletteSize = parseInt(document.getElementById('paletteSize').value);
    const hueJitter = parseInt(document.getElementById('hueSlider').value);
    const saturationJitter = parseFloat(document.getElementById('saturationSlider').value);
    const luminanceJitter = parseFloat(document.getElementById('luminanceSlider').value);
    const interpolationMethod = document.getElementById('interpolation').value;

    currentPaletteColors = generateColors(initialColor, paletteSize, hueJitter, saturationJitter, luminanceJitter, interpolationMethod);
    updatePaletteUI(currentPaletteColors);
}

function generateColors(initialColor, paletteSize, hueJitter, saturationJitter, luminanceJitter, interpolationMethod) {
    const colors = [];
    const initialHue = chroma(initialColor).get('hsl.h');
    const initialSaturation = chroma(initialColor).get('hsl.s');
    const initialLuminance = chroma(initialColor).get('hsl.l');

    const minSaturation = 0.5;
    const maxSaturation = initialSaturation;

    const interpolate = getInterpolationFunction(interpolationMethod);

    for (let i = 0; i < paletteSize; i++) {
        let hue, saturation, luminance;
        if (i === 0) {
            hue = initialHue;
            saturation = initialSaturation;
            luminance = initialLuminance;
        } else {
            hue = (initialHue + getRandomInt(-hueJitter, hueJitter)) % 360;
            luminance = clamp(initialLuminance + getRandomFloat(-luminanceJitter, luminanceJitter), 0, 1);

            const hueDifference = getHueDifference(initialColor, chroma.hsl(hue, 1, luminance).hex());
            saturation = interpolate(maxSaturation, minSaturation, hueDifference);
            saturation = clamp(saturation + getRandomFloat(-saturationJitter, saturationJitter), 0, 1);
        }

        let color = chroma.hsl(hue, saturation, luminance).hex();
        while (colors.includes(color)) {
            hue = (initialHue + getRandomInt(-hueJitter, hueJitter)) % 360;
            luminance = clamp(initialLuminance + getRandomFloat(-luminanceJitter, luminanceJitter), 0, 1);

            const hueDifference = getHueDifference(initialColor, chroma.hsl(hue, 1, luminance).hex());
            saturation = interpolate(maxSaturation, minSaturation, hueDifference);
            saturation = clamp(saturation + getRandomFloat(-saturationJitter, saturationJitter), 0, 1);

            color = chroma.hsl(hue, saturation, luminance).hex();
        }

        colors.push(color);
    }

    return colors;
}

function updatePaletteUI(colors) {
    const palette = document.getElementById('palette');
    palette.innerHTML = '';

    colors.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'color';
        colorDiv.style.backgroundColor = color;
        colorDiv.innerText = color;
        palette.appendChild(colorDiv);
    });

    drawPaletteOnCanvas(colors);
}

function getHueDifference(color1, color2) {
    const hue1 = chroma(color1).get('hsl.h');
    const hue2 = chroma(color2).get('hsl.h');

    let hueDifference = Math.abs(hue1 - hue2);
    if (hueDifference > 180) {
        hueDifference = 360 - hueDifference;
    }

    return hueDifference / 180.0;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function easeInQuart(t) {
    return t * t * t * t;
}

function easeOutElastic(t) {
    return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
}

function easeOutBounce(t) {
    if (t < (1 / 2.75)) {
        return 7.5625 * t * t;
    } else if (t < (2 / 2.75)) {
        return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75;
    } else if (t < (2.5 / 2.75)) {
        return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375;
    } else {
        return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
    }
}

function spike(t) {
    return t < 0.5 ? 2 * t : 2 * (1 - t);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function updateHueValue() {
    const hueValue = document.getElementById('hueSlider').value;
    document.getElementById('hueValue').innerText = hueValue;
    generatePalette(); // Regenerate palette on slider change
}

function updateSaturationValue() {
    const saturationValue = document.getElementById('saturationSlider').value;
    document.getElementById('saturationValue').innerText = saturationValue;
    generatePalette(); // Regenerate palette on slider change
}

function updateLuminanceValue() {
    const luminanceValue = document.getElementById('luminanceSlider').value;
    document.getElementById('luminanceValue').innerText = luminanceValue;
    generatePalette(); // Regenerate palette on slider change
}

function updatePaletteInterpolation() {
    generatePalette(); // Regenerate palette on interpolation method change
}

function drawPaletteOnCanvas(colors) {
    const canvas = document.getElementById('paletteCanvas');
    const ctx = canvas.getContext('2d');
    const colorWidth = canvas.width / colors.length;

    colors.forEach((color, index) => {
        ctx.fillStyle = color;
        ctx.fillRect(index * colorWidth, 0, colorWidth, canvas.height);
    });
}

function savePaletteImage() {
    const canvas = document.getElementById('paletteCanvas');
    canvas.toBlob(async (blob) => {
        try {
            await navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]);
            showCopyMessage();
        } catch (err) {
            console.error('Failed to copy image: ', err);
            alert('Failed to copy image.');
        }
    });
}
// Function to decrease palette size by removing the last swatch
function decreasePaletteSize() {
    const palette = document.getElementById('palette');
    const lastColorDiv = palette.lastElementChild;
    if (lastColorDiv) {
        palette.removeChild(lastColorDiv);
    }
    const paletteSizeInput = document.getElementById('paletteSize');
    const currentPaletteSize = parseInt(paletteSizeInput.value);
    const newPaletteSize = currentPaletteSize - 1;

    paletteSizeInput.value = newPaletteSize;
}

// Function to increase palette size by adding a single swatch
function increasePaletteSize() {
    const palette = document.getElementById('palette');
    const initialColor = document.getElementById('colorPicker').value;

    const hueJitter = parseInt(document.getElementById('hueSlider').value);
    const saturationJitter = parseFloat(document.getElementById('saturationSlider').value);
    const luminanceJitter = parseFloat(document.getElementById('luminanceSlider').value);

    let hue = (chroma(initialColor).get('hsl.h') + getRandomInt(-hueJitter, hueJitter)) % 360;
    let saturation = clamp(getRandomFloat(0, 1), 0, 1);
    let luminance = clamp(getRandomFloat(0, 1), 0, 1);

    let color = chroma.hsl(hue, saturation, luminance).hex();

    const colorDiv = document.createElement('div');
    colorDiv.className = 'color';
    colorDiv.style.backgroundColor = color;
    colorDiv.innerText = color;
    const paletteSizeInput = document.getElementById('paletteSize');
    const currentPaletteSize = parseInt(paletteSizeInput.value);
    const newPaletteSize = currentPaletteSize + 1;

    paletteSizeInput.value = newPaletteSize;
    palette.appendChild(colorDiv);
}
function showCopyMessage() {
    const copyMessage = document.getElementById('copyMessage');
    copyMessage.classList.remove('hidden');
    setTimeout(() => {
        copyMessage.classList.add('hidden');
    }, 2000); // Hide the message after 2 seconds
}
