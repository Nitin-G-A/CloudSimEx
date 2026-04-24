from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import csv
import os
import uuid
import time

app = Flask(__name__)
CORS(app)  # Allow React frontend to call this API

# ── Paths ──────────────────────────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)
JAR_PATH    = os.path.join(PROJECT_DIR, "simulation", "target", "cloud-simulation-1.0.jar")
OUTPUT_DIR  = os.path.join(PROJECT_DIR, "simulation", "output")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── Routes ─────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    """Check if backend is running"""
    return jsonify({
        "status": "ok",
        "message": "Cloud Simulation Backend is running!",
        "jar_found": os.path.exists(JAR_PATH)
    })


@app.route("/simulate", methods=["POST"])
def simulate():
    """
    Run CloudSim simulation with user config.
    
    Expected JSON body:
    {
        "numVMs": 3,
        "numCloudlets": 10,
        "mips": 1000,
        "ram": 2048,
        "bw": 1000,
        "cloudletLength": 10000,
        "schedulingPolicy": "TimeShared"
    }
    """
    try:
        # 1. Get config from frontend
        data = request.get_json()
        if not data:
            return jsonify({"error": "No config provided"}), 400

        # 2. Extract + validate parameters
        num_vms          = int(data.get("numVMs", 3))
        num_cloudlets    = int(data.get("numCloudlets", 10))
        mips             = int(data.get("mips", 1000))
        ram              = int(data.get("ram", 2048))
        bw               = int(data.get("bw", 1000))
        cloudlet_length  = int(data.get("cloudletLength", 10000))
        scheduling       = data.get("schedulingPolicy", "TimeShared")

        # Basic validation
        if num_vms < 1 or num_vms > 20:
            return jsonify({"error": "numVMs must be between 1 and 20"}), 400
        if num_cloudlets < 1 or num_cloudlets > 50:
            return jsonify({"error": "numCloudlets must be between 1 and 50"}), 400
        if scheduling not in ["TimeShared", "SpaceShared"]:
            return jsonify({"error": "schedulingPolicy must be TimeShared or SpaceShared"}), 400

        # 3. Unique output file per request (avoid conflicts)
        run_id      = str(uuid.uuid4())[:8]
        output_file = os.path.join(OUTPUT_DIR, f"results_{run_id}.csv")

        # 4. Build Java command
        cmd = [
            "java", "-jar", JAR_PATH,
            str(num_vms),
            str(num_cloudlets),
            str(mips),
            str(ram),
            str(bw),
            str(cloudlet_length),
            scheduling,
            output_file
        ]

        print(f"\n[SIM] Running: {' '.join(cmd)}\n")

        # 5. Run simulation
        start_time = time.time()
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120  # 2 min max
        )
        elapsed = round(time.time() - start_time, 2)

        if result.returncode != 0:
            print(f"[ERROR] Java stderr: {result.stderr}")
            return jsonify({
                "error": "Simulation failed",
                "details": result.stderr[-500:]  # last 500 chars
            }), 500

        # 6. Read CSV results
        if not os.path.exists(output_file):
            return jsonify({"error": "Results file not created"}), 500

        cloudlets = []
        with open(output_file, newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                cloudlets.append({
                    "cloudlet_id":  int(row["cloudlet_id"]),
                    "vm_id":        int(row["vm_id"]),
                    "status":       row["status"],
                    "exec_time":    float(row["exec_time"]),
                    "start_time":   float(row["start_time"]),
                    "finish_time":  float(row["finish_time"]),
                    "length":       int(row["length"]),
                    "cpu_cores":    int(row["cpu_cores"])
                })

        # 7. Compute summary stats
        exec_times   = [c["exec_time"] for c in cloudlets]
        finish_times = [c["finish_time"] for c in cloudlets]
        success      = sum(1 for c in cloudlets if c["status"] == "SUCCESS")

        summary = {
            "total_cloudlets":   len(cloudlets),
            "successful":        success,
            "failed":            len(cloudlets) - success,
            "avg_exec_time":     round(sum(exec_times) / len(exec_times), 2) if exec_times else 0,
            "max_exec_time":     round(max(exec_times), 2) if exec_times else 0,
            "min_exec_time":     round(min(exec_times), 2) if exec_times else 0,
            "total_sim_time":    round(max(finish_times), 2) if finish_times else 0,
            "processing_time_s": elapsed,
            "num_vms":           num_vms,
            "scheduling_policy": scheduling
        }

        # 8. Cleanup temp file
        os.remove(output_file)

        # 9. Return results to frontend
        return jsonify({
            "success":   True,
            "summary":   summary,
            "cloudlets": cloudlets
        })

    except subprocess.TimeoutExpired:
        return jsonify({"error": "Simulation timed out (>2 minutes)"}), 500
    except Exception as e:
        print(f"[ERROR] {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/presets", methods=["GET"])
def presets():
    """Return preset simulation configs for the frontend dropdown"""
    return jsonify([
        {
            "name": "Small — Quick Test",
            "numVMs": 2, "numCloudlets": 5,
            "mips": 1000, "ram": 1024, "bw": 500,
            "cloudletLength": 5000, "schedulingPolicy": "TimeShared"
        },
        {
            "name": "Medium — Balanced",
            "numVMs": 4, "numCloudlets": 12,
            "mips": 2000, "ram": 2048, "bw": 1000,
            "cloudletLength": 10000, "schedulingPolicy": "TimeShared"
        },
        {
            "name": "Large — Heavy Load",
            "numVMs": 8, "numCloudlets": 25,
            "mips": 3000, "ram": 4096, "bw": 2000,
            "cloudletLength": 20000, "schedulingPolicy": "SpaceShared"
        },
        {
            "name": "SpaceShared — Isolated Tasks",
            "numVMs": 5, "numCloudlets": 15,
            "mips": 1500, "ram": 2048, "bw": 1000,
            "cloudletLength": 10000, "schedulingPolicy": "SpaceShared"
        }
    ])


# ── Run ────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n==========================================")
    print("  Cloud Simulation Backend")
    print("  Running at http://localhost:5000")
    print(f"  JAR found: {os.path.exists(JAR_PATH)}")
    print("==========================================\n")
    app.run(debug=True, port=5000)
