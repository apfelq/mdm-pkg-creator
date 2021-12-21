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
import path from 'path';
import stream from 'stream';
import { promisify } from 'util';
import { __dirname } from './index.js';
const pipeline = promisify(stream.pipeline);
export function download(app, filename, url) {
    return __awaiter(this, void 0, void 0, function* () {
        const outputPath = path.join(__dirname, 'tmp', filename);
        const downloadStream = got.stream(url);
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
