// Clear any cached Google authentication data
export function clearGoogleAuthCache() {
  if (typeof window !== 'undefined') {
    // Clear localStorage items related to Google Auth
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('google') || key.includes('gapi') || key.includes('oauth'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))

    // Clear sessionStorage items related to Google Auth
    const sessionKeysToRemove = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && (key.includes('google') || key.includes('gapi') || key.includes('oauth'))) {
        sessionKeysToRemove.push(key)
      }
    }
    sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key))

    // Clear any Google cookies if accessible
    try {
      document.cookie.split(";").forEach(function(c) { 
        if (c.includes('google') || c.includes('gapi')) {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        }
      });
    } catch (e) {
      // Ignore cookie clearing errors
    }
  }
}