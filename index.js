const path = require("path");
const meow = require("meow");
const puppeteer = require("puppeteer");
const breaches = require("blurts-addon/src/breaches.json");

const SERVERS = new Map();
SERVERS.set("local", "http://localhost:6060");
SERVERS.set("dev", "https://fx-breach-alerts.herokuapp.com");
SERVERS.set("stage", "https://blurts-server.stage.mozaws.net");
SERVERS.set("prod", "https://monitor.firefox.com");

const cli = meow(`
  Usage
    $ node index --server https://monitor.firefox.com

  Options
    --server, -s  Server URL
`, {
  flags: {
    env: {
      type: "string",
      alias: "e"
    },
    server: {
      type: "string",
      alias: "s",
      default: SERVERS.get("stage")
    }
  }
});

main(cli.flags);

function getServer({env, server}) {
  if (env && SERVERS.has(env)) {
    return SERVERS.get(env);
  }
  return server;
}

async function main(flags) {
  const serverUrl = getServer(flags);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 700 });

  console.log(`Scraping ${serverUrl} breaches...`);
  for (let idx = 0; idx < breaches.length; idx += 1) {
    const breach = breaches[idx];
    const breachUrl = `${serverUrl}/?breach=${breach.Name}`;
    const shotPath = path.join(__dirname, "shots", `${breach.Name}.png`);

    console.log(`  - ${breachUrl}`);
    await page.goto(breachUrl);

    const elementHandle = await page.$('#banner-left');
    await elementHandle.screenshot({ path: shotPath });
    // await page.screenshot({ path: shotPath });
  }

  await browser.close();
}
