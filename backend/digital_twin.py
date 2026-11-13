"""
Digital Twin Module for Bovine Mastitis Monitoring System.

Calculates cow-specific baseline values from historical real sensor measurements.
Enforces strict baseline rules: if insufficient data exists, baseline_status = "learning"
and message = "Baseline learning in progress". Never fabricates arbitrary baselines.
"""

from sqlalchemy.orm import Session
from models import SensorReading
from typing import Dict, Any, Optional

MINIMUM_BASELINE_READINGS = 30

def compute_digital_twin_metrics(db: Session, cow_id: str) -> Dict[str, Any]:
    # Query non-simulated sensor readings for this cow
    readings = db.query(SensorReading).filter(
        SensorReading.cow_id == cow_id,
        SensorReading.is_simulated == False
    ).order_by(SensorReading.timestamp.desc()).all()

    total_readings_count = len(readings)

    # Get latest reading if available
    latest: Optional[SensorReading] = readings[0] if readings else None

    if not latest or total_readings_count < MINIMUM_BASELINE_READINGS:
        return {
            "cow_id": cow_id,
            "baseline_status": "learning",
            "message": "Baseline learning in progress",
            "readings_collected": total_readings_count,
            "min_readings_required": MINIMUM_BASELINE_READINGS,
            "latest_values": {
                "udder_temp_1": latest.udder_temp_1 if latest else None,
                "udder_temp_2": latest.udder_temp_2 if latest else None,
                "activity": latest.activity if latest else None,
                "tds_ppm": latest.tds_ppm if latest else None,
                "timestamp": latest.timestamp.isoformat() if latest else None
            },
            "baselines": None,
            "deviations": None
        }

    # Calculate actual historical mean baseline across valid readings
    valid_ut1 = [r.udder_temp_1 for r in readings if r.udder_temp_1 is not None]
    valid_ut2 = [r.udder_temp_2 for r in readings if r.udder_temp_2 is not None]
    valid_act = [r.activity for r in readings if r.activity is not None]
    valid_tds = [r.tds_ppm for r in readings if r.tds_ppm is not None]

    b_ut1 = sum(valid_ut1) / len(valid_ut1) if valid_ut1 else None
    b_ut2 = sum(valid_ut2) / len(valid_ut2) if valid_ut2 else None
    b_act = sum(valid_act) / len(valid_act) if valid_act else None
    b_tds = sum(valid_tds) / len(valid_tds) if valid_tds else None

    # Current deviations
    dev_ut1 = round(latest.udder_temp_1 - b_ut1, 2) if (latest.udder_temp_1 is not None and b_ut1 is not None) else None
    dev_ut2 = round(latest.udder_temp_2 - b_ut2, 2) if (latest.udder_temp_2 is not None and b_ut2 is not None) else None
    dev_act = round(latest.activity - b_act, 3) if (latest.activity is not None and b_act is not None) else None
    dev_tds = round(latest.tds_ppm - b_tds, 2) if (latest.tds_ppm is not None and b_tds is not None) else None

    return {
        "cow_id": cow_id,
        "baseline_status": "established",
        "message": "Personal baseline active",
        "readings_collected": total_readings_count,
        "min_readings_required": MINIMUM_BASELINE_READINGS,
        "latest_values": {
            "udder_temp_1": latest.udder_temp_1,
            "udder_temp_2": latest.udder_temp_2,
            "activity": latest.activity,
            "tds_ppm": latest.tds_ppm,
            "timestamp": latest.timestamp.isoformat()
        },
        "baselines": {
            "udder_temp_1": round(b_ut1, 2) if b_ut1 else None,
            "udder_temp_2": round(b_ut2, 2) if b_ut2 else None,
            "activity": round(b_act, 3) if b_act else None,
            "tds_ppm": round(b_tds, 2) if b_tds else None
        },
        "deviations": {
            "udder_temp_1": dev_ut1,
            "udder_temp_2": dev_ut2,
            "activity": dev_act,
            "tds_ppm": dev_tds
        }
    }
