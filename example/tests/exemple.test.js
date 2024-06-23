import { toMatchImageSnapshot } from "jest-image-snapshot";

const puppeteer = require("puppeteer");
expect.extend({ toMatchImageSnapshot });

const expectToMatchImageSnapshot = async (page, height = 1080, width = 1920) => {
  await page.setViewport({
    width,
    height,
    deviceScaleFactor: 1,
  });

  const image = await page.screenshot();
  return expect(image).toMatchImageSnapshot({
    storeReceivedOnFailure: true,
    onlyDiff: true,
    customSnapshotIdentifier: ({ currentTestName, counter }) => {
      const splitSlash = currentTestName.split("/");
      const splitTest = splitSlash[splitSlash.length - 1].split(">");
      const testFilename = splitTest[splitTest.length - 2].trim().replace(".test.js", "");
      const testName = splitTest[splitTest.length - 1].trim();
      return `${testFilename}-${testName}-${counter}`;
    },
  });
};

test("time", async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://timestamp.online/`);
  await expectToMatchImageSnapshot(page);
});

test("google", async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://google.com`);
  await expectToMatchImageSnapshot(page);
});

test("time__sm__", async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://timestamp.online/`);
  await expectToMatchImageSnapshot(page, 800, 400);
});

test("google__sm__", async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://google.com`);
  await expectToMatchImageSnapshot(page, 800, 400);
});
