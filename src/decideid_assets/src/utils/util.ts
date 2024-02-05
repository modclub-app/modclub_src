
export const hideStringWithStars = (str: String) => {
  // Determine the length of the ID part that needs to be hidden
  const totalLength = str.length;
  const hideLength = Math.floor(totalLength / 2);

  // Get the start and end positions of the hidden part
  const start = Math.floor(totalLength / 4);
  const end = start + hideLength;

  // Hide the middle of the ID with '*' signs
  return `${str.substring(0, start)}${"*".repeat(hideLength)}${str.substring(
    end
  )}`;
};

type BrowserType = "Chrome" | "Safari" | "Other";
export function detectBrowser(): BrowserType {
  const userAgent: string = navigator.userAgent;

  // Check if browser is Chrome
  if (userAgent.match(/chrome|chromium|crios/i)) {
    return "Chrome";
  }
  // Check if browser is Safari
  else if (
    userAgent.match(/safari/i) &&
    !userAgent.match(/chrome|chromium|crios/i)
  ) {
    return "Safari";
  } else {
    return "Other";
  }
}
