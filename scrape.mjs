import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
    headless: false,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
})
const page = await browser.newPage();
await page.goto('https://www.youtube.com/');
await page.type('[name="search_query"]', 'Reminiscence by Yuji Nomi');
await page.keyboard.press('Enter');








