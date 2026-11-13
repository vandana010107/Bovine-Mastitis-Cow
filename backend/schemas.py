from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime

class SensorPayloadSchema(BaseModel):
    cow_id: str = "COW_001"
    timestamp_ms: Optional[int] = None
    udder_temp_1: Optional[float] = None
    udder_temp_2: Optional[float] = None
    ambient_temp: Optional[float] = None
    humidity: Optional[float] = None
    activity: Optional[float] = None
    tds_ppm: Optional[float] = None
    tds_raw: Optional[int] = None
    tds_voltage: Optional[float] = None
    thi: Optional[float] = None
    is_simulated: Optional[bool] = False

class SensorReadingResponse(BaseModel):
    id: int
    cow_id: str
    timestamp: datetime
    timestamp_ms: Optional[int] = None
    udder_temp_1: Optional[float] = None
    udder_temp_2: Optional[float] = None
    ambient_temp: Optional[float] = None
    humidity: Optional[float] = None
    activity: Optional[float] = None
    tds_ppm: Optional[float] = None
    tds_raw: Optional[int] = None
    tds_voltage: Optional[float] = None
    thi: Optional[float] = None
    is_simulated: bool

    class Config:
        from_attributes = True

class CowSchema(BaseModel):
    id: str
    breed: str
    age: int
    lactation_stage: str
    farm: str
    location: str
    monitoring_start_date: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class CowUpdateSchema(BaseModel):
    breed: Optional[str] = None
    age: Optional[int] = None
    lactation_stage: Optional[str] = None
    farm: Optional[str] = None
    location: Optional[str] = None
    monitoring_start_date: Optional[str] = None
    notes: Optional[str] = None

class SensorHealthItem(BaseModel):
    name: str
    pin_or_bus: str
    status: str # "Connected" | "Delayed" | "Disconnected" | "Error"
    last_reading: str
    last_updated: str
    is_valid: bool
    error: Optional[str] = None

class ConnectionStatusResponse(BaseModel):
    cow_id: str
    status: str # "Connected" | "Delayed" | "Offline"
    last_updated: Optional[str] = None
    esp32_status: str
    is_simulated_mode: bool
    total_readings: int

class BluetoothConnectRequest(BaseModel):
    port: Optional[str] = None

class BluetoothTestPacketRequest(BaseModel):
    raw_json: str

class BluetoothStatusResponse(BaseModel):
    status: str # "Bluetooth Connected" | "Bluetooth Disconnected" | "Waiting for Device" | "Connecting..."
    is_connected: bool
    connected_device_name: str
    active_port: Optional[str] = None
    last_received_timestamp: Optional[str] = None
    last_received_packet: Optional[str] = None
    last_parsed_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    available_ports: List[Dict[str, Any]] = []
