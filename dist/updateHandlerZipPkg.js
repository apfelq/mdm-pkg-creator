var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { appHelperInfo } from './appHelpers.js';
import { download } from './webUtils.js';
import { pkgHelperInfo, pkgHelperExtractApp } from './pkgHelpers.js';
import { pkgFinalize, pkgInstall, zipExtractFile } from './utils.js';
export function updateHandlerZipPkg(app, appConfig, updates) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield download(app, appConfig);
            yield zipExtractFile(app, appConfig.appName, 'pkg');
            if (!(yield pkgHelperInfo(app, appConfig)))
                return false;
            if (appConfig.pkgInstall) {
                yield pkgInstall(app);
            }
            else {
                if (!(yield pkgHelperExtractApp(app, appConfig)))
                    throw '';
            }
            if (!(yield appHelperInfo(app, appConfig)) && !appConfig.pkgChecksumVersion) {
                console.log(`${app}: updateHandlerZipPkg no update available`);
                return false;
            }
            yield pkgFinalize(app, appConfig.appVersion);
            console.log(`${app}: updateHandlerZipPkg update available`);
            updates.push(app);
            return true;
        }
        catch (e) {
            console.error(`${app}: updateHandlerZipPkg failed with error "${e.message}"`);
            return false;
        }
    });
}
