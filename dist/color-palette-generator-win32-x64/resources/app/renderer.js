document.getElementById('generateBtn').addEventListener('click', generatePalette);
document.getElementById('hueSlider').addEventListener('input', updateHueValue);
document.getElementById('saturationSlider').addEventListener('input', updateSaturationValue);
document.getElementById('luminanceSlider').addEventListener('input', updateLuminanceValue);
document.getElementById('copyImageBtn').addEventListener('click', copyPaletteImage);
document.getElementById('generateIndividualPalettesBtn').addEventListener('click', generateIndividualPalettes);

function generatePalette() {
    generateColorsFromInitialColor(true);
}

function generateColorsFromInitialColor(useInitialColorForSaturation) {
    const colorPicker = document.getElementById('colorPicker');
    const initialColor = colorPicker.value;
    const paletteSize = parseInt(document.getElementById('paletteSize').value);
    const palette = document.getElementById('palette');
    palette.innerHTML = '';

    const hueJitter = parseInt(document.getElementById('hueSlider').value);
    const saturationJitter = parseFloat(document.getElementById('saturationSlider').value);
    const luminanceJitter = parseFloat(document.getElementById('luminanceSlider').value);

    for (let i = 0; i < paletteSize; i++) {
        let hue, saturation, luminance;
        if (i === 0) {
            hue = chroma(initialColor).get('hsl.h');
            saturation = 1; // Maximum saturation
            luminance = chroma(initialColor).get('hsl.l');
        } else {
            hue = (chroma(initialColor).get('hsl.h') + getRandomInt(-hueJitter, hueJitter)) % 360;
            saturation = clamp(getRandomFloat(0, 1), 0, 1); // Random saturation between 0 and 1
            luminance = clamp(getRandomFloat(0, 1), 0, 1); // Random luminance between 0 and 1
        }

        let color = chroma.hsl(hue, saturation, luminance).hex();

        const colorDiv = document.createElement('div');
        colorDiv.className = 'color';
        colorDiv.style.backgroundColor = color;
        colorDiv.innerText = color;
        palette.appendChild(colorDiv);
    }

    drawPaletteOnCanvas();
}

function drawPaletteOnCanvas() {
    const canvas = document.getElementById('paletteCanvas');
    const ctx = canvas.getContext('2d');
    const paletteColors = document.querySelectorAll('.color');
    const colorWidth = canvas.width / paletteColors.length;

    paletteColors.forEach((colorDiv, index) => {
        const color = colorDiv.style.backgroundColor;
        ctx.fillStyle = color;
        ctx.fillRect(index * colorWidth, 0, colorWidth, canvas.height);
    });
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

function copyPaletteImage() {
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

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}
