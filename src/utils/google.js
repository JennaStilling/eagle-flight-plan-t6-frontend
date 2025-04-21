// local vs. production url for google calls
const url = process.env.NODE_ENV === 'production' 
  ? 'https://flightplan.eaglesoftwareteam.com' 
  : 'http://localhost:3026';

export const getGoogleToken = async (scope) => {
    return new Promise((resolve) => {
        if (!window.google || !window.google.accounts) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.onload = () => initializeGoogleAuth(scope, resolve);
            document.head.appendChild(script);
        } else {
            initializeGoogleAuth(scope, resolve);
        }
    });
};

function initializeGoogleAuth(scope, resolve) {
    const user = JSON.parse(localStorage.getItem('user'));
    const client = import.meta.env.VITE_APP_CLIENT_ID || (user && user.clientId);
    
    if (!client) {
        console.error('No google api token found');
        resolve(null);
        return;
    }
    
    window.google.accounts.oauth2.initTokenClient({
        client_id: client,
        scope: scope,
        callback: (tokenResponse) => {
            if (tokenResponse.error) {
                console.error('Google token error:', tokenResponse);
                resolve(null);
            } else {
                resolve(tokenResponse.access_token);
            }
        },
    }).requestAccessToken();
}

export const createCalendarEvent = async (eventDetails) => {
    const access_token = await getGoogleToken('https://www.googleapis.com/auth/calendar');
    console.log("Accessed url: " + url);
    
    if (!access_token) {
        throw new Error('No google api token found');
    }

    const event = {
        access_token,
        ...eventDetails
    };
    
    const response = await fetch(url+'/api/calendar/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
    }
    
    return await response.json();
};

export const deleteCalendarEvent = async (eventId) => {
  const access_token = await getGoogleToken(
    "https://www.googleapis.com/auth/calendar"
  );

  if (!access_token) {
    throw new Error("No google api token found");
  }

  const response = await fetch(url + "/api/calendar/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_token,
      eventId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }

  return await response.json();
};