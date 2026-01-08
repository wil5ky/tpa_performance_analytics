
import os

with open('image_b64.txt', 'r') as f:
    b64_data = f.read().strip()

html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Color Extractor</title>
</head>
<body>
    <img id="source-image" src="data:image/png;base64,{b64_data}" style="display:none;" />
    <canvas id="canvas"></canvas>
    <div id="results">Processing...</div>

    <script>
        window.onload = function() {{
            const img = document.getElementById('source-image');
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const colorCounts = {{}};
            const pixelCount = canvas.width * canvas.height;
            const sampleStep = 10; // Sample every 10th pixel to save time
            
            for (let i = 0; i < data.length; i += 4 * sampleStep) {{
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];
                
                if (a < 128) continue; // Skip transparent
                
                // Quantize colors to reduce noise (round to nearest 10)
                const qr = Math.round(r / 10) * 10;
                const qg = Math.round(g / 10) * 10;
                const qb = Math.round(b / 10) * 10;
                
                const key = `${{qr}},${{qg}},${{qb}}`;
                colorCounts[key] = (colorCounts[key] || 0) + 1;
            }}
            
            // Sort by frequency
            const sortedColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
            
            // Take top colors, filtering for distinctness
            const palette = [];
            const minDiff = 50; // Minimum euclidean distance to be considered different
            
            function colorDist(c1, c2) {{
                return Math.sqrt(
                    Math.pow(c1[0] - c2[0], 2) +
                    Math.pow(c1[1] - c2[1], 2) +
                    Math.pow(c1[2] - c2[2], 2)
                );
            }}
            
            for (const [colorStr, count] of sortedColors) {{
                const [r, g, b] = colorStr.split(',').map(Number);
                const current = [r, g, b];
                
                let isDistinct = true;
                for (const existing of palette) {{
                    const [er, eg, eb] = existing.color;
                    if (colorDist(current, [er, eg, eb]) < minDiff) {{
                        isDistinct = false;
                        break;
                    }}
                }}
                
                if (isDistinct) {{
                    palette.push({{ color: current, hex: rgbToHex(r, g, b) }});
                }}
                
                if (palette.length >= 8) break;
            }}
            
            function rgbToHex(r, g, b) {{
                return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
            }}
            
            const resultDiv = document.getElementById('results');
            resultDiv.innerHTML = JSON.stringify(palette.map(p => p.hex));
        }};
    </script>
</body>
</html>
"""

with open('extract_colors.html', 'w') as f:
    f.write(html_content)

print("extract_colors.html created")
