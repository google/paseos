/*
Copyright 2019 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const puppeteer = require('puppeteer');
const {startServer} = require('polyserve');
const path = require('path');
const fs = require('fs');
const baselineDir = `${process.cwd()}/test/integration/screenshots`;

describe('generate screenshots', function() {
  let polyserve, browser, page;

  before(async function() {
    polyserve = await startServer({port:4444,
      root:path.join(__dirname, '../../..'), moduleResolution:'node'});

    // Create the test directory if needed.
    if (!fs.existsSync(baselineDir)){
      fs.mkdirSync(baselineDir);
    }
    // And it's subdirectories.
    if (!fs.existsSync(`${baselineDir}/wide`)){
      fs.mkdirSync(`${baselineDir}/wide`);
    }
    if (!fs.existsSync(`${baselineDir}/narrow`)){
      fs.mkdirSync(`${baselineDir}/narrow`);
    }
  });

  after((done) => polyserve.close(done));

  beforeEach(async function() {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterEach(() => browser.close());

  it('did it', async function() {
    return generateBaselineScreenshots(page);
  });
});

async function generateBaselineScreenshots(page) {
  const breakpoints = [
      {width: 800, height: 600},
      {width: 375, height: 667}];
  const prefixes = ['wide', 'narrow'];

  for (let i = 0; i < prefixes.length; i++) {
    const prefix = prefixes[i];
    console.log(prefix + '...');
    page.setViewport(breakpoints[i]);
    // Index.
    await page.goto('http://127.0.0.1:4444/',
      { waitUntil: 'networkidle0', timeout: 60000 });
    await page.screenshot({path: `${baselineDir}/${prefix}/index.png`});
  }
}
