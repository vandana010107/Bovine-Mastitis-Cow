"""
Bluetooth Manager & Local Ingestion Service for BOVINE_MASTITIS_ESP32.
Manages Bluetooth Classic (SPP) RFCOMM/Serial connections, byte buffering,
newline-delimited JSON parsing, error tracking, and database ingestion.
"""

import json
import time
import threading
from datetime import datetime
from typing import Optional, Dict, Any, List
import serial
import serial.tools.list_ports

from database import SessionLocal
from models import Cow, SensorReading, SystemSetting

class BluetoothManager:
    def __init__(self):
        self.device_name = "BOVINE_MASTITIS_ESP32"
        self.active_port: Optional[str] = None
        self.baud_rate = 115200
        self.serial_conn: Optional[serial.Serial] = None
        
        # Connection status: "Bluetooth Connected" | "Bluetooth Disconnected" | "Waiting for Device" | "Connecting..."
        self.status = "Waiting for Device"
        self.is_connected = False
        
        self.last_received_timestamp: Optional[str] = None
        self.last_received_packet: Optional[str] = None
        self.last_parsed_data: Optional[Dict[str, Any]] = None
        self.error_state: Optional[str] = None # "Bluetooth unavailable" | "Device not found" | "Connection failed" | "Device disconnected" | "Invalid JSON" | "Missing sensor value"
        
        # Recent packets buffer (stores last 15 packets for live telemetry table)
        self.recent_packets: List[Dict[str, Any]] = []
        self._max_recent_packets = 15
        
        self._running = False
        self._thread: Optional[threading.Thread] = None
        self._reconnect_auto = True
        self._lock = threading.Lock()

    def get_available_ports(self) -> List[Dict[str, str]]:
        """Scans local system COM ports for available Bluetooth and USB Serial ports."""
        ports = []
        try:
            com_ports = serial.tools.list_ports.comports()
            for p in com_ports:
                description = p.description or "Unknown Serial Port"
                desc_lower = description.lower()
                is_bt = (
                    "bluetooth" in desc_lower or
                    "bovine" in desc_lower or
                    "ch340" in desc_lower or
                    "cp210" in desc_lower or
                    "usb serial" in desc_lower or
                    "usb-serial" in desc_lower or
                    "ftdi" in desc_lower or
                    "esp" in desc_lower or
                    "bovine_mastitis" in p.device.lower()
                )
                ports.append({
                    "port": p.device,
                    "description": description,
                    "hwid": p.hwid,
                    "is_bluetooth_candidate": is_bt
                })
        except Exception as e:
            print(f"[BT Manager] Error listing COM ports: {e}")
        return ports

    def connect(self, port_name: Optional[str] = None) -> Dict[str, Any]:
        """Attempts to connect to the specified COM port or auto-detect BOVINE_MASTITIS_ESP32."""
        with self._lock:
            if self.is_connected and self.serial_conn and self.serial_conn.is_open:
                return {
                    "success": True,
                    "message": f"Already connected to {self.active_port}",
                    "status": self.status,
                    "device": self.device_name
                }

            self.status = "Connecting..."
            self.error_state = None
            
            available = self.get_available_ports()
            if not available:
                self.status = "Waiting for Device"
                self.error_state = "Bluetooth unavailable"
                return {
                    "success": False,
                    "message": "No Bluetooth or Serial COM ports found. Pair 'BOVINE_MASTITIS_ESP32' in Windows Bluetooth settings or plug in USB cable first.",
                    "status": self.status,
                    "error": self.error_state
                }

            # Determine ports to try
            ports_to_try: List[str] = []
            if port_name and port_name != "auto":
                ports_to_try.append(port_name)
            else:
                # Try candidates first, then any available COM port
                candidates = [p["port"] for p in available if p["is_bluetooth_candidate"]]
                others = [p["port"] for p in available if not p["is_bluetooth_candidate"]]
                ports_to_try = candidates + others

            last_error = ""
            for target_port in ports_to_try:
                try:
                    print(f"[BT Manager] Attempting serial connection on {target_port} @ {self.baud_rate} baud...")
                    s = serial.Serial(
                        port=target_port,
                        baudrate=self.baud_rate,
                        timeout=1.5
                    )
                    self.serial_conn = s
                    self.active_port = target_port
                    self.is_connected = True
                    self.status = "Bluetooth Connected"
                    self.error_state = None
                    print(f"[BT Manager] Successfully connected to {self.device_name} on {target_port}")

                    # Start background listener thread if not running
                    self._start_listener_thread()

                    return {
                        "success": True,
                        "message": f"Successfully connected to ESP32 on {target_port}",
                        "status": self.status,
                        "device": self.device_name,
                        "port": target_port
                    }
                except Exception as e:
                    last_error = str(e)
                    print(f"[BT Manager] Port {target_port} failed: {e}")

            self.is_connected = False
            self.status = "Bluetooth Disconnected"
            if "Access is denied" in last_error or "PermissionError" in last_error:
                self.error_state = "Connection failed"
            elif "FileNotFoundError" in last_error or "Could not open port" in last_error:
                self.error_state = "Device not found"
            else:
                self.error_state = "Connection failed"

            return {
                "success": False,
                "message": f"Could not connect to ESP32 on {', '.join(ports_to_try)}: {last_error}",
                "status": self.status,
                "error": self.error_state
            }

    def disconnect(self) -> Dict[str, Any]:
        """Disconnects the active Bluetooth connection."""
        with self._lock:
            self._reconnect_auto = False
            self._close_serial()
            self.status = "Bluetooth Disconnected"
            self.error_state = "Device disconnected"
            return {
                "success": True,
                "message": "Bluetooth device disconnected manually.",
                "status": self.status,
                "device": self.device_name
            }

    def _close_serial(self):
        self.is_connected = False
        if self.serial_conn:
            try:
                self.serial_conn.close()
            except Exception:
                pass
            self.serial_conn = None
        self.active_port = None

    def _start_listener_thread(self):
        if self._thread and self._thread.is_alive():
            return
        self._running = True
        self._thread = threading.Thread(target=self._listen_loop, daemon=True)
        self._thread.start()

    def _listen_loop(self):
        """Continuously reads bytes from Bluetooth serial, buffers until newline, parses JSON."""
        buffer = ""
        while self._running:
            if not self.is_connected or not self.serial_conn or not self.serial_conn.is_open:
                time.sleep(1.0)
                continue

            try:
                # Read available bytes
                if self.serial_conn.in_waiting > 0:
                    raw_bytes = self.serial_conn.read(self.serial_conn.in_waiting)
                    try:
                        chunk = raw_bytes.decode('utf-8', errors='replace')
                    except Exception:
                        chunk = raw_bytes.decode('latin1', errors='replace')
                    
                    buffer += chunk

                    # Process newline-delimited JSON packets
                    while '\n' in buffer:
                        line, buffer = buffer.split('\n', 1)
                        line = line.strip()
                        if line:
                            if "Bluetooth JSON:" in line:
                                line = line.split("Bluetooth JSON:", 1)[1].strip()
                            if line.startswith("{"):
                                self._process_incoming_line(line)
                else:
                    time.sleep(0.1)

            except serial.SerialException as se:
                print(f"[BT Manager] Serial connection error: {se}")
                self._handle_disconnection("Device disconnected")
                time.sleep(2.0)
            except Exception as e:
                print(f"[BT Manager] Unexpected error in listener loop: {e}")
                time.sleep(1.0)

    def _handle_disconnection(self, error_type: str):
        with self._lock:
            self._close_serial()
            self.status = "Bluetooth Disconnected"
            self.error_state = error_type

    def _process_incoming_line(self, line: str):
        """Parses a newline-delimited line of text into a JSON object and ingests it."""
        now_iso = datetime.utcnow().isoformat()
        packet_log = {
            "id": int(time.time() * 1000),
            "timestamp": now_iso,
            "raw_json": line,
            "status": "Processing",
            "error": None,
            "parsed_data": None
        }

        try:
            payload = json.loads(line)
            if not isinstance(payload, dict):
                raise ValueError("JSON payload must be a key-value object")

            # Validate missing sensor values
            missing_fields = []
            sensor_keys = ["udder_temp_1", "udder_temp_2", "ambient_temp", "humidity", "activity"]
            for k in sensor_keys:
                if k not in payload or payload[k] is None:
                    missing_fields.append(k)

            # TDS check: accept tds_ppm OR tds (analog voltage)
            has_tds = ("tds_ppm" in payload and payload["tds_ppm"] is not None) or ("tds" in payload and payload["tds"] is not None)
            if not has_tds:
                missing_fields.append("tds")

            error_note = None
            if missing_fields:
                error_note = f"Missing sensor value(s): {', '.join(missing_fields)}"
                self.error_state = "Missing sensor value"

            # Parse and calculate THI if applicable
            cow_id = str(payload.get("cow_id", "COW_001"))
            u_temp1 = self._float_or_none(payload.get("udder_temp_1"))
            u_temp2 = self._float_or_none(payload.get("udder_temp_2"))
            amb_temp = self._float_or_none(payload.get("ambient_temp"))
            humidity = self._float_or_none(payload.get("humidity"))
            activity = self._float_or_none(payload.get("activity"))
            
            # Map TDS fields from ESP32 ("tds" voltage, "tds_adc" count) or standard keys
            tds_voltage = self._float_or_none(payload.get("tds_voltage") if "tds_voltage" in payload else payload.get("tds"))
            tds_raw = self._int_or_none(payload.get("tds_raw") if "tds_raw" in payload else payload.get("tds_adc"))
            tds_ppm = self._float_or_none(payload.get("tds_ppm"))
            if tds_ppm is None and tds_voltage is not None:
                # Convert voltage to approx ppm (or pass through if voltage is calibrated)
                tds_ppm = round(tds_voltage * 500.0, 1) if tds_voltage > 0 else 0.0

            ts_ms = self._int_or_none(payload.get("timestamp_ms"))

            thi = None
            if amb_temp is not None and humidity is not None:
                thi = round((1.8 * amb_temp + 32.0) - (0.55 - 0.0055 * humidity) * (1.8 * amb_temp - 26.0), 2)

            # Save payload into DB
            db = SessionLocal()
            try:
                # Ensure Cow profile exists
                cow = db.query(Cow).filter(Cow.id == cow_id).first()
                if not cow:
                    cow = Cow(
                        id=cow_id,
                        breed="Sahiwal",
                        age=4,
                        lactation_stage="Mid-lactation",
                        farm="Farm A",
                        location="Dairy Farm Unit",
                        monitoring_start_date=datetime.utcnow().strftime("%Y-%m-%d")
                    )
                    db.add(cow)

                reading = SensorReading(
                    cow_id=cow_id,
                    timestamp=datetime.utcnow(),
                    timestamp_ms=ts_ms,
                    udder_temp_1=u_temp1,
                    udder_temp_2=u_temp2,
                    ambient_temp=amb_temp,
                    humidity=humidity,
                    activity=activity,
                    tds_ppm=tds_ppm,
                    tds_raw=tds_raw,
                    tds_voltage=tds_voltage,
                    thi=thi,
                    is_simulated=False
                )
                db.add(reading)
                db.commit()
                db.refresh(reading)
            except Exception as db_err:
                print(f"[BT Manager] DB Save error: {db_err}")
                db.rollback()
            finally:
                db.close()

            parsed_data = {
                "cow_id": cow_id,
                "timestamp_ms": ts_ms,
                "udder_temp_1": u_temp1,
                "udder_temp_2": u_temp2,
                "ambient_temp": amb_temp,
                "humidity": humidity,
                "activity": activity,
                "tds_ppm": tds_ppm,
                "tds_raw": tds_raw,
                "tds_voltage": tds_voltage,
                "thi": thi
            }

            self.last_received_timestamp = now_iso
            self.last_received_packet = line
            self.last_parsed_data = parsed_data
            self.status = "Bluetooth Connected"
            if not missing_fields:
                self.error_state = None

            packet_log["status"] = "Valid JSON"
            packet_log["error"] = error_note
            packet_log["parsed_data"] = parsed_data

        except json.JSONDecodeError as j_err:
            print(f"[BT Manager] Invalid JSON packet received: {line} | Error: {j_err}")
            self.error_state = "Invalid JSON"
            packet_log["status"] = "Invalid JSON"
            packet_log["error"] = f"Malformed JSON: {str(j_err)}"
        except Exception as ex:
            print(f"[BT Manager] Packet parsing error: {ex}")
            packet_log["status"] = "Error"
            packet_log["error"] = str(ex)

        # Store in recent packet log buffer
        with self._lock:
            self.recent_packets.insert(0, packet_log)
            if len(self.recent_packets) > self._max_recent_packets:
                self.recent_packets.pop()

    def process_test_json(self, raw_json_string: str) -> Dict[str, Any]:
        """Manually injects a test JSON string to verify incoming packet parsing and database storage."""
        self._process_incoming_line(raw_json_string)
        return self.get_connection_status()

    def get_connection_status(self) -> Dict[str, Any]:
        """Returns comprehensive status metadata for front-end consumption."""
        return {
            "status": self.status, # "Bluetooth Connected" | "Bluetooth Disconnected" | "Waiting for Device"
            "is_connected": self.is_connected,
            "connected_device_name": self.device_name,
            "active_port": self.active_port,
            "last_received_timestamp": self.last_received_timestamp,
            "last_received_packet": self.last_received_packet,
            "last_parsed_data": self.last_parsed_data,
            "error_message": self.error_state,
            "available_ports": self.get_available_ports()
        }

    def get_recent_packets(self) -> List[Dict[str, Any]]:
        with self._lock:
            return list(self.recent_packets)

    def _float_or_none(self, val: Any) -> Optional[float]:
        if val is None or val == "null":
            return None
        try:
            return float(val)
        except (ValueError, TypeError):
            return None

    def _int_or_none(self, val: Any) -> Optional[int]:
        if val is None or val == "null":
            return None
        try:
            return int(val)
        except (ValueError, TypeError):
            return None


# Global Singleton Instance for FastAPI app
bt_manager = BluetoothManager()

