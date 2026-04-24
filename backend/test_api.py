"""
Quick test script to verify all API endpoints work correctly.
Run this AFTER starting the Flask backend (start_backend.bat)

Usage: python test_api.py
"""

import urllib.request
import json

BASE = "http://localhost:5000"

def test(name, url, method="GET", body=None):
    print(f"\n{'='*50}")
    print(f"Testing: {name}")
    print(f"  {method} {url}")
    try:
        if body:
            data = json.dumps(body).encode("utf-8")
            req = urllib.request.Request(
                url, data=data,
                headers={"Content-Type": "application/json"},
                method=method
            )
        else:
            req = urllib.request.Request(url, method=method)

        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read())
            print(f"  STATUS: {resp.status} OK ✅")
            print(f"  RESPONSE: {json.dumps(result, indent=2)[:400]}...")
            return result
    except Exception as e:
        print(f"  ERROR ❌: {e}")
        return None

# Test 1 — Health check
test("Health Check", f"{BASE}/health")

# Test 2 — Get presets
test("Get Presets", f"{BASE}/presets")

# Test 3 — Run small simulation
result = test(
    "Run Simulation (3 VMs, 5 Cloudlets)",
    f"{BASE}/simulate",
    method="POST",
    body={
        "numVMs": 3,
        "numCloudlets": 5,
        "mips": 1000,
        "ram": 2048,
        "bw": 1000,
        "cloudletLength": 5000,
        "schedulingPolicy": "TimeShared"
    }
)

if result and result.get("success"):
    print("\n" + "="*50)
    print("✅ ALL TESTS PASSED! Backend is working perfectly!")
    print(f"   Cloudlets returned: {len(result['cloudlets'])}")
    print(f"   Avg exec time: {result['summary']['avg_exec_time']}s")
    print(f"   Total sim time: {result['summary']['total_sim_time']}s")
else:
    print("\n❌ Some tests failed. Check the Flask terminal for errors.")
