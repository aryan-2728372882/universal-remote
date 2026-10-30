/**
 * Universal Remote Hub Client API
 */

const API_BASE = '/api';

const handleResponse = async (res) => {
  if (res.status === 401) {
    const error = new Error('UNAUTHORIZED');
    error.status = 401;
    throw error;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || `HTTP error ${res.status}`);
  }
  return data;
};

// ---------------- AUTH ---------------- //

export const getAuthStatus = async () => {
  const res = await fetch(`${API_BASE}/auth/status`);
  return handleResponse(res);
};

export const setupPin = async (pin) => {
  const res = await fetch(`${API_BASE}/auth/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin })
  });
  return handleResponse(res);
};

export const loginPin = async (pin) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin })
  });
  return handleResponse(res);
};

export const logout = async () => {
  const res = await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
  return handleResponse(res);
};

// ---------------- DEVICES ---------------- //

export const fetchDevices = async () => {
  const res = await fetch(`${API_BASE}/devices`);
  return handleResponse(res);
};

export const addOrUpdateDevice = async (device) => {
  const res = await fetch(`${API_BASE}/devices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(device)
  });
  return handleResponse(res);
};

export const deleteDevice = async (id) => {
  const res = await fetch(`${API_BASE}/devices/${id}`, { method: 'DELETE' });
  return handleResponse(res);
};

export const executeCommand = async (deviceId, capabilityId, value = null) => {
  const res = await fetch(`${API_BASE}/devices/${deviceId}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ capabilityId, value })
  });
  return handleResponse(res);
};

export const pairDevice = async (deviceId, input) => {
  const res = await fetch(`${API_BASE}/devices/${deviceId}/pair`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input })
  });
  return handleResponse(res);
};

// ---------------- DISCOVERY ---------------- //

export const fetchDiscoveredDevices = async () => {
  const res = await fetch(`${API_BASE}/discovery`);
  return handleResponse(res);
};

export const triggerNetworkScan = async () => {
  const res = await fetch(`${API_BASE}/discovery/scan`, { method: 'POST' });
  return handleResponse(res);
};

// ---------------- SCENES & SCHEDULES ---------------- //

export const fetchScenes = async () => {
  const res = await fetch(`${API_BASE}/scenes`);
  return handleResponse(res);
};

export const saveScene = async (scene) => {
  const res = await fetch(`${API_BASE}/scenes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scene)
  });
  return handleResponse(res);
};

export const deleteScene = async (id) => {
  const res = await fetch(`${API_BASE}/scenes/${id}`, { method: 'DELETE' });
  return handleResponse(res);
};

export const triggerScene = async (id) => {
  const res = await fetch(`${API_BASE}/scenes/${id}/trigger`, { method: 'POST' });
  return handleResponse(res);
};

export const fetchSchedules = async () => {
  const res = await fetch(`${API_BASE}/schedules`);
  return handleResponse(res);
};

export const saveSchedule = async (schedule) => {
  const res = await fetch(`${API_BASE}/schedules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(schedule)
  });
  return handleResponse(res);
};

export const deleteSchedule = async (id) => {
  const res = await fetch(`${API_BASE}/schedules/${id}`, { method: 'DELETE' });
  return handleResponse(res);
};

// ---------------- HUB INFO & SETTINGS ---------------- //

export const fetchHubInfo = async () => {
  const res = await fetch(`${API_BASE}/hub/info`);
  return handleResponse(res);
};

export const updateThinqPat = async (patToken, country = 'IN') => {
  const res = await fetch(`${API_BASE}/hub/thinq`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patToken, country })
  });
  return handleResponse(res);
};
