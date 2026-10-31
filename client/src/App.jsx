import React, { useState, useEffect } from 'react';
import PublicWebsite from './components/PublicWebsite';
import {
  fetchDevices,
  executeCommand,
  triggerNetworkScan
} from './utils/api';
import { triggerHaptic } from './utils/haptics';

export default function App() {
  // Real devices from local hub start empty - NO fake connected devices!
  const [realDevices, setRealDevices] = useState([]);
  const [deviceStates, setDeviceStates] = useState({});

  const loadHubDevices = async () => {
    try {
      const res = await fetchDevices();
      if (res && Array.isArray(res.devices)) {
        // Filter strictly to Smart TVs only
        const tvDevices = res.devices.filter((d) => d.type !== 'lg-thinq-ac' && d.type !== 'lg_thinq');
        setRealDevices(tvDevices);
        const states = {};
        for (const d of tvDevices) {
          states[d.id] = { ...d };
        }
        setDeviceStates((prev) => ({ ...prev, ...states }));
      }
    } catch {
      setRealDevices([]);
    }
  };

  useEffect(() => {
    loadHubDevices();
  }, []);

  const handleExecute = async (deviceId, command, value) => {
    triggerHaptic(20);

    // Optimistic local state update for instant tactile feedback
    setDeviceStates((prev) => {
      const current = prev[deviceId] || {};
      const next = { ...current };

      if (command === 'power') next.power = !next.power;
      if (command === 'volume_up') next.volume = Math.min(100, (next.volume || 20) + 1);
      if (command === 'volume_down') next.volume = Math.max(0, (next.volume || 20) - 1);
      if (command === 'volume') next.volume = value;
      if (command === 'mute') next.isMuted = !next.isMuted;
      if (command === 'app_launch') next.currentApp = value;

      return { ...prev, [deviceId]: next };
    });

    try {
      await executeCommand(deviceId, command, value);
    } catch {
      // In interactive preview or offline mode, optimistic UI provides instant response
    }
  };

  return (
    <PublicWebsite
      realDevices={realDevices}
      deviceStates={deviceStates}
      onExecute={handleExecute}
      onRefreshDevices={loadHubDevices}
    />
  );
}
