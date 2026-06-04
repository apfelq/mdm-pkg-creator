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
import { pkgHelperInfo } from './pkgHelpers.js';
import { appRename, fileDelete, pkgCreate, pkgFinalize, zipExtractFile } from './utils.js';
export function updateHandlerZipApp(app, appConfig, updates) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield download(app, appConfig);
            yield zipExtractFile(app, appConfig.appName, 'app');
            if (!(yield appHelperInfo(app, appConfig)) && !appConfig.pkgChecksumVersion) {
                console.log(`${app}: updateHandlerZipApp no update available`);
                return false;
            }
            if (!(yield appRename(app, appConfig.appName)))
                throw '';
            const pkgTarget = appConfig.pkgTarget ? appConfig.pkgTarget : `/Applications`;
            yield pkgCreate(app, appConfig.appName, pkgTarget);
            if (!(yield pkgHelperInfo(app, appConfig)))
                throw '';
            yield pkgFinalize(app, appConfig.appVersion);
            yield fileDelete(app, appConfig.appName, `tmp`);
            yield fileDelete(app, `${app}.zip`, `tmp`);
            console.log(`${app}: updateHandlerZipApp update available`);
            updates.push(app);
            return true;
        }
        catch (e) {
            console.error(`${app}: updateHandlerZipApp failed with error "${e.message}"`);
            return false;
        }
    });
}
