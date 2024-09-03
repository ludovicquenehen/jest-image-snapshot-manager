import fs from "fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import path from "path";

const folder1 = "./tests/__image_snapshots__"; // Dossier contenant les premières images
const folder2 = "./tests/__image_snapshots__/__received_output__"; // Dossier contenant les secondes images à comparer
const outputFolder = "./tests/__image_snapshots__/__diff_output__"; // Dossier où les images diff seront enregistrées

const main = () => {
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
    fs.cpSync(folder2, folder1, { recursive: true });
    fs.rmdirSync(folder2, { recursive: true });
    return;
  }

  // Récupère tous les fichiers dans le premier dossier
  fs.readdirSync(folder1).forEach((file) => {
    const imgPath1 = path.join(folder1, file);
    if (fs.statSync(imgPath1).isFile()) {
      const imgPath2 = path.join(folder2, file);

      // Vérifie si le fichier correspondant existe dans le second dossier
      if (fs.existsSync(imgPath2)) {
        const img1 = PNG.sync.read(fs.readFileSync(imgPath1));
        const img2 = PNG.sync.read(fs.readFileSync(imgPath2));
        const { width, height } = img1;
        const diff = new PNG({ width, height });

        // Compare les images
        const pixelDiff = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });

        // Enregistre l'image diff
        if (pixelDiff > 0) {
          const outputFilePath = path.join(outputFolder, file);
          fs.writeFileSync(outputFilePath, PNG.sync.write(diff));
					console.log(`Diff créé pour: ${file}`);
        }

      } else {
        console.log(`Aucune image correspondante trouvée pour: ${file}`);
      }
    }
  });
};

await main();
