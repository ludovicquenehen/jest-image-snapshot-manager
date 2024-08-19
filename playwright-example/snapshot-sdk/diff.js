import fs from "fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import path from 'path';

const folder1 = './tests/__screenshots__'; // Dossier contenant les premières images
const folder2 = './tests/__screenshots__/__received_output__'; // Dossier contenant les secondes images à comparer
const outputFolder = './tests/__screenshots__/__diff_output__'; // Dossier où les images diff seront enregistrées

// Vérifie si le dossier de sortie existe, sinon le créer
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
}

// Récupère tous les fichiers dans le premier dossier
fs.readdirSync(folder1).forEach(file => {
    const imgPath1 = path.join(folder1, file);
		if (fs.statSync(imgPath1).isFile()) {
			const imgPath2 = path.join(folder2, file);
			console.log("imgPath1", imgPath1)
			console.log("imgPath2", imgPath2)

			// Vérifie si le fichier correspondant existe dans le second dossier
			if (fs.existsSync(imgPath2)) {
					const img1 = PNG.sync.read(fs.readFileSync(imgPath1));
					const img2 = PNG.sync.read(fs.readFileSync(imgPath2));
					const { width, height } = img1;
					const diff = new PNG({ width, height });

					// Compare les images
					pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });

					// Enregistre l'image diff
					const outputFilePath = path.join(outputFolder, file);
					fs.writeFileSync(outputFilePath, PNG.sync.write(diff));

					console.log(`Diff créé pour: ${file}`);
			} else {
					console.log(`Aucune image correspondante trouvée pour: ${file}`);
			}
		}
});
