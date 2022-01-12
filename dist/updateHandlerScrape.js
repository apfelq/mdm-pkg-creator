var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { scrape } from './webUtils.js';
import { updateHandlerDmgApp } from './updateHandlerDmgApp.js';
import { updateHandlerDmgPkg } from './updateHandlerDmgPkg.js';
import { updateHandlerPkg } from './updateHandlerPkg.js';
import { updateHandlerZipApp } from './updateHandlerZipApp.js';
export function updateHandlerScrape(app, appConfig, updates) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = yield scrape(app, appConfig.scrapeUrl);
            const version = body.match(new RegExp(appConfig.scrapeRegex))[1];
            if (!version)
                throw 'version not found, check scrapeUrl & scrapeRegex';
            const downloadUrl = appConfig.downloadUrl.replaceAll('%VERSION%', version);
            if (appConfig.scrapeDownloadUrl == downloadUrl) {
                console.log(`${app}: updateHandlerScrape no update`);
                return false;
            }
            appConfig.scrapeDownloadUrl = downloadUrl;
            let handler = false;
            switch (appConfig.downloadFileType) {
                case 'dmg':
                    if (!appConfig.dmgFileType) {
                        console.error(`${app}: missing "dmgFileType" in confg`);
                        break;
                    }
                    if (appConfig.dmgFileType == 'app') {
                        handler = yield updateHandlerDmgApp(app, appConfig, updates);
                    }
                    else if (appConfig.dmgFileType == 'pkg') {
                        handler = yield updateHandlerDmgPkg(app, appConfig, updates);
                    }
                    break;
                case 'pkg':
                    handler = yield updateHandlerPkg(app, appConfig, updates);
                    break;
                case 'zip':
                    if (!appConfig.zipFileType) {
                        console.error(`${app}: missing "zipFileType" in confg`);
                        break;
                    }
                    if (appConfig.zipFileType == 'app') {
                        handler = yield updateHandlerZipApp(app, appConfig, updates);
                    }
                    break;
            }
            if (!handler) {
                console.log(`${app}: updateHandlerScrape no update`);
                return false;
            }
            console.log(`${app}: updateHandlerScrape update available`);
            return true;
        }
        catch (e) {
            console.error(`${app}: updateHandlerScrape failed with error "${e.message}"`);
            return false;
        }
    });
}
