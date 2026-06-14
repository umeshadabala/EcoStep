# 🌱 EcoStep: Carbon City (India Edition)

An innovative, tech-driven sustainability platform designed specifically for the Indian lifestyle and context to help individuals track, understand, and reduce their environmental impact through smart insights, daily missions, and a visual digital twin of their city.

## 🌐 Links

**Live Application:**  
https://ecosteps-670137610660.asia-south1.run.app/

**GitHub Repository:**  
https://github.com/umeshadabala/EcoStep

---

## 🌟 Chosen Challenge Vertical: Smart City & Sustainability Assistant

We chose the **Smart & Sustainable Living** vertical, focusing on:
1. **Context-Aware Personalization**: Onboarding adapts to local Indian regions, commuting choices, and dietary habits.
2. **Indian Context Integration**: Rather than using generic US/EU carbon emission factors, the data models are specifically tailored to Indian lifestyles, including local transport modes (auto-rickshaws, metro trains, two-wheelers), household appliances (desert coolers, geysers, air conditioners), local shopping habits (local sabzi mandi vs quick-commerce apps), and regional climate characteristics.
3. **Gamified Feedback Loop**: Users can see their carbon footprint visually reflected in a dynamic, SVG-animated city view that transitions across four states (Thriving, Struggling, Polluted, Critical), unlocking features like solar panels, metro rail systems, and bike lanes as they maintain green streaks.

---

## 🎨 Design & Real-World Usability

### 1. Interactive Digital Twin (`CityView`)
The heart of the application is a responsive SVG canvas representing a custom-drawn Indian city. 
* **Dynamic Sky & Weather**: Transitions from clean sky blue (Thriving) to grey smog (Struggling), warm orange/yellow smog (Polluted), and dark industrial smoke (Critical) based on the user's weekly emissions.
* **Responsive Traffic & Streets**: Populated with auto-rickshaws, petrol scooters, electric bikes, cycle lanes, and cars depending on how clean the city is.
* **Environmental Milestones**: 
  - **Metro Transit**: Unlocks when the user maintains 2+ consecutive "green" days.
  - **Solar Roofs**: Unlocks on residential buildings when the user maintains 3+ consecutive "green" days.
  - **Eco Lanes**: Dedicated green cycling lanes unlock when the user has 5+ consecutive no-drive days.

### 2. Daily Check-in Wizard
A stepper-based interactive form that guides users through logging:
* **Commute**: Local modes such as CNG Auto Rickshaws, Metro/Local Trains, Petrol/Diesel Cars, EV two-wheelers, or Public Buses, with distance fields.
* **Diet**: Reflects Indian dietary patterns: Vegan/Satvik, Vegetarian with heavy dairy (Chai, Paneer, Ghee), and Non-Vegetarian (Daily or Occasional).
* **Home Energy**: Accounts for common appliances including Air Conditioners, Desert Coolers, Water Geysers, and backup Diesel Generators.
* **Shopping & Bazaar**: Differentiates between low-impact local bazaars/vendors (Sabzi Mandi) and high-impact modern quick-commerce/e-commerce deliveries.

### 3. Smart Insights (`InsightsPanel`)
Provides context-aware analysis of carbon logs:
* Translates numbers into relatable analogies, such as:
  - *"your food footprint is equal to ordering quick commerce delivery 5 times"*
  - *"riding an auto-rickshaw for 62 km — like a long cross-city ride"*
  - *"running a 5kVA diesel generator for 6 hours during power cuts"*
* Flags the user's highest emitting category and provides actionable green tips.

### 4. Shareable Postcard (`ShareCard`)
Generates a downloadable, high-fidelity carbon status card featuring the city's health, current log stats, active streaks, and regional metrics, allowing users to share their eco-progress and advocate for sustainable habits.

---

## ⚙️ Emission Data Logic & Assumptions

Emission calculations are handled in `src/utils/scoring.js` and use local Indian emission factors (`src/data/emissions.json`):

