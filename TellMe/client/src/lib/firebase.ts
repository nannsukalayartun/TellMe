// This file provides a simple user fingerprinting utility for anonymous like tracking
// In a real Firebase implementation, this would be replaced with Firebase Auth or Anonymous Auth

export function generateUserFingerprint(): string {
  // Create a simple fingerprint based on browser characteristics
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx!.textBaseline = 'top';
  ctx!.font = '14px Arial';
  ctx!.fillText('Myanmar Lennon Wall', 2, 2);
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}

export function getUserFingerprint(): string {
  let fingerprint = localStorage.getItem('user-fingerprint');
  if (!fingerprint) {
    fingerprint = generateUserFingerprint();
    localStorage.setItem('user-fingerprint', fingerprint);
  }
  return fingerprint;
}
