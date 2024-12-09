var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import child_process from 'child_process';
import fs from 'graceful-fs';
import got from 'got';
import { gotScraping } from 'got-scraping';
import { Cookie, CookieJar } from 'tough-cookie';
import path from 'path';
import stream from 'stream';
import { promisify } from 'util';
import { __dirname } from './index.js';
const exec = promisify(child_process.exec);
const pipeline = promisify(stream.pipeline);
let gotOptions = {
    https: { ciphers: 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384' },
    http2: true
};
export function download(app, appConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        const downloadUrl = appConfig.downloadType == 'scrape' ? appConfig.scrapeDownloadUrl : appConfig.downloadUrl;
        if (!fs.existsSync(path.join(__dirname, 'tmp', `${app}`)))
            fs.mkdirSync(path.join(__dirname, 'tmp', `${app}`));
        const downloadFileType = appConfig.downloadFileType.replace('nested-', '');
        if (appConfig.downloadTool === 'curl')
            return downloadCurl(app, `${app}.${downloadFileType}`, downloadUrl);
        if (appConfig.downloadTool === 'wget')
            return downloadWget(app, `${app}.${downloadFileType}`, downloadUrl);
        let cookies = undefined;
        let cookieJar = new CookieJar();
        if (appConfig.cookieUrl) {
            const response = yield got(appConfig.cookieUrl);
            if (response.headers['set-cookie'] instanceof Array) {
                cookies = response.headers['set-cookie'].map(header => Cookie.parse(header));
            }
            else {
                cookies = [Cookie.parse(response.headers['set-cookie'])];
            }
            for (let cookie of cookies) {
                cookieJar.setCookieSync(cookie, downloadUrl);
            }
        }
        const outputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.${downloadFileType}`);
        const fileWriterStream = fs.createWriteStream(outputPath);
        gotOptions['url'] = downloadUrl;
        if (cookies)
            gotOptions['cookieJar'] = cookieJar;
        const downloadStream = got.stream(gotOptions);
        try {
            yield pipeline(downloadStream, fileWriterStream);
            console.log(`${app}: download successful`);
            return true;
        }
        catch (e) {
            console.error(`${app}: download failed with error "${e.message}"`);
            console.error(`${app}: trying to download with curl`);
            return downloadCurl(app, `${app}.${downloadFileType}`, downloadUrl);
        }
    });
}
export function downloadCurl(app, downloadName, downloadUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        let curlBin = '/opt/homebrew/opt/curl/bin/curl';
        try {
            yield fs.promises.realpath(`${curlBin}`);
        }
        catch (e) {
            curlBin = '/usr/bin/curl';
        }
        const outputPath = path.join(__dirname, 'tmp', `${app}`, `${downloadName}`);
        try {
            const output = yield exec(`${curlBin} -LSs -o "${outputPath}" "${downloadUrl}"`);
            console.log(`${app}: downloadCurl successful`);
            return true;
        }
        catch (e) {
            console.error(`${app}: downloadCurl failed with error "${e.message}"`);
            throw e;
        }
    });
}
export function downloadWget(app, downloadName, downloadUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        let wgetBin = '/usr/local/bin/wget';
        try {
            yield fs.promises.realpath(`${wgetBin}`);
        }
        catch (e) {
            console.error(`${app}: downloadWget failed with error "${e.message}"`);
            throw e;
        }
        const outputPath = path.join(__dirname, 'tmp', `${app}`, `${downloadName}`);
        try {
            const output = yield exec(`${wgetBin} -q -O "${outputPath}" "${downloadUrl}"`);
            console.log(`${app}: downloadWget successful`);
            return true;
        }
        catch (e) {
            console.error(`${app}: downloadWget failed with error "${e.message}"`);
            throw e;
        }
    });
}
export function scrape(app, appConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        if (appConfig.scrapeFormRaw) {
            let curlBin = '/opt/homebrew/opt/curl/bin/curl';
            try {
                yield fs.promises.realpath(`${curlBin}`);
            }
            catch (e) {
                try {
                    curlBin = '/usr/local/opt/curl/bin/curl';
                    yield fs.promises.realpath(`${curlBin}`);
                }
                catch (e) {
                    curlBin = '/usr/bin/curl';
                }
            }
            const curlCmd = `${curlBin} --data-binary '${appConfig.scrapeFormRaw}' '${appConfig.scrapeUrl}'`;
            try {
                const output = yield exec(curlCmd);
                console.log(`${app}: scrape successful`);
                return output.stdout;
            }
            catch (e) {
                console.error(`${app}: scrape failed with error "${e.message}"`);
                throw e;
            }
        }
        else {
            const headerGeneratorOptions = {
                browsers: [
                    {
                        name: 'firefox',
                        minVersion: 91,
                        maxVersion: 95
                    }
                ],
                devices: ['desktop'],
                locales: ['en'],
                operatingSystems: ['macos'],
            };
            gotOptions['url'] = appConfig.scrapeUrl;
            if (appConfig.scrapeForm) {
                gotOptions['form'] = appConfig.scrapeForm;
            }
            try {
                let response;
                if (appConfig.scrapeForm)
                    response = yield gotScraping.post(gotOptions);
                else
                    response = yield gotScraping.get(gotOptions);
                console.log(`${app}: scrape successful`);
                return response.body;
            }
            catch (e) {
                console.error(`${app}: scrape failed with error "${e.message}"`);
                throw e;
            }
        }
    });
}
