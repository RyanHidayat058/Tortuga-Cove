# 🏴‍☠️ Tortuga Cove

> **Multiplayer Pirate Board Game Platform** built with Laravel 12, Inertia.js, React, and Tailwind CSS.

---

## ⚓ Overview

**Tortuga Cove** is an interactive, real-time pirate-themed board game tavern where players can register, add crew members (friends), create private game rooms, and compete in pirate board games:

1. **Corsair's Cove (Splendor)**:
   - Resource plundering, merchant trading, noble recruitment, and ship upgrades.
   - Earn Infamy points by buying development cards and attracting Pirate Lords.
   - First captain to amass **15 Infamy** wins the cove!

2. **Serpents & Rigging (Snakes & Ladders)**:
   - Navigate stormy seas and treacherous waters with 2–4 players.
   - Scale rigging ropes (tangga) to surge forward.
   - Beware of lurking sea serpents (ular laut) that drag your ship down.
   - First pirate to anchor safely at **Cell 100** claims victory!

3. **Ikuti Jejak Kapten (Coming Soon)**:
   - Upcoming game mode where crew members follow the legendary captain's coordinates!

---

## 🎨 Design System

Tortuga Cove adheres to an exclusive high-contrast 4-color pirate palette in both Light and Dark themes:
- **`#091540`** (Deep Abyssal Navy)
- **`#2E438F`** (Royal Naval Blue)
- **`#A6B9FF`** (Pastel Periwinkle)
- **`#FFFFFF`** (Pure Salt White)

---

## 🚀 Tech Stack

- **Backend**: Laravel 12 (PHP 8.3)
- **Frontend**: React 18, Inertia.js 2.0
- **Styling**: Tailwind CSS (with custom 4-color palette)
- **Database**: SQLite (Development / Production ready)
- **Authentication**: Laravel Breeze + Custom 6-digit Email OTP Verification
- **Realtime / State**: Inertia polling engine + state synchronization

---

## 🛠️ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/RyanHidayat058/Tortuga-Cove.git
cd Tortuga-Cove
```

### 2. Install Dependencies
```bash
composer install
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env
php artisan key:generate
```

### 4. Database Setup & Migration
```bash
touch database/database.sqlite
php artisan migrate
```

### 5. Run Development Servers
In separate terminal windows:
```bash
# Terminal 1 - Backend Server
php artisan serve

# Terminal 2 - Frontend Hot Module Reload
npm run dev
```

Visit the tavern at: [http://localhost:8000](http://localhost:8000)

---

## 🧪 Testing

Run PHPUnit automated test suites:
```bash
php artisan test --compact
```

Run code formatting check:
```bash
vendor/bin/pint --format agent
```

---

## 📜 License
Licensed under the [MIT License](LICENSE).
