document.getElementById('generateBtn').addEventListener('click', generatePalette);
document.getElementById('hueSlider').addEventListener('input', updateHueValue);
document.getElementById('saturationSlider').addEventListener('input', updateSaturationValue);
document.getElementById('luminanceSlider').addEventListener('input', updateLuminanceValue);
document.getElementById('saveImageBtn').addEventListener('click', savePaletteImage);

function generatePalette() {
    const colorPicker = document.getElementById('colorPicker');
    const initialColor = colorPicker.value;
    const palette = document.getElementById('palette');
    palette.innerHTML = '';

    const hueJitter = parseInt(document.getElementById('hueSlider').value);
    const saturationJitter = parseFloat(document.getElementById('saturationSlider').value);
    const luminanceJitter = parseFloat(document.getElementById('luminanceSlider').value);

    const colors = chroma.scale([initialColor, '#ffffff']).mode('lab').colors(5);
    const uniqueColors = new Set();

    colors.forEach(color => {
        let jitteredColor = jitterColor(color, hueJitter, saturationJitter, luminanceJitter);

        // Regenerate the color if it already exists in the palette
        while (uniqueColors.has(jitteredColor)) {
            jitteredColor = jitterColor(color, hueJitter, saturationJitter, luminanceJitter);
        }

        uniqueColors.add(jitteredColor);

        const colorDiv = document.createElement('div');
        colorDiv.className = 'color';
        colorDiv.style.backgroundColor = jitteredColor;
        colorDiv.innerText = jitteredColor;
        palette.appendChild(colorDiv);
    });

    drawPaletteOnCanvas(Array.from(uniqueColors));
}

function jitterColor(color, hueJitter, saturationJitter, luminanceJitter) {
    const hsl = chroma(color).hsl();
    const jitteredHue = (hsl[0] + getRandomInt(-hueJitter, hueJitter)) % 360;
    const jitteredSaturation = clamp(hsl[1] + getRandomFloat(-saturationJitter, saturationJitter), 0, 1);
    const jitteredLuminance = clamp(hsl[2] + getRandomFloat(-luminanceJitter, luminanceJitter), 0, 1);
    return chroma.hsl(jitteredHue, jitteredSaturation, jitteredLuminance).hex();
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
}

function updateSaturationValue() {
    const saturationValue = document.getElementById('saturationSlider').value;
    document.getElementById('saturationValue').innerText = saturationValue;
}

function updateLuminanceValue() {
    const luminanceValue = document.getElementById('luminanceSlider').value;
    document.getElementById('luminanceValue').innerText = luminanceValue;
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
            alert('Palette image copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy image: ', err);
            alert('Failed to copy image.');
        }
    });
}
