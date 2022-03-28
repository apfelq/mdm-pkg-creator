var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from 'graceful-fs';
import got from 'got';
import { gotScraping } from 'got-scraping';
import path from 'path';
import stream from 'stream';
import { promisify } from 'util';
import { __dirname } from './index.js';
const pipeline = promisify(stream.pipeline);
export function download(app, appConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        let downloadUrl = appConfig.downloadUrl;
        if (appConfig.downloadType == 'scrape')
            downloadUrl = appConfig.scrapeDownloadUrl;
        if (!fs.existsSync(path.join(__dirname, 'tmp', `${app}`)))
            fs.mkdirSync(path.join(__dirname, 'tmp', `${app}`));
        const outputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.${appConfig.downloadFileType}`);
        const downloadStream = got.stream(downloadUrl);
        const fileWriterStream = fs.createWriteStream(outputPath);
        try {
            yield pipeline(downloadStream, fileWriterStream);
            console.log(`${app}: download successful`);
            return true;
        }
        catch (e) {
            console.error(`${app}: download failed with error "${e.message}"`);
            throw e;
        }
    });
}
export function scrape(app, url) {
    return __awaiter(this, void 0, void 0, function* () {
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
        try {
            const response = yield gotScraping.get(url);
            console.log(`${app}: scrape successful`);
            return response.body;
        }
        catch (e) {
            console.error(`${app}: scrape failed with error "${e.message}"`);
            throw e;
        }
    });
}
