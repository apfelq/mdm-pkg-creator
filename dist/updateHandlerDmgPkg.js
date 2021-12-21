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
import { promisify } from 'util';
import { appHelperInfo } from './appHelpers.js';
import { download } from './download.js';
import { pkgHelperInfo, pkgHelperExtractApp } from './pkgHelpers.js';
import { dmgExtractFile, fileDelete, pkgFinalize } from './utils.js';
const unlink = promisify(fs.unlink);
export function updateHandlerDmgPkg(app, appConfig, updates) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield download(app, `${app}.dmg`, appConfig.downloadUrl);
            const pkgName = appConfig.pkgName ? appConfig.pkgName : appConfig.appName.replace('.app', '.pkg');
            yield dmgExtractFile(app, pkgName, 'pkg');
            if (!(yield pkgHelperInfo(app, appConfig)))
                throw '';
            if (!(yield pkgHelperExtractApp(app, appConfig)))
                throw '';
            if (!(yield appHelperInfo(app, appConfig)))
                throw '';
            yield pkgFinalize(app, appConfig.appVersion);
            yield fileDelete(app, `${app}.app`, `tmp`);
            yield fileDelete(app, `${app}.dmg`, `tmp`);
            console.log(`${app}: updateHandlerDmgPkg update available`);
            updates.push(app);
            return true;
        }
        catch (e) {
            console.error(`${app}: updateHandlerDmgPkg failed with error "${e.message}"`);
            return false;
        }
    });
}
