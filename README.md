# Piscine 01/09/2025 – Journal de voyage interactif

Starter **Expo React Native** + **Backend Node.js Docker** (Postgres).  
> Choix Expo pour vitesse/simplicité sur 1 semaine. Vous pourrez *éjecter* vers React Native CLI si besoin.

## ✅ Fonctionnalités prévues (front)
- Caméra (via `expo-image-picker`) pour prendre une photo
- Localisation GPS (via `expo-location`)
- Carte (via `react-native-maps`) avec marqueurs
- Calendrier (via `react-native-calendars`) pour marquer les jours avec photos
- Liste de toutes les photos + filtres (date / rayon autour d’un lieu)
- Profil avec infos utilisateur + statistiques (nb photos, nb jours, etc.)
- Navigation par onglets : Caméra • Carte • Calendrier • Photos • Profil

## ✅ Backend (API)
- `GET /health`
- `GET /photos` – liste les photos (si DB connectée)
- `POST /photos` – ajoute une photo (métadonnées)
- Postgres auto-init (table `photos`) au démarrage

---

## 🚀 Démarrage rapide

### 1) Backend (Docker)
```bash
cp .env.example .env
docker compose up --build
```
- API: http://localhost:3000
- Postgres: localhost:5432 (user/pass: postgres/postgres)

### 2) Mobile (Expo)
> Requiert Node.js LTS (>= 18) et **Expo CLI** via `npx`

```bash
cd mobile
npm install
npm run start
```
Sur **iOS Simulator** : `i`  
Sur **Android Emulator** : `a`  
Sur **téléphone réel** : scannez le QR dans Expo Go (même Wi‑Fi que votre machine).

> Réseaux pendant le dev :
> - iOS Simulator → `http://localhost:3000`
> - Android Emulator (AVD) → `http://10.0.2.2:3000`
> - Téléphone réel → `http://<IP locale de votre machine>:3000` (ex: `192.168.1.42`)

Configurez l’URL API dans `src/lib/api.ts`.

---

## 🔧 Variables d’environnement

Créez `.env` à la racine (pour Docker) à partir de `.env.example`.

Côté **mobile**, ajustez la clé Google Maps si vous voulez le provider Google sur Android/iOS
dans `app.json` (facultatif pour dev).

---

## 🗂 Structure
```
journal-voyage-starter/
├─ backend/                # API Node + Postgres (Docker)
├─ mobile/                 # App Expo React Native
└─ docker-compose.yml
```

---

## 📝 Notes
- Ce starter est pensé pour **rapidité** : Expo gère la majorité du natif pour vous.
- Besoin d’un module natif non supporté par Expo ? Vous pourrez *prébuild/éjecter*.
- Carte Google sur Android requiert une clé API si vous voulez les tuiles Google.

Bon courage et bon build ! 💪📱🗺️
