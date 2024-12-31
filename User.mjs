import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
    headless: false,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
})
const page = await browser.newPage();
await page.goto('https://www.youtube.com/');
const element = await page.waitForSelector('ytSearchboxComponentInputBox')
await element.click

