const fs = require('fs');
const puppeteer = require('puppeteer');
(async () => {
  const out = [];
  const url = 'https://smarttuningnusantar.github.io/2001-2007_HONDA_JAZZ_FIT_SM/HONDAESM.HTML';
  const browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  page.on('console', msg => out.push(`CONSOLE ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => out.push(`PAGEERROR: ${err.toString()}`));
  page.on('requestfailed', req => out.push(`REQFAILED: ${req.url()} (${req.failure().errorText})`));
  page.on('response', res => {
    const status = res.status();
    if (status >= 400) out.push(`HTTP ${status}: ${res.url()}`);
  });
  await page.goto(url, {waitUntil: 'networkidle2', timeout: 60000});
  // wait short to catch late logs
  await page.waitForTimeout(2000);
  const html = await page.content();
  out.push('---PAGE TITLE---');
  out.push(await page.title());
  fs.writeFileSync('/tmp/pages_check_result.txt', out.join('\n'));
  console.log(out.join('\n'));
  // also save a snapshot
  fs.writeFileSync('/tmp/pages_snapshot.html', html);
  await browser.close();
})();