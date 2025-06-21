const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeWithBrowser() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // Important for Docker/CI environments
      '--single-process' // Sometimes needed in CI
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH // Optional for CI
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    console.log('Navigating to page...');
    await page.goto('https://sahi.com/sahi-buzz?date=Today', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Rest of your scraping code...
    const articles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.relative.p-4.transition-colors.duration-200.group.bg-surface-neutral-l1-dark.rounded-lg.cursor-pointer.hover\\:bg-surface-neutral-l2-dark')).map(el => ({
        type: el.querySelector('.flex.justify-between.items-start.mb-2')?.textContent.trim() || 'N/A',
        title: el.querySelector('.text-lg.font-semibold.mb-2.text-neutral-primary-dark')?.textContent.trim() || 'N/A',
        description: el.querySelector('.text-sm.text-neutral-secondary-dark')?.textContent.trim() || 'N/A',
        scraped_at: new Date().toISOString()
      }));
    });

    fs.writeFileSync('output.json', JSON.stringify({ data: articles }, null, 2));
    console.log(`Scraped ${articles.length} articles successfully!`);
    return articles;

  } catch (error) {
    console.error('Scraping failed:', error);
    fs.writeFileSync('output.json', JSON.stringify({ error: error.message }, null, 2));
    return [];
  } finally {
    await browser.close();
  }
}

scrapeWithBrowser()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));