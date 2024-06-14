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
import { fileDelete, pkgFinalize, pkgInstall } from './utils.js';
export function updateHandlerPkg(app, appConfig, updates) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield download(app, appConfig);
            if (!(yield pkgHelperInfo(app, appConfig)))
                return false;
            if (appConfig.pkgInstall) {
                pkgInstall(app);
            }
            else {
                if (!(yield pkgHelperExtractApp(app, appConfig)))
                    throw '';
            }
            yield appHelperInfo(app, appConfig);
            yield pkgFinalize(app, appConfig.appVersion);
            yield fileDelete(app, `${app}.app`, `tmp`);
            console.log(`${app}: updateHandlerPkg update available`);
            updates.push(app);
            return true;
        }
        catch (e) {
            console.error(`${app}: update failed`);
            return false;
        }
    });
}
