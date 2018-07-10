const breaches = require("blurts-addon/src/breaches.json");
const puppeteer = require("puppeteer");

async function main(count=50, start=0) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 700 });

  console.log("DOMAIN | PAGE_LOAD | NOTES\n-------|----------:|------");
  for (const breach of breaches.splice(start, count)) {
    if (breach.Domain) {
      try {
        const res = await scanSite(page, breach);
        console.log(res);
      } catch (err) {
        console.error(`${breach.Domain || breach.Name} | n/a | ${err.message}`);
      }
    } else {
      console.log(`${breach.Name} | n/a | No domain found.`);
    }
  }
  await browser.close();
}

async function scanSite(page, {Domain, Name}) {
  await page.goto(`http://${Domain}`, {waitUntil: 'load'});

  const performance = JSON.parse(await page.evaluate(() => JSON.stringify(window.performance)));
  return `${Domain} | ${Math.round(performance.timing.loadEventEnd - performance.timeOrigin).toLocaleString()}ms | `;
}

main(20);
