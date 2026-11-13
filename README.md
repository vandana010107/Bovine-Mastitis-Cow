# AI-Based Predictive Modelling for Early Forecasting of Bovine Mastitis in Indian Dairy Farms

An academic research-oriented IoT + Machine Learning bovine mastitis early-forecasting system for Indian dairy farms.

---

## 🐄 Physical IoT Sensor Network & Architecture

```
PHYSICAL SENSORS (DS18B20 #1, DS18B20 #2, DHT22, MPU6050, TDS Meter V1.0)
       ↓
ESP32 DevKit V1
       ↓ (Wi-Fi HTTP POST /api/sensor-data every 5 sec)
Python FastAPI Edge Server
       ↓
SQLite Database (mastitis_research.db)
       ↓
React + TypeScript Research Web Dashboard
       ↓
Digital Twin & AI ML Early Warning Risk Forecasting
```

### Sensor Hardware Connections
- **DS18B20 #1 (Udder Left Temp)**: Data → `GPIO 4` (with 4.7kΩ pull-up to 3.3V)
- **DS18B20 #2 (Udder Right Temp)**: Data → `GPIO 4` (Parallel 1-Wire pin)
- **DHT22 (Ambient Temp & Humidity)**: Data → `GPIO 15`
- **MPU6050 (Cattle Motion/Activity)**: SDA → `GPIO 21`, SCL → `GPIO 22`
- **TDS Meter V1.0 (Experimental TDS)**: AOUT → `GPIO 34` (Analog ADC, 5V supply)

> **IMPORTANT SCIENTIFIC NOTE:**  
> TDS (Total Dissolved Solids) is an **experimental proxy sensor** and is **NOT** a validated measurement of milk electrical conductivity. The dashboard displays this strictly as **"TDS (Experimental)"**.

---

## 🚀 Step-by-Step Setup & Execution Guide

### 1. Start the FastAPI Backend

Open a terminal window and execute:

```bash
cd backend
venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

*The backend server will start on port `8000`.*  
- Interactive API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Network Information Helper: [http://localhost:8000/api/system/network-info](http://localhost:8000/api/system/network-info)

---

### 2. Start the React Web Dashboard Frontend

Open a second terminal window and execute:

```bash
cd frontend
npm run dev
```

*The frontend dashboard will start on port `5173`.*  
- Open in Browser: [http://localhost:5173](http://localhost:5173)

---

### 3. How to Find Your Computer's Local IPv4 Address

For the ESP32 to communicate with your computer over Wi-Fi, it must send data to your computer's local network IP address (not `localhost`).

#### On Windows (Command Prompt / PowerShell):
```cmd
ipconfig
```
Look for **IPv4 Address** under your active Wi-Fi adapter (e.g., `192.168.1.100` or `192.168.1.8`).

#### Or via API:
Open [http://localhost:8000/api/system/network-info](http://localhost:8000/api/system/network-info) in your browser.

---

### 4. Configure & Flash the ESP32 Code

1. Open `esp32/esp32_mastitis_monitor.ino` in the Arduino IDE.
2. Near the top of the file, update your Wi-Fi credentials and local IP:

```cpp
const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Replace 192.168.1.100 with your computer's IPv4 address
const char* SERVER_URL = "http://192.168.1.100:8000/api/sensor-data";
```

3. Select board **ESP32 Dev Module**, choose your COM port, and click **Upload**.
4. Open **Serial Monitor** set to `115200` baud rate. You should observe:
   ```text
   WiFi connected!
   ESP32 IP address: 192.168.1.50
   [JSON SENT]
   {"cow_id":"COW_001", "udder_temp_1":38.20, ...}
   HTTP response code: 200
   ```

---

### 5. Verifying Real Data Stream to Website Dashboard

1. When the ESP32 outputs `HTTP response code: 200`, your FastAPI backend has validated and stored the real reading in SQLite.
2. Open the dashboard at [http://localhost:5173](http://localhost:5173).
3. Check the top bar indicator:
   - 🟢 **Connected** (Green badge pulsing)
   - **ESP32**: Connected
   - **Last update**: Shows exact timestamp (e.g. `10:35:24 AM`)
4. View the live sensor cards & time-series charts updating every 5 seconds.
5. If the ESP32 is unplugged, the top status badge will automatically shift to 🔴 **Offline** and display `"ESP32 disconnected"`.

---

## 🛠️ Troubleshooting Guide

1. **ESP32 Serial shows `HTTP POST failed. Error: connection refused`**:
   - Ensure your computer's firewall allows incoming connections on port `8000`.
   - Ensure the ESP32 and computer are connected to the exact same Wi-Fi router.
   - Verify you did not use `localhost` in `SERVER_URL`.

2. **Website shows "ESP32 disconnected"**:
   - Ensure FastAPI backend (`python main.py` or `uvicorn`) is actively running on port 8000.
   - Check if ESP32 Serial Monitor is printing `HTTP response code: 200`.

3. **Digital Twin shows "Baseline learning in progress"**:
   - Baseline calculation requires a minimum of 30 historical real sensor readings to establish a statistically valid personal baseline. Continue submitting sensor payloads.

4. **AI Prediction shows "ML model not connected"**:
   - Per scientific requirements, uncalibrated AI scores are never fabricated. Once your model is trained, place the binary in `backend/models/` and interface with `backend/ml_service.py`.

---

## 📁 Repository Directory Structure

```text
cow milk/
├── backend/
│   ├── main.py               # FastAPI server endpoints & CORS logic
│   ├── database.py           # SQLite database configuration
│   ├── models.py             # SQLAlchemy DB schemas
│   ├── schemas.py            # Pydantic validation models
│   ├── digital_twin.py       # Cow baseline & deviation engine
│   ├── ml_service.py         # ML forecasting service fallback
│   ├── mastitis_research.db  # SQLite database file
│   └── requirements.txt      # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Header, Sidebar, ScientificDisclaimer
│   │   ├── pages/            # 11 Research pages (Dashboard, Digital Twin, etc.)
│   │   ├── services/         # API connection layer
│   │   └── App.tsx           # Router & polling layout
│   └── package.json
│
├── esp32/
│   └── esp32_mastitis_monitor.ino # Complete ESP32 Arduino firmware sketch
│
└── README.md
```
