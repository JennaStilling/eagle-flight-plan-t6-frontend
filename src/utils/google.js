// local vs. production url for google calls
const url =
  process.env.NODE_ENV === "production"
    ? "https://flightplan.eaglesoftwareteam.com"
    : "http://localhost:3026";

// API path for calendar operations
const calendarApiPath = process.env.NODE_ENV === "production"
    ? "/nodeapps/2025/flight-plan/t6/calendar" 
    : "/api/calendar"; 

export const getGoogleToken = async (scope) => {
  return new Promise((resolve) => {
    if (!window.google || !window.google.accounts) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.onload = () => initializeGoogleAuth(scope, resolve);
      document.head.appendChild(script);
    } else {
      initializeGoogleAuth(scope, resolve);
    }
  });
};

function initializeGoogleAuth(scope, resolve) {
  const user = JSON.parse(localStorage.getItem("user"));
  const client = import.meta.env.VITE_APP_CLIENT_ID || (user && user.clientId);

  if (!client) {
    console.error("No google api token found");
    resolve(null);
    return;
  }

  window.google.accounts.oauth2
    .initTokenClient({
      client_id: client,
      scope: scope,
      callback: (tokenResponse) => {
        if (tokenResponse.error) {
          console.error("Google token error:", tokenResponse);
          resolve(null);
        } else {
          resolve(tokenResponse.access_token);
        }
      },
    })
    .requestAccessToken();
}

export const createCalendarEvent = async (eventDetails) => {
    const access_token = await getGoogleToken('https://www.googleapis.com/auth/calendar');
    console.log("Accessed url: " + url);
    console.log("API path: " + calendarApiPath);
    
    if (!access_token) {
        throw new Error('No google api token found');
    }

    const event = {
        access_token,
        ...eventDetails
    };
    
    const fullUrl = `${url}${calendarApiPath}/create`;
    console.log("Full request URL:", fullUrl);
    
    try {
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
        });
        
        console.log("Response status:", response.status);
        const responseText = await response.text();
        console.log("Response body:", responseText);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} - ${responseText}`);
        }
        
        try {
            return JSON.parse(responseText);
        } catch (e) {
            throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
        }
    } catch (error) {
        console.error("Calendar API error:", error);
        throw error;
    }
};

export const deleteCalendarEvent = async (eventId) => {
  const access_token = await getGoogleToken(
    "https://www.googleapis.com/auth/calendar"
  );

  if (!access_token) {
    throw new Error("No google api token found");
  }

  const fullUrl = `${url}${calendarApiPath}/delete`;
  console.log("Full delete URL:", fullUrl);

  try {
    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token,
        eventId,
      }),
    });
    
    console.log("Delete response status:", response.status);
    const responseText = await response.text();
    console.log("Delete response body:", responseText);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${responseText}`);
    }
    
    try {
      return JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
    }
  } catch (error) {
    console.error("Calendar delete API error:", error);
    throw error;
  }
};
