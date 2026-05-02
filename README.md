# CloudSimEx - Cloud Simulation Platform

CloudSimEx is a web-based Cloud Simulation Platform built on top of CloudSim Plus. It features a React frontend for configuring and visualizing simulated cloud environments, a Python Flask backend for API interactions, and a Java-based CloudSim Plus engine that performs the actual cloudlet and VM scheduling simulations.

## Project Structure
```text
CloudSimEx/
├── backend/                            ← Python Flask API
│   ├── app.py                          ← Main API server handling simulation requests
│   └── requirements.txt                ← Python dependencies
├── frontend/                           ← React Web Application
│   ├── public/
│   ├── src/                            ← React components and logic
│   └── package.json                    ← Node dependencies
├── simulation/                         ← Java CloudSim Plus Engine
│   ├── pom.xml                         ← Maven configuration
│   ├── src/main/java/com/cloudsim/
│   │   └── CloudSimRunner.java         ← Core CloudSim Plus simulation logic
│   └── output/                         ← Generated CSV results
├── build.bat                           ← Script to compile the Java simulation JAR
├── start_backend.bat                   ← Script to start the Flask backend 
├── start_frontend.bat                  ← Script to start the React frontend
└── test_simulation.bat                 ← Script to run manual test scenarios
```

> A user-friendly web platform for cloud environment simulation, built on top of the CloudSim Express research framework.

---

##  Project Overview

This project adds a **missing user-friendly web layer** to the CloudSim Express research framework. The original research paper proposes a script-based cloud simulation architecture but lacks an interactive interface. This project bridges that gap by building:

-  **React Frontend** — Config forms, sliders, real-time results with charts
-  **Python Flask Backend** — REST API bridge between UI and Java simulation
-  **Java Simulation Core** — CloudSim Plus 5.4.3 engine producing CSV output

---

##  Architecture

```
User (Browser)
    ↓  fills config form
React Frontend (port 3000)
    ↓  POST /simulate
Python Flask API (port 5000)
    ↓  java -jar simulation.jar args...
Java CloudSim Engine
    ↓  writes results.csv
Flask API
    ↓  parses CSV → JSON
React Frontend
    ↓  renders charts + table
```

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| Simulation Core | Java 11, CloudSim Plus 5.4.3, Maven |
| Backend API | Python 3, Flask, flask-cors |
| Frontend | React 18, Recharts, Axios |
| Build | Maven Shade Plugin (fat JAR) |

---

##  How to Run

### Prerequisites
- Java JDK 11 (Microsoft OpenJDK 11)
- Maven 3.9+
- Python 3.10+
- Node.js 18+

### Step 1 — Build Java simulation
```powershell
cd simulation
mvn package -DskipTests
```

### Step 2 — Start everything
```powershell
.\start_all.bat
```

This opens two terminals:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

---

##  Features

- **Config Panel** — Sliders for VMs, Cloudlets, MIPS, RAM, Bandwidth
- **Quick Presets** — 4 preset configurations (Small/Medium/Large/SpaceShared)
- **Real Simulation** — Runs actual Java CloudSim engine, not mock data
- **3 Result Views** — Bar chart, Timeline, Data table
- **Export CSV** — Download simulation results as CSV
- **Backend Status** — Live indicator showing if backend is online
- **Error Handling** — Friendly messages if backend is offline

---

##  Simulation Parameters

| Parameter | Range | Description |
|-----------|-------|-------------|
| Virtual Machines | 1–10 | Number of VMs in the datacenter |
| Cloudlets | 1–30 | Number of tasks to execute |
| MIPS/VM | 100–10000 | Processing speed per VM |
| RAM/VM | 512–16384 MB | Memory per VM |
| Bandwidth | 100–10000 Mbps | Network bandwidth per VM |
| Task Length | 1000–100000 MI | Computational size of each task |
| Scheduling | TimeShared / SpaceShared | VM scheduling policy |

---

##  Research Reference

This project is based on:

> Hewage, T. B., Ilager, S., Rodriguez, M. A., & Buyya, R. (2024).
> **CloudSim Express: A novel framework for rapid low code simulation of cloud computing environments.**
> *Software: Practice and Experience*, 54(3), 483–500.
> DOI: 10.1002/spe.3290

GitHub: https://github.com/Cloudslab/cloudsim-express

---

##  Novel Contribution

The original CloudSim Express paper provides a YAML-based CLI simulation tool. This project contributes a **complete web layer** that was explicitly listed as future work in the paper:

> *"we intend to develop a graphical user interface using the System Model Script"*
> — Hewage et al., 2024 (Section 7, Future Work)

This project directly implements that vision.
