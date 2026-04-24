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

## Prerequisites

To run this project locally, you will need:
1. **Java Development Kit (JDK) 11+**
2. **Apache Maven** (for building the Java simulation)
3. **Python 3.8+** (for the Flask backend)
4. **Node.js & npm** (for the React frontend)

## How to Build & Run

### 1. Build the Simulation Engine
First, compile the Java simulation code into an executable JAR file.
Open a terminal in the project root and run:
```powershell
.\build.bat
```
*(This will use Maven to download CloudSim Plus dependencies and package the `.jar` into `simulation/target/cloud-simulation-1.0.jar`)*

### 2. Start the Backend API
Start the Flask server which bridges the React app and the Java simulation.
```powershell
.\start_backend.bat
```
*(The API will run at `http://localhost:5000`)*

### 3. Start the Frontend Web App
Start the React development server.
```powershell
.\start_frontend.bat
```
*(The web UI will be accessible at `http://localhost:3000`)*

## Running the Simulation Manually (CLI)

If you wish to bypass the web interface and run the simulation directly from the command line:

```powershell
cd simulation
java -jar target\cloud-simulation-1.0.jar <numVMs> <numCloudlets> <mips> <ram> <bw> <cloudletLength> <schedulingPolicy> <outputPath>
```

### Example Usage:
```powershell
java -jar target\cloud-simulation-1.0.jar 3 10 1000 2048 1000 10000 TimeShared output\results.csv
```

## Configurable Parameters

| # | Parameter | Example | Meaning |
|---|-----------|---------|---------|
| 1 | numVMs | 3 | Number of Virtual Machines |
| 2 | numCloudlets | 10 | Number of tasks/jobs |
| 3 | mips | 1000 | Processing speed per VM (Million Instructions/sec) |
| 4 | ram | 2048 | RAM per VM in MB |
| 5 | bw | 1000 | Bandwidth per VM in Mbps |
| 6 | cloudletLength | 10000 | Task size in Million Instructions |
| 7 | schedulingPolicy | TimeShared | TimeShared or SpaceShared |
| 8 | outputPath | output/results.csv | Where to save CSV results |

## Output Format

The simulation generates tabular data detailing the execution of cloudlets (tasks).

```csv
cloudlet_id,vm_id,status,exec_time,start_time,finish_time,length,cpu_cores
0,0,SUCCESS,10.0000,0.1000,10.1000,10000,2
1,1,SUCCESS,9.5000,0.1000,9.6000,9500,2
...
```

## How It Works

1. Users configure Data Center, Virtual Machine (VM), and Cloudlet (task) parameters via the **React Frontend**.
2. The frontend sends these parameters as a JSON payload to the **Flask Backend**.
3. Flask launches a subprocess executing the `cloud-simulation-1.0.jar` with the provided arguments.
4. **CloudSim Plus (Java)** executes the simulation, mapping cloudlets to VMs using the specified scheduling policy (e.g., SpaceShared or TimeShared), and outputs the results to a structured CSV file.
5. Flask reads the generated CSV and returns the execution data back to the React app to be charted and displayed.
