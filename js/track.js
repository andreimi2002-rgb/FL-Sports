// The personal edition does not collect visits or actions. Keep shared call sites inert.
export const notCounted = () => true;
export function setNotCounted() {}
export function trackView() {}
export function trackEvent() {}
export function count() {}
export function trackInstall() {}
export function setupActivity() {}
