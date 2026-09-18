import fs from 'fs';
import path from 'path';

const srcDir = 'c:\\Users\\USER\\Documents\\Altar\\RiversideGuestHouse\\web\\public\\extracted_images\\RiversideGuestHouse';
const destDir = 'c:\\Users\\USER\\Documents\\Altar\\RiversideGuestHouse\\web\\public\\images';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const map = {
  'hero-exterior.jpg': 'PXL_20260916_074906472.RAW-01.COVER.jpg',
  'room-double-1.jpg': 'PXL_20260916_074559321.RAW-01.COVER.jpg',
  'room-double-2.jpg': 'PXL_20260916_074720104.RAW-01.COVER.jpg',
  'room-double-3.jpg': 'PXL_20260916_073918950.RAW-01.COVER.jpg',
  'room-double-4.jpg': 'PXL_20260916_074559321.RAW-01.COVER.jpg',
  'bathroom-1.jpg': 'PXL_20260916_074027332.RAW-01.COVER.jpg',
  'bathroom-2.jpg': 'PXL_20260916_073300884.RAW-01.COVER.jpg',
  'bathroom-3.jpg': 'PXL_20260916_073317429.RAW-01.COVER.jpg',
  'corridor.jpg': 'PXL_20260916_073551162.RAW-01.COVER.jpg',
  'hallway.jpg': 'PXL_20260916_073713116.RAW-01.COVER.jpg',
  'grounds.jpg': 'PXL_20260916_075335693.RAW-01.COVER.jpg',
  'garden.jpg': 'PXL_20260916_075515289.RAW-01.COVER.jpg',
  'patio.jpg': 'PXL_20260916_075212080.RAW-01.COVER.jpg',
  'parking.jpg': 'PXL_20260916_074834889.RAW-01.COVER.jpg',
  'yard.jpg': 'PXL_20260916_075008958.RAW-01.COVER.jpg',
  'exterior-gate.jpg': 'PXL_20260916_075728225.RAW-01.COVER.jpg'
};

for (const [destName, srcName] of Object.entries(map)) {
  const srcPath = path.join(srcDir, srcName);
  const destPath = path.join(destDir, destName);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${srcName} -> ${destName} (${fs.statSync(destPath).size} bytes)`);
  } else {
    console.warn(`File not found: ${srcPath}`);
  }
}