### 1. Transportation (kg CO₂ / km)
* **Petrol/Diesel Cars**: `0.18` (standard sedans/compact SUVs on Indian urban roads).
* **EV Cars**: `0.05` (lower carbon footprint assuming grid power mix).
* **Petrol Two-wheelers**: `0.06` (standard commuter bikes/scooters).
* **EV Two-wheelers**: `0.015` (highly efficient city transit).
* **Auto-Rickshaw (CNG)**: `0.08` (average occupancy load emissions).
* **Metro / Local Train**: `0.012` (highly efficient electrified mass transit).
* **Public Bus (DTC/BEST/BMTC)**: `0.025` (per passenger kilometer).

### 2. Diet & Food (kg CO₂ / meal)
* **Vegan / Satvik**: `0.3` (minimal dairy and packaging).
* **Vegetarian with heavy dairy**: `0.6` (paneer, ghee, and milk consumption impact).
* **Non-Vegetarian Occasionally**: `1.2` (chicken/fish a few times a week).
* **Non-Vegetarian Daily**: `2.2` (high red meat / daily poultry consumption).

### 3. Household Appliances (kg CO₂ / hour)
* **Air Conditioner**: `1.2` (typical 1.5-ton AC power draw).
* **Desert Air Cooler**: `0.15` (energy-efficient evaporation-based cooling).
* **Water Geyser**: `1.8` (high-load electrical heating elements).
* **Diesel Generator (Backup)**: `2.5` (heavy fuel consumption during power outages).
* **Fan & LED lights**: `0.03` (general low-power appliances).

### 4. Shopping & Deliveries (kg CO₂ / action)
* **Local Sabzi Mandi / Bazaar**: `0.5` (mostly local sourcing, minimal logistics footprint).
* **Quick-Commerce / E-Commerce delivery**: `2.0` (express logistics, plastic packaging, and single-use delivery vehicle footprint).
* **New Electronics / Gadgets**: `45.0` (embodied manufacturing carbon footprint).

---

## ♿ Accessibility (WCAG 2.1 Focus)

To ensure inclusion and accessibility for all users:
* **Keyboard Navigation**: Fully interactive via Tab. Modal dialogs trap focus and can be dismissed using the `Escape` key.
* **Skip Navigation Links**: Allows screen reader users to skip headers directly to the main content.
* **Aria Attributes**: All visual elements are backed by proper attributes (`role="dialog"`, `role="progressbar"`, `aria-modal="true"`, `aria-pressed`, `aria-selected`, `aria-labelledby`, `aria-describedby`).
* **Screen Reader Live Announcements**: `aria-live="polite"` live regions are utilized in the dashboard and daily missions to announce updates like mission completion and daily log savings.
* **Color Contrast**: Complies with WCAG AA standard contrast ratios with sleek dark backgrounds and accessible alert messages.

---

## 🛠 Technology Stack

### Frontend & Core
* **Framework**: React 19, Vite
* **Charts**: Recharts
* **Canvas Export**: html2canvas
* **Styling**: TailwindCSS & Custom CSS

### Testing & Verification
* **Framework**: Vitest
* **DOM Mocking**: JSDOM
* **Testing Utilities**: `@testing-library/react`

---

## 🚀 Installation & Running Locally

### Clone Repository
```bash
git clone https://github.com/umeshadabala/EcoStep.git
cd EcoStep
```

### Install Dependencies
```bash
npm install
```

### Run Locally
```bash
npm run dev
```

### Run Automated Tests
```bash
npm run test
```

### Check Linter & Standards
```bash
npm run lint
```

### Production Build
```bash
npm run build
```

---

## 🐳 Docker & Cloud Deployment

### Docker Setup
To build the Docker image:
```bash
docker build -t ecostep .
```

To run the container locally:
```bash
docker run -p 8080:8080 ecostep
```

### Google Cloud Run Deployment
To deploy the application to Google Cloud Run:
```bash
gcloud run deploy ecostep \
  --image ecostep \
  --platform managed \
  --region asia-south1
```

---

## 🔮 Future Scope

* **AI-powered sustainability recommendations**: Machine learning suggestions to optimize local commutes.
* **Community Challenges**: Local community leaderboards to compete with friends/neighbors.
* **IoT Sensor Integration**: Directly read smart meter/smart plug consumption for ACs and geysers.
* **Automatic travel logging**: Integrate mobile location API to auto-detect vehicle modes and travel distance.

---

## 📄 License

MIT License

---

Made with 💚 for a sustainable future 🌍
