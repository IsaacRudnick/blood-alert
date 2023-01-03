import fetch from "node-fetch";
import logger from "../util/logger.js";
// Check if a user's NS URL requires an Auth token
// Doesn't ensure the URL is valid
async function needsAuth(url: string): Promise<boolean> {
  const response = await fetch(url, { method: "HEAD" });
  const status = response.status;
  if (status === 401) {
    return true;
  } else if (status === 200) {
    return false;
  } else {
    logger.error(`Error checking if valid NS URL: ${url} | ${status}`);
    return false;
  }
}

async function validAuth(url: string, token: string) {
  url = url + "?token=" + token;
  const response = await fetch(url);
  const status = response.status;
  if (status === 401) {
    return true;
  } else if (status === 200) {
    return false;
  } else {
    logger.error(`Error checking if NS URL requires auth: ${url} | ${status}`);
    return false;
  }
}

console.log(await needsAuth("https://isaac-bg.up.railway.app/api/v2/entries.json"));
console.log(await needsAuth("https://jerebg.fly.dev/api/v2/entries.json"));

console.log(await validAuth("https://isaac-bg.up.railway.app/api/v2/entries.json", "nonsense"));
console.log(await validAuth("https://jerebg.fly.dev/api/v2/entries.json", "personalap-8cd4ff555de227f9"));

export { needsAuth, validAuth };
