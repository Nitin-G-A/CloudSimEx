# Cloud Simulation Platform — Phase 2: Java Simulation

## Project Structure
```
cloud-sim-platform/
├── simulation/
│   ├── pom.xml                         ← Maven config (downloads CloudSim Plus)
│   ├── src/main/java/com/cloudsim/
│   │   └── CloudSimRunner.java         ← Main simulation class
│   └── output/
│       └── results.csv                 ← Generated after simulation runs
├── build.bat                           ← Run this to build the JAR
└── test_simulation.bat                 ← Run this to test 3 scenarios
```

## How to Build

1. Make sure Maven is installed: `mvn -version`
2. Double-click `build.bat` OR run in PowerShell:
```powershell
cd cloud-sim-platform
.\build.bat
```

## How to Run Manually

```powershell
cd simulation
java -jar target\cloud-simulation-1.0-shaded.jar <numVMs> <numCloudlets> <mips> <ram> <bw> <cloudletLength> <schedulingPolicy> <outputPath>
```

### Example:
```powershell
java -jar target\cloud-simulation-1.0-shaded.jar 3 10 1000 2048 1000 10000 TimeShared output\results.csv
```

## Parameters

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

## Output CSV Format

```
cloudlet_id,vm_id,status,exec_time,start_time,finish_time,length,cpu_cores
0,0,SUCCESS,10.0000,0.1000,10.1000,10000,2
1,1,SUCCESS,9.5000,0.1000,9.6000,9500,2
...
```

## What the Simulation Does (Concept)

Based on the CloudSim Express paper:
- Creates a **Datacenter** with physical Hosts
- Creates **Virtual Machines (VMs)** on those hosts
- Submits **Cloudlets** (tasks) to VMs via a Broker
- Records execution time, start/finish times per cloudlet
- Saves all results to CSV for the web frontend to display
