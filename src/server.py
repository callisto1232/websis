from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psutil
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global trackers to compute network speed differentials
prev_net = psutil.net_io_counters()
prev_time = time.time()

@app.get("/api/telemetry")
def get_telemetry():
    global prev_net, prev_time

    # 1. Existing Base Specs
    cpu_cores = psutil.cpu_percent(interval=None, percpu=True)
    cpu_overall = psutil.cpu_percent(interval=None)
    cpu_freq = psutil.cpu_freq()
    current_freq = round(cpu_freq.current / 1000, 2) if cpu_freq else 0

    temps = psutil.sensors_temperatures()
    cpu_temp = 0
    for key in ['k10temp', 'coretemp', 'amdgpu', 'acpitz']:
        if key in temps and temps[key]:
            cpu_temp = temps[key][0].current
            break

    ram_info = psutil.virtual_memory()
    swap_info = psutil.swap_memory()
    disk_info = psutil.disk_usage('/')

    # 2. Advanced Network Speed Calculation (MB/s Delta)
    current_net = psutil.net_io_counters()
    current_time = time.time()
    
    time_delta = current_time - prev_time if (current_time - prev_time) > 0 else 1
    
    # Bytes to Megabytes conversion over elapsed time delta
    download_speed = round(((current_net.bytes_recv - prev_net.bytes_recv) / (1024 ** 2)) / time_delta, 2)
    upload_speed = round(((current_net.bytes_sent - prev_net.bytes_sent) / (1024 ** 2)) / time_delta, 2)

    # Cache current benchmarks for the next interval calculation
    prev_net = current_net
    prev_time = current_time

    # 3. Top Resource Consuming Processes Tracker
    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
        try:
            # Only track active applications to save parsing overhead
            if proc.info['cpu_percent'] > 0.1 or proc.info['memory_percent'] > 0.1:
                processes.append({
                    "pid": proc.info['pid'],
                    "name": proc.info['name'],
                    "cpu": round(proc.info['cpu_percent'], 1),
                    "mem": round(proc.info['memory_percent'], 1)
                })
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue

    # Sort descending by CPU consumption and slice the top 3 items
    top_processes = sorted(processes, key=lambda x: x['cpu'], reverse=True)[:3]

    return {
        "cpu_overall": cpu_overall,
        "cpu_cores": cpu_cores,
        "cpu_count": len(cpu_cores),
        "cpu_freq_ghz": current_freq,
        "cpu_temp": cpu_temp,
        "ram": ram_info.percent,
        "ram_used_gb": round(ram_info.used / (1024 ** 3), 2),
        "ram_total_gb": round(ram_info.total / (1024 ** 3), 2),
        "swap": swap_info.percent,
        "disk_percent": disk_info.percent,
        "disk_free_gb": round(disk_info.free / (1024 ** 3), 1),
        "net_down_mbs": download_speed,
        "net_up_mbs": upload_speed,
        "top_processes": top_processes
    }
