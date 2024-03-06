var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { dmgExtractFile, fileDelete } from './utils.js';
import { download } from './webUtils.js';
import { updateHandlerDmgApp } from './updateHandlerDmgApp.js';
import { updateHandlerDmgPkg } from './updateHandlerDmgPkg.js';
export function updateHandlerNestedDmg(app, appConfig, updates) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield download(app, appConfig);
            yield dmgExtractFile(app, appConfig.downloadFileType, appConfig.nestedDmgName, appConfig.nestedDmgFileType, '');
            yield fileDelete(app, `${app}.${appConfig.downloadFileType}`, 'tmp');
            let handler = false;
            switch (appConfig.nestedDmgFileType) {
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
            }
            if (!handler) {
                console.log(`${app}: updateHandlerNestedDmg no update`);
                return false;
            }
            console.log(`${app}: updateHandlerNestedDmg update available`);
            return true;
        }
        catch (e) {
            console.error(`${app}: updateHandlerNestedDmg failed with error "${e.message}"`);
            return false;
        }
    });
}
