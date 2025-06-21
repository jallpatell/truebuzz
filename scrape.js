const puppeteer = require('puppeteer');
async function scrapeWithBrowser() {
  const browser = await puppeteer.launch({ headless: "new" }); // Recommended headless mode
  const page = await browser.newPage();
  try {
    await page.goto('https://sahi.com/sahi-buzz?date=Today', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await page.waitForSelector('[class*="text-lg"]', { timeout: 10000 });
    const articles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.relative.p-4.transition-colors.duration-200.group.bg-surface-neutral-l1-dark.rounded-lg.cursor-pointer.hover\\:bg-surface-neutral-l2-dark')).map(el => ({
        type: el.querySelector('.flex.justify-between.items-start.mb-2').textContent.trim(),
        title: el.querySelector('.text-lg.font-semibold.mb-2.text-neutral-primary-dark').textContent.trim(),
        description: el.querySelector('.text-sm.text-neutral-secondary-dark')?.textContent.trim()
      }));
    });
    console.log('Scraped data:', articles);
    return articles;
  } catch (error) {
    console.error('Scraping failed:', error);
    return []; 
  } finally {
    await browser.close(); 
  }
}
scrapeWithBrowser();