# jest-image-snapshot-manager

UI manager for jest-image-snapshot with validation flow.

Depending on [jest-image-snapshot](https://github.com/americanexpress/jest-image-snapshot).


# TODO:
-  Passer la version en string
-  Gérer les différentes tailles de devices
  -  Ajouter une configuration DEVICE <=> '-SUFFIX' pour regrouper les tests avec le même label (sans le suffix du device)
-  Gestion des changelogs ? Commentaire à l’approbation/décline ?
-  Possibilité d'ajouter des ressources sur un snapshot: seulement une liste d'URL pour le moment
-  Faire un composant "PlainMessage" pour les message de succes à l'invite/inscription et le warning si pa de snapshot sur la Home