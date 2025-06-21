const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function scrapeWithBrowser() {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--single-process',
      '--no-zygote',
      '--window-size=1280,720'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    console.log('Navigating to page...');
    await page.goto('https://sahi.com/sahi-buzz?date=Today', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    console.log('Waiting for content...');
    await page.waitForSelector('[class*="text-lg"]', { timeout: 30000 });

    const articles = await page.evaluate(() => {
      const items = document.querySelectorAll('.relative.p-4.transition-colors.duration-200.group.bg-surface-neutral-l1-dark.rounded-lg.cursor-pointer.hover\\:bg-surface-neutral-l2-dark');
      return Array.from(items).map(el => ({
        type: el.querySelector('.flex.justify-between.items-start.mb-2')?.textContent.trim() || 'N/A',
        title: el.querySelector('.text-lg.font-semibold.mb-2.text-neutral-primary-dark')?.textContent.trim() || 'N/A',
        description: el.querySelector('.text-sm.text-neutral-secondary-dark')?.textContent.trim() || 'N/A',
        scraped_at: new Date().toISOString()
      }));
    });

    fs.writeFileSync('output.json', JSON.stringify({ data: articles }, null, 2));
    console.log(`Successfully scraped ${articles.length} articles`);
    return articles;

  } catch (error) {
    console.error('Scraping failed:', error);
    fs.writeFileSync('output.json', JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }, null, 2));
    return [];
  } finally {
    await browser.close().catch(e => console.error('Error closing browser:', e));
  }
}

(async () => {
  try {
    await scrapeWithBrowser();
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
})();
