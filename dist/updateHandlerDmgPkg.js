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
import { dmgExtractFile, fileDelete, pkgFinalize } from './utils.js';
export function updateHandlerDmgPkg(app, appConfig, updates) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!appConfig.downloadFileType.startsWith('nested'))
                yield download(app, appConfig);
            if (!appConfig.pkgName) {
                console.error(`${app}: no pkgName in config`);
                return false;
            }
            const fileType = appConfig.downloadFileType.startsWith('nested') ? appConfig.nestedDmgFileType : appConfig.downloadFileType;
            const fileName = appConfig.dmgFileName ? appConfig.dmgFileName : '';
            yield dmgExtractFile(app, fileType, appConfig.pkgName, appConfig.dmgFileType, fileName);
            if (!(yield pkgHelperInfo(app, appConfig)))
                return false;
            if (!(yield pkgHelperExtractApp(app, appConfig)))
                throw '';
            if (!(yield appHelperInfo(app, appConfig)) && !appConfig.pkgChecksumVersion) {
                console.log(`${app}: updateHandlerDmgPkg no update available`);
                return false;
            }
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
