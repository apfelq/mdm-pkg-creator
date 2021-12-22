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
            yield download(app, appConfig);
            if (!appConfig.pkgName) {
                console.error(`${app}: no pkgName in config`);
                return false;
            }
            yield dmgExtractFile(app, appConfig.pkgName, 'pkg');
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
