import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Workspace scopes
provider.addScope('https://mail.google.com/');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/calendar');
provider.addScope('https://www.googleapis.com/auth/tasks');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  // Load token from temporary session cache to survive page refresh in current session,
  // but strictly respect Least Privilege / standard guidelines.
  // We can keep it in-memory or session storage. The skill says: "Do NOT store the access token in localStorage or sessionStorage. Implement in-memory caching."
  // So we will do strict in-memory caching.
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If there's no cached token, user needs to re-sign-in to get a fresh token.
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// -----------------------------------------------------------------
// GMAIL INTEGRATION
// -----------------------------------------------------------------
export const sendGmail = async (to: string, subject: string, htmlBody: string): Promise<any> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google. Please sign in.');

  // Create MIME Message
  const str = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset="utf-8"',
    'MIME-Version: 1.0',
    '',
    htmlBody
  ].join('\r\n');

  // Base64URL encode
  const base64Safe = btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: base64Safe })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Failed to send email via Gmail API.');
  }

  return response.json();
};

// -----------------------------------------------------------------
// GOOGLE SHEETS INTEGRATION
// -----------------------------------------------------------------
export interface SpreadsheetCreationResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export const createGoogleSheet = async (title: string, headers: string[], rows: string[][]): Promise<SpreadsheetCreationResult> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google. Please sign in.');

  // 1. Create Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: { title }
    })
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Failed to create Google Sheet.');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Append Data (headers + rows)
  const appendRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:append?valueInputOption=RAW`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [headers, ...rows]
    })
  });

  if (!appendRes.ok) {
    const errData = await appendRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Failed to populate Google Sheet data.');
  }

  return { spreadsheetId, spreadsheetUrl };
};

// -----------------------------------------------------------------
// GOOGLE CALENDAR INTEGRATION
// -----------------------------------------------------------------
export const createCalendarEvent = async (
  summary: string,
  description: string,
  startTimeIso: string,
  endTimeIso: string,
  attendeesEmails: string[]
): Promise<any> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google. Please sign in.');

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      summary,
      description,
      start: {
        dateTime: startTimeIso,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      },
      end: {
        dateTime: endTimeIso,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      },
      attendees: attendeesEmails.map(email => ({ email }))
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Failed to create Google Calendar event.');
  }

  return response.json();
};

// -----------------------------------------------------------------
// GOOGLE TASKS INTEGRATION
// -----------------------------------------------------------------
export const createGoogleTask = async (title: string, dueDateIso?: string): Promise<any> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google. Please sign in.');

  const body: any = { title };
  if (dueDateIso) {
    // Google Tasks API expects RFC 3339 formatted date-time, or date part.
    // Ensure it ends with Z or has timezone offset.
    body.due = dueDateIso.includes('T') ? dueDateIso : `${dueDateIso}T00:00:00Z`;
  }

  const response = await fetch('https://tasks.googleapis.com/v1/lists/@default/tasks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Failed to create Google Task.');
  }

  return response.json();
};
