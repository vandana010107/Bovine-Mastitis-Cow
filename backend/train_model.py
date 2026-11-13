"""
Scientific Machine Learning Model Trainer for Bovine Mastitis Early Forecasting.
Trains a Scikit-Learn Classifier on bovine physiological & environmental telemetry.
Outputs: backend/models/bovine_mastitis_xgboost.pkl
"""

import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

def generate_veterinary_dataset(n_samples=3000, random_seed=42):
    np.random.seed(random_seed)
    
    # Class 0: Healthy Cattle (60% of herd)
    n_healthy = int(n_samples * 0.60)
    # Class 1: Sub-Clinical Mastitis (25% - early 24-48h warning phase)
    n_subclinical = int(n_samples * 0.25)
    # Class 2: Acute Clinical Mastitis (15%)
    n_clinical = n_samples - n_healthy - n_subclinical
    
    # 1. Healthy bovine profiles
    h_u1 = np.random.normal(38.35, 0.25, n_healthy)
    h_u2 = h_u1 + np.random.normal(0.0, 0.15, n_healthy)  # Symmetrical quarters
    h_amb = np.random.uniform(20.0, 32.0, n_healthy)
    h_hum = np.random.uniform(40.0, 75.0, n_healthy)
    h_thi = (1.8 * h_amb + 32.0) - (0.55 - 0.0055 * h_hum) * (1.8 * h_amb - 26.0)
    h_act = np.random.normal(1.05, 0.08, n_healthy)       # Normal grazing/chewing rumination
    h_tds = np.random.normal(420.0, 35.0, n_healthy)      # Normal milk electrolyte balance
    y_healthy = np.zeros(n_healthy, dtype=int)
    
    # 2. Sub-clinical mastitis profiles (Early inflammation: elevated quarter delta, rising TDS, subtle activity drop)
    sc_u1 = np.random.normal(38.85, 0.35, n_subclinical)
    sc_delta = np.random.uniform(0.70, 1.30, n_subclinical)
    sc_u2 = sc_u1 - sc_delta * np.random.choice([1, -1], size=n_subclinical)
    sc_amb = np.random.uniform(24.0, 36.0, n_subclinical)
    sc_hum = np.random.uniform(50.0, 85.0, n_subclinical)
    sc_thi = (1.8 * sc_amb + 32.0) - (0.55 - 0.0055 * sc_hum) * (1.8 * sc_amb - 26.0)
    sc_act = np.random.normal(0.78, 0.12, n_subclinical)  # Slight lethargy / lower chewing
    sc_tds = np.random.normal(680.0, 60.0, n_subclinical) # Electrolyte leakage (Na+, Cl-)
    y_subclinical = np.ones(n_subclinical, dtype=int)
    
    # 3. Clinical mastitis profiles (High fever, acute udder inflammation, severely degraded milk)
    cl_u1 = np.random.normal(39.70, 0.45, n_clinical)
    cl_delta = np.random.uniform(1.40, 2.20, n_clinical)
    cl_u2 = cl_u1 - cl_delta * np.random.choice([1, -1], size=n_clinical)
    cl_amb = np.random.uniform(26.0, 38.0, n_clinical)
    cl_hum = np.random.uniform(55.0, 90.0, n_clinical)
    cl_thi = (1.8 * cl_amb + 32.0) - (0.55 - 0.0055 * cl_hum) * (1.8 * cl_amb - 26.0)
    cl_act = np.random.normal(0.55, 0.15, n_clinical)     # Pronounced depression or acute distress spikes
    cl_tds = np.random.normal(920.0, 85.0, n_clinical)    # High ion leakage
    y_clinical = np.full(n_clinical, 2, dtype=int)
    
    # Concatenate features
    u1 = np.concatenate([h_u1, sc_u1, cl_u1])
    u2 = np.concatenate([h_u2, sc_u2, cl_u2])
    amb = np.concatenate([h_amb, sc_amb, cl_amb])
    hum = np.concatenate([h_hum, sc_hum, cl_hum])
    thi = np.concatenate([h_thi, sc_thi, cl_thi])
    act = np.concatenate([h_act, sc_act, cl_act])
    tds = np.concatenate([h_tds, sc_tds, cl_tds])
    y = np.concatenate([y_healthy, y_subclinical, y_clinical])
    
    # Computed derived features
    udder_max = np.maximum(u1, u2)
    udder_diff = np.abs(u1 - u2)
    
    X = np.column_stack([
        udder_max,
        udder_diff,
        amb,
        hum,
        thi,
        act,
        tds
    ])
    
    feature_names = [
        "udder_temp_max",
        "udder_temp_diff",
        "ambient_temp",
        "humidity",
        "thi",
        "activity",
        "tds_ppm"
    ]
    
    return X, y, feature_names

def train_and_save_model():
    print("Generating bovine physiological dataset based on ICAR/veterinary mastitis research...")
    X, y, feature_names = generate_veterinary_dataset(n_samples=3500)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    print(f"Dataset split: {len(X_train)} training records, {len(X_test)} validation records.")
    
    # Train robust Random Forest Classifier
    rf = RandomForestClassifier(
        n_estimators=120,
        max_depth=8,
        min_samples_split=4,
        class_weight="balanced",
        random_state=42
    )
    rf.fit(X_train, y_train)
    
    y_pred = rf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Validation Accuracy: {acc * 100:.2f}%")
    print("\nClassification Report:\n", classification_report(y_test, y_pred, target_names=["Healthy", "Sub-Clinical", "Clinical"]))
    
    # Feature importances
    importances = dict(zip(feature_names, rf.feature_importances_))
    print("Feature Importances:")
    for f, imp in sorted(importances.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {f}: {imp * 100:.1f}%")
    
    # Bundle model package
    package = {
        "model": rf,
        "feature_names": feature_names,
        "classes": ["Low Risk (Healthy)", "Moderate Risk (Sub-Clinical)", "High Risk (Clinical)"],
        "class_codes": [0, 1, 2],
        "accuracy": float(acc),
        "feature_importances": importances,
        "algorithm": "RandomForestClassifier",
        "version": "1.0.0-bovine-mastitis"
    }
    
    out_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "bovine_mastitis_xgboost.pkl")
    
    joblib.dump(package, out_path)
    print(f"\nModel successfully serialized and saved to: {out_path}")
    return out_path

if __name__ == "__main__":
    train_and_save_model()
