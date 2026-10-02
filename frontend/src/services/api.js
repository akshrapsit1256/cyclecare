const API_BASE = '/api';

export async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    if (!res.ok) {
      let errorMsg = `Server error (${res.status})`;
      try {
        const errData = await res.json();
        if (errData.detail) errorMsg = errData.detail;
      } catch (_) {}
      throw new Error(errorMsg);
    }

    return await res.json();
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

// Cycle APIs
export const getCycleStatus = () => fetchJson('/cycle');
export const updateCycleSettings = (data) => fetchJson('/cycle', {
  method: 'POST',
  body: JSON.stringify(data)
});

// Checkin APIs
export const getCheckinForDate = (dateStr) => {
  const query = dateStr ? `?date=${encodeURIComponent(dateStr)}` : '';
  return fetchJson(`/checkin${query}`);
};
export const getCheckinHistory = (limit = 14) => fetchJson(`/checkin/history?limit=${limit}`);
export const saveCheckin = (data) => fetchJson('/checkin', {
  method: 'POST',
  body: JSON.stringify(data)
});

// Preferences APIs
export const getPreferences = () => fetchJson('/preferences');
export const updatePreferences = (data) => fetchJson('/preferences', {
  method: 'POST',
  body: JSON.stringify(data)
});

// AI Wellness APIs
export const getAiStatus = () => fetchJson('/ai/status');
export const getLatestAiWellness = () => fetchJson('/ai/latest');
export const generateAiWellness = (payload = {}) => fetchJson('/ai/wellness', {
  method: 'POST',
  body: JSON.stringify(payload)
});
