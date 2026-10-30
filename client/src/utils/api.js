/**
 * API and WebSocket client for Universal Remote
 */

const API_BASE = '/api';

export const fetchDevices = async () => {
  const res = await fetch(`${API_BASE}/devices`);
  if (!res.ok) throw new Error('Failed to fetch devices');
  return res.json();
};

export const fetchDiscoveredDevices = async () => {
  const res = await fetch(`${API_BASE}/discovery`);
  if (!res.ok) throw new Error('Failed to fetch discovered devices');
  return res.json();
};

export const triggerNetworkScan = async () => {
  const res = await fetch(`${API_BASE}/discovery/scan`, { method: 'POST' });
  if (!res.ok) throw new Error('Network scan failed');
  return res.json();
};

export const addCustomDiscoveredDevice = async (device) => {
  const res = await fetch(`${API_BASE}/discovery/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(device)
  });
  if (!res.ok) throw new Error('Failed to add device');
  return res.json();
};

export const sendCommand = async (deviceId, action, value = null, payload = null) => {
  const res = await fetch(`${API_BASE}/commands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, action, value, payload })
  });
  if (!res.ok) throw new Error(`Command failed: ${action}`);
  return res.json();
};

export const fetchKeepAliveStatus = async () => {
  const res = await fetch(`${API_BASE}/ping/status`);
  if (!res.ok) throw new Error('Failed to fetch ping status');
  return res.json();
};

export const configureRenderUrl = async (url) => {
  const res = await fetch(`${API_BASE}/ping/configure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  if (!res.ok) throw new Error('Failed to configure target URL');
  return res.json();
};

export const setupThinQ = async (credentials) => {
  const res = await fetch(`${API_BASE}/auth/thinq`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return res.json();
};

export const fetchNetworkInfo = async () => {
  const res = await fetch(`${API_BASE}/network-info`);
  if (!res.ok) throw new Error('Failed to fetch network info');
  return res.json();
};

export const wakeLgTv = async () => {
  const res = await fetch(`${API_BASE}/devices/lg-tv/wol`, { method: 'POST' });
  return res.json();
};
