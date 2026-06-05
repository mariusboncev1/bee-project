/**
 * Toggl Track API Integration
 * Manages time tracking for beekeeping activities.
 */

const TOGGL_API_TOKEN = process.env.TOGGL_API_TOKEN || '';
const TOGGL_WORKSPACE_ID = process.env.TOGGL_WORKSPACE_ID || '';
const TOGGL_API_BASE = 'https://api.track.toggl.com/api/v9';

/**
 * Start a new time entry for a beekeeping task
 */
async function startTimeEntry(description, projectName = 'ApiNote') {
  if (!TOGGL_API_TOKEN) {
    console.warn('⚠️  Toggl API token not configured');
    return { success: false, mock: true, message: 'Toggl not configured' };
  }

  try {
    const response = await fetch(`${TOGGL_API_BASE}/workspaces/${TOGGL_WORKSPACE_ID}/time_entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${TOGGL_API_TOKEN}:api_token`).toString('base64')}`,
      },
      body: JSON.stringify({
        description,
        workspace_id: parseInt(TOGGL_WORKSPACE_ID),
        duration: -1,
        start: new Date().toISOString(),
        created_with: 'ApiNote Beekeeping App',
        tags: ['beekeeping', projectName],
      }),
    });

    if (!response.ok) throw new Error(`Toggl API error: ${response.status}`);
    const data = await response.json();
    return { success: true, entry: data };
  } catch (error) {
    console.error('❌ Toggl start entry error:', error.message);
    return { success: false, error: error.message };
  }
}

async function stopTimeEntry(entryId) {
  if (!TOGGL_API_TOKEN) return { success: false, mock: true };

  try {
    const response = await fetch(`${TOGGL_API_BASE}/workspaces/${TOGGL_WORKSPACE_ID}/time_entries/${entryId}/stop`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${TOGGL_API_TOKEN}:api_token`).toString('base64')}`,
      },
    });

    if (!response.ok) throw new Error(`Toggl API error: ${response.status}`);
    const data = await response.json();
    return { success: true, entry: data };
  } catch (error) {
    console.error('❌ Toggl stop entry error:', error.message);
    return { success: false, error: error.message };
  }
}

async function getTimeEntries(startDate, endDate) {
  if (!TOGGL_API_TOKEN) return [];

  try {
    const response = await fetch(
      `${TOGGL_API_BASE}/me/time_entries?start_date=${startDate}&end_date=${endDate}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${TOGGL_API_TOKEN}:api_token`).toString('base64')}`,
        },
      }
    );

    if (!response.ok) throw new Error(`Toggl API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('❌ Toggl get entries error:', error.message);
    return [];
  }
}

async function getCurrentTimeEntry() {
  if (!TOGGL_API_TOKEN) return null;

  try {
    const response = await fetch(`${TOGGL_API_BASE}/me/time_entries/current`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${TOGGL_API_TOKEN}:api_token`).toString('base64')}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Toggl API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Toggl get current entry error:', error.message);
    return null;
  }
}

module.exports = {
  startTimeEntry,
  stopTimeEntry,
  getTimeEntries,
  getCurrentTimeEntry,
};
