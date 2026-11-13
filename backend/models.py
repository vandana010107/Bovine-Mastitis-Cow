from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean, Text
from datetime import datetime
from database import Base

class Cow(Base):
    __tablename__ = "cows"

    id = Column(String, primary_key=True, index=True) # e.g. COW_001
    breed = Column(String, default="Sahiwal")
    age = Column(Integer, default=4)
    lactation_stage = Column(String, default="Mid-lactation")
    farm = Column(String, default="Farm A")
    location = Column(String, default="Karnal, Haryana, India")
    monitoring_start_date = Column(String, default=datetime.utcnow().strftime("%Y-%m-%d"))
    notes = Column(Text, nullable=True)

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    cow_id = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    timestamp_ms = Column(Integer, nullable=True)

    # Udder Temperatures (DS18B20 #1 & #2)
    udder_temp_1 = Column(Float, nullable=True)
    udder_temp_2 = Column(Float, nullable=True)

    # Ambient Environment (DHT22)
    ambient_temp = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    thi = Column(Float, nullable=True)

    # Cattle Activity / Motion (MPU6050)
    activity = Column(Float, nullable=True)

    # Experimental TDS Measurement (TDS Meter V1.0)
    tds_ppm = Column(Float, nullable=True)
    tds_raw = Column(Integer, nullable=True)
    tds_voltage = Column(Float, nullable=True)

    # Data provenance
    is_simulated = Column(Boolean, default=False)

class SensorStatusLog(Base):
    __tablename__ = "sensor_status_log"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cow_id = Column(String, index=True)
    sensor_name = Column(String) # DS18B20_1, DS18B20_2, DHT22, MPU6050, TDS
    status = Column(String) # Connected, Delayed, Disconnected, Error
    last_reading_val = Column(String, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow)
    error_message = Column(String, nullable=True)

class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String, primary_key=True)
    value = Column(String)
