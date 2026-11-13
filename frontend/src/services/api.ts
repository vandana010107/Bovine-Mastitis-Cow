// Frontend API service connecting React to FastAPI backend

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface SensorReading {
  id: number;
  cow_id: string;
  timestamp: string;
  timestamp_ms?: number;
  udder_temp_1: number | null;
  udder_temp_2: number | null;
  ambient_temp: number | null;
  humidity: number | null;
  activity: number | null;
  tds_ppm: number | null;
  tds_raw: number | null;
  tds_voltage: number | null;
  thi: number | null;
  is_simulated: boolean;
}

export interface CowProfile {
  id: string;
  breed: string;
  age: number;
  lactation_stage: string;
  farm: string;
  location: string;
  monitoring_start_date: string;
  notes?: string;
}

export interface LatestSensorResponse {
  status: 'Connected' | 'Delayed' | 'Offline';
  conn_color: string;
  bluetooth_status?: string;
  connected_device_name?: string;
  esp32_status: 'Connected' | 'Disconnected';
  last_updated: string | null;
  seconds_ago?: number;
  is_live?: boolean;
  last_received_packet?: string | null;
  error_message?: string | null;
  data: SensorReading | null;
  message?: string;
}

export interface BluetoothPortItem {
  port: string;
  description: string;
  hwid: string;
  is_bluetooth_candidate: boolean;
}

export interface BluetoothStatusResponse {
  status: 'Bluetooth Connected' | 'Bluetooth Disconnected' | 'Waiting for Device' | 'Connecting...';
  is_connected: boolean;
  connected_device_name: string;
  active_port: string | null;
  last_received_timestamp: string | null;
  last_received_packet: string | null;
  last_parsed_data: Record<string, any> | null;
  error_message: string | null;
  available_ports: BluetoothPortItem[];
}

export interface BluetoothPacketLog {
  id: number;
  timestamp: string;
  raw_json: string;
  status: 'Valid JSON' | 'Invalid JSON' | 'Processing' | 'Error';
  error: string | null;
  parsed_data: Record<string, any> | null;
}

export interface SensorHealthItem {
  name: string;
  pin: string;
  status: 'Connected' | 'Delayed' | 'Disconnected' | 'Error';
  last_reading: string;
  last_updated: string;
  is_valid: boolean;
  error?: string | null;
}

export interface DigitalTwinData {
  cow_id: string;
  baseline_status: 'established' | 'learning';
  message: string;
  readings_collected: number;
  min_readings_required: number;
  latest_values: {
    udder_temp_1: number | null;
    udder_temp_2: number | null;
    activity: number | null;
    tds_ppm: number | null;
    timestamp: string | null;
  };
  baselines: {
    udder_temp_1: number | null;
    udder_temp_2: number | null;
    activity: number | null;
    tds_ppm: number | null;
  } | null;
  deviations: {
    udder_temp_1: number | null;
    udder_temp_2: number | null;
    activity: number | null;
    tds_ppm: number | null;
  } | null;
}

export interface MlPredictionData {
  cow_id: string;
  model_status: 'model_unavailable' | 'active';
  model_name: string;
  message: string;
  current_risk: string;
  risk_24h: string;
  risk_48h: string;
  alert_level: string;
  contributing_features: string[];
  recommendation: string;
  is_validated: boolean;
}

export interface ResearchStats {
  dataset_size_records: number;
  real_hardware_records: number;
  simulated_records: number;
  monitored_cows_count: number;
  number_of_farms: number;
  missing_data_percentage: number;
  data_collection_duration_days: number;
  ml_model_status: string;
  ml_model_message: string;
  digital_twin_status: string;
  federated_learning_prepared: boolean;
  supported_farms: string[];
}

export interface NetworkInfo {
  bluetooth_device_name: string;
  bluetooth_status: string;
  active_port: string | null;
  instructions: string;
}

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API Error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  getLatestSensorData: (cowId: string = 'COW_001') =>
    fetchJson<LatestSensorResponse>(`/api/sensor-data/latest/${cowId}`),

  getSensorHistory: (cowId: string = 'COW_001', timeframe: string = '1h') =>
    fetchJson<{ cow_id: string; timeframe: string; count: number; readings: SensorReading[] }>(
      `/api/sensor-data/history/${cowId}?timeframe=${timeframe}`
    ),

  getAllRawSensorData: (cowId?: string, search?: string, limit: number = 100, offset: number = 0) => {
    let url = `/api/sensor-data/all?limit=${limit}&offset=${offset}`;
    if (cowId && cowId !== 'all') url += `&cow_id=${encodeURIComponent(cowId)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return fetchJson<{ total_count: number; offset: number; limit: number; readings: SensorReading[] }>(url);
  },

  deleteAllSensorData: (cowId?: string) => {
    let url = '/api/sensor-data/all';
    if (cowId && cowId !== 'all') {
      url += `?cow_id=${encodeURIComponent(cowId)}`;
    }
    return fetchJson<{ success: boolean; message: string; deleted_count: number }>(url, {
      method: 'DELETE'
    });
  },

  deleteSensorReading: (id: number) =>
    fetchJson<{ success: boolean; message: string }>(`/api/sensor-data/${id}`, {
      method: 'DELETE'
    }),

  getCows: () => fetchJson<CowProfile[]>('/api/cows'),

  getCowProfile: (cowId: string) => fetchJson<CowProfile>(`/api/cows/${cowId}`),

  saveCowProfile: (profile: CowProfile) =>
    fetchJson<CowProfile>('/api/cows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    }),

  deleteCowProfile: (cowId: string) =>
    fetchJson<{ message: string }>(`/api/cows/${encodeURIComponent(cowId)}`, {
      method: 'DELETE'
    }),


  // Bluetooth API Endpoints
  getBluetoothStatus: () => fetchJson<BluetoothStatusResponse>('/api/bluetooth/status'),

  getBluetoothPorts: () => fetchJson<BluetoothPortItem[]>('/api/bluetooth/ports'),

  connectBluetooth: (port?: string) =>
    fetchJson<{ success: boolean; message: string; status: string; device: string; port?: string }>(
      '/api/bluetooth/connect',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ port })
      }
    ),

  disconnectBluetooth: () =>
    fetchJson<{ success: boolean; message: string; status: string; device: string }>(
      '/api/bluetooth/disconnect',
      { method: 'POST' }
    ),

  getBluetoothPackets: () => fetchJson<BluetoothPacketLog[]>('/api/bluetooth/packets'),

  sendTestBluetoothPacket: (raw_json: string) =>
    fetchJson<BluetoothStatusResponse>('/api/bluetooth/test-packet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_json })
    }),

  getSensorHealth: (cowId: string = 'COW_001') =>
    fetchJson<SensorHealthItem[]>(`/api/sensors/status/${cowId}`),

  getDigitalTwin: (cowId: string = 'COW_001') =>
    fetchJson<DigitalTwinData>(`/api/digital-twin/${cowId}`),

  getMlPrediction: (cowId: string = 'COW_001') =>
    fetchJson<MlPredictionData>(`/api/ml-prediction/${cowId}`),

  getResearchStats: () => fetchJson<ResearchStats>('/api/research/stats'),

  getNetworkInfo: () => fetchJson<NetworkInfo>('/api/system/network-info'),

  toggleSimulationMode: (enable: boolean) =>
    fetchJson<{ simulation_mode: boolean; message: string }>(`/api/simulation/toggle?enable=${enable}`, {
      method: 'POST'
    }),

  exportCsvUrl: (cowId?: string) =>
    `${API_BASE_URL}/api/sensor-data/export${cowId ? `?cow_id=${cowId}` : ''}`
};
