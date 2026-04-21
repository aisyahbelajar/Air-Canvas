# 🎨 AirCanvas – Gesture-Based Drawing Web App

AirCanvas is a real-time web application that allows users to draw on a digital canvas using **hand gestures via webcam**, without requiring a mouse or touch input.

This project demonstrates the integration of **computer vision, real-time rendering, and modern frontend architecture**.

---

## 🚀 Features

* ✋ Hand gesture-based drawing (no physical input)
* 📷 Real-time webcam integration
* 🎨 Smooth canvas drawing using finger tracking
* 🎛️ Adjustable brush size and color
* 🧹 Clear canvas functionality
* 📊 Live status indicators (camera & hand detection)
* ⚡ Optimized rendering for performance (no unnecessary re-renders)

---

## 🧠 How It Works

The application follows a real-time processing pipeline:

Camera → Hand Tracking → Gesture Detection → Canvas Rendering

1. Webcam captures live video
2. Hand tracking detects finger position
3. Gesture logic determines drawing state
4. Canvas renders strokes based on movement

---

## 🧩 Tech Stack

### Frontend

* React (Vite)
* JavaScript (ES6)

### Computer Vision

* MediaPipe Hands

### Rendering

* HTML5 Canvas API

### UI

* Tailwind CSS
* shadcn/ui components

---

## 🏗️ Project Structure

```bash
src/
 ├── components/
 │    ├── AirCanvasApp.jsx
 │    ├── Camera.jsx
 │    ├── CanvasLayer.jsx
 │    └── ControlPanel.jsx
 │
 ├── hooks/
 │    ├── useCamera.js
 │    ├── useHandTracking.js
 │    └── useGesture.js
 │
 ├── routes/
 │    ├── __root.tsx
 │    └── index.tsx
 │
 ├── utils/
 ├── router.tsx
 └── styles.css
```

---

## ⚙️ Installation

```bash
git clone https://github.com/aisyahbelajar/Air-Canvas.git
cd Air-Canvas
npm install
npm run dev
```

---

## ⚠️ Requirements

* Modern browser (Chrome recommended)
* Camera access permission

---

## 🎯 Key Learning Points

* Real-time data handling in React
* Using `useRef` for performance optimization
* Separation of concerns (UI vs logic)
* Integrating AI into frontend applications
* Canvas rendering techniques

