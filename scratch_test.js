import { chromium } from 'playwright';

(async () => {
    console.log('Launching headless browser test...');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('BROWSER ERROR:', msg.text());
            consoleErrors.push(msg.text());
        }
    });

    page.on('pageerror', err => {
        console.log('UNCAUGHT PAGE ERROR:', err.message);
        consoleErrors.push(err.message);
    });

    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Click PLAY CAMPAIGN
    await page.mouse.click(640, 310);
    await page.waitForTimeout(2500);

    await page.screenshot({ path: '/home/mark/.gemini/antigravity-cli/brain/0419396d-a84f-4c23-8688-84c3073dd861/campaign_golf_cup_noflag.png' });
    console.log('Campaign Golf Cup (No Flag) screenshot captured.');

    await browser.close();

    if (consoleErrors.length === 0) {
        console.log('✅ ZERO CONSOLE ERRORS DETECTED IN BROWSER!');
    } else {
        console.error(`❌ FOUND ${consoleErrors.length} CONSOLE ERRORS:`, consoleErrors);
        process.exit(1);
    }
})();
