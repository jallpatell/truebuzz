const puppeteer = require('puppeteer');

async function scrapeWithBrowser() {
  const browser = await puppeteer.launch({ headless: "new" }); // Recommended headless mode
  const page = await browser.newPage();
  
  try {
    await page.goto('https://sahi.com/sahi-buzz?date=Today', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for articles to load - using attribute selector for better reliability
    await page.waitForSelector('[class*="text-lg"]', { timeout: 10000 });

    const articles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.text-lg.font-semibold.mb-2.text-neutral-primary-dark')).map(el => ({
        title: el.textContent.trim(),
        description: el.querySelector('.text-sm.text-neutral-secondary-dark')?.textContent.trim(),
        // For date - using proper class selector
        // Add more fields as needed
      }));
    });

    console.log('Scraped data:', articles);
    return articles;
    
  } catch (error) {
    console.error('Scraping failed:', error);
    return []; // Return empty array on error
  } finally {
    await browser.close(); // Ensure browser closes even if error occurs
  }
}

scrapeWithBrowser();