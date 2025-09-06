const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('viewer');
const ctx = canvas.getContext('2d');
const statusBar = document.getElementById('status');

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
    loadImageStandard(file);
  } else if (fileName.endsWith('.gb7')) {
    loadImageGB7(file);
  } else {
    alert("Неподдерживаемый формат!");
  }
});

// Загрузка PNG/JPG
function loadImageStandard(file) {
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    statusBar.innerText = `Файл: ${file.name}, ширина=${img.width}px, высота=${img.height}px, глубина=24бит (RGB)`;
  };
  img.src = URL.createObjectURL(file);
}

// Загрузка GB7 (упрощённо)
async function loadImageGB7(file) {
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);

  if (data[0] !== 0x47 || data[1] !== 0x42 || data[2] !== 0x37 || data[3] !== 0x1D) {
    alert("Неверная сигнатура GB7!");
    return;
  }

  const width = (data[6] << 8) | data[7];
  const height = (data[8] << 8) | data[9];
  const flag = data[5];
  const hasMask = (flag & 0x01) === 1;

  const pixels = data.slice(12);

  canvas.width = width;
  canvas.height = height;
  const imageData = ctx.createImageData(width, height);

  let idx = 0;
  for (let i = 0; i < pixels.length; i++) {
    const gray7 = pixels[i] & 0x7F;
    const gray8 = gray7 * 2;
    const mask = (pixels[i] & 0x80) >> 7;

    imageData.data[idx++] = gray8;
    imageData.data[idx++] = gray8;
    imageData.data[idx++] = gray8;
    imageData.data[idx++] = hasMask ? (mask ? 255 : 0) : 255;
  }

  ctx.putImageData(imageData, 0, 0);
  statusBar.innerText = `Файл: ${file.name}, ширина=${width}px, высота=${height}px, глубина=7бит (GrayBit-7)`;
}