# 🌱 EcoStep

An innovative, tech-driven sustainability platform designed to help individuals track, understand, and reduce their environmental impact through smart insights and eco-friendly actions.

## 🌐 Links

**Live Application:**  
https://ecosteps-670137610660.asia-south1.run.app/

**GitHub Repository:**  
https://github.com/umeshadabala/EcoStep

---

# 📌 Table of Contents

- [About](#about)
- [Problem](#problem)
- [Solution](#solution)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Future Scope](#future-scope)
- [License](#license)

---

# 🌍 About

EcoStep is a sustainability platform that helps users measure their ecological footprint and improve their daily habits.

It converts everyday activities into meaningful environmental insights and encourages users to make smarter, greener choices.

---

# 🚨 Problem

Climate change is influenced by everyday activities such as:

- Energy consumption
- Transportation
- Waste generation
- Resource usage

Many people are unaware of how much impact their daily decisions create.

---

# 💡 Solution

EcoStep provides:

- Environmental impact tracking
- Personalized sustainability insights
- Progress monitoring
- Eco-friendly action recommendations

The goal is to make sustainability simple, measurable, and achievable.

---

# ✨ Features

## 🌱 Eco Dashboard

- Track environmental metrics
- View sustainability progress
- Monitor improvements

## 📊 Analytics

- Data visualization
- Impact reports
- Habit analysis

## 🎯 Eco Challenges

- Daily sustainability tasks
- Goal-based activities
- Motivation system

## 📈 Progress Tracking

- Personal sustainability journey
- Long-term impact measurement

---

# 🛠 Technology Stack

## Frontend

- HTML5
- CSS3
- JavaScript

## Backend

- Node.js

## Database

- PostgreSQL

## Cloud

- Google Cloud Run
- Artifact Registry

## Tools

- Docker
- Git

---

# 🏗 Architecture

```
User
 |
 v
Web Browser
 |
 v
HTTPS Request
 |
 v
Google Cloud Run
 |
 +----------------+
 | Frontend       |
 +----------------+
 |
 v
 +----------------+
 | Backend API    |
 +----------------+
 |
 v
 +----------------+
 | Database       |
 +----------------+
```

---

# 🚀 Installation

## Requirements

Install:

- Git
- Node.js

---

## Clone Repository

```bash
git clone https://github.com/umeshadabala/EcoStep.git

cd EcoStep
```

---

## Install Dependencies

Python:


Node:

```bash
npm install
```

---

# 🔐 Environment Variables

Create a `.env` file:

```env

DATABASE_URL=your_database_connection

API_KEY=your_api_key
```

---

# ▶️ Running Locally

Start the application:


```bash
npm run dev
```

Open:

```
http://localhost:5173
```

---

# ☁️ Deployment

EcoStep uses Docker and Google Cloud Run.

Build image:

```bash
docker build -t ecostep .
```

Run container:

```bash
docker run -p 8080:8080 ecostep
```

Deploy:

```bash
gcloud run deploy ecostep \
--image ecostep \
--platform managed \
--region asia-south1
```

---

# 🔮 Future Scope

- AI-powered sustainability recommendations
- Carbon footprint prediction
- IoT sensor integration
- Smart home monitoring
- Community challenges
- Gamification

---

# 📄 License

MIT License

---

Made with 💚 for a sustainable future 🌍
