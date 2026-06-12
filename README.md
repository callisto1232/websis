# H.A.M.S. // Hardware Monitor Server

A sleek, lightweight, full-stack hardware telemetry node designed for Linux environments. This system utilizes a lightweight **FastAPI** daemon to pull native hardware benchmarks via `psutil` and streams live metrics to an interactive, responsive **React (Vite)** dashboard panel using high-frequency polling.

## 🚀 Core Features

- **Live CPU Matrix:** Individual multi-core scaling tracks with real-time clock frequency tracking and integrated thermal monitoring.
- **Historical Activity Plots:** Active SVG vector timelines rendering a continuous 30-second rolling graph of overall processing loads.
- **Volumetric Memory Gauges:** Interactive SVG radial donut arcs displaying active virtual RAM allocations and Swap space saturation.
- **IO Networking Throughput:** Real-time differential delta counters computing true download and upload speeds in MB/s.
- **Application Load Rankings:** High-frequency task parsing tracking top resource-heavy processes running natively in the background workspace.

<img width="1122" height="846" alt="image" src="https://github.com/user-attachments/assets/cbdb836e-1abc-4bea-94d9-f7a59f37c678" />


## 🏗️ Project Architecture

```text
websis/
├── server.py             # FastAPI backend engine (Telemery Collector)
└── websis/               # Frontend React Application
    ├── src/
    │   ├── App.jsx       # Interface Viewport & SVG Layout Engines
    │   └── main.jsx      # Vite Render Root Entry
    ├── package.json      # Node Dependency Tree Node
    └── vite.config.js    # Bundler Configurations
