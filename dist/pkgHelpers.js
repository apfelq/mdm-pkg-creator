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
import path from 'path';
import { promisify } from 'util';
import { __dirname } from './index.js';
import { pkgChecksum, pkgExtractApp, pkgSigned } from './utils.js';
const unlink = promisify(fs.unlink);
export function pkgHelperInfo(app, appConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const checksum = yield pkgChecksum(app);
            if (checksum == appConfig.pkgChecksum) {
                yield unlink(path.join(__dirname, `tmp`, `${app}.pkg`));
                console.log(`${app}: no update available`);
                return false;
            }
            appConfig.pkgChecksum = checksum;
            appConfig.pkgSigned = yield pkgSigned(app);
            return true;
        }
        catch (e) {
            console.error(`${app}: pkgHelperInfo failed with error "${e.message}"`);
            throw e;
        }
    });
}
export function pkgHelperExtractApp(app, appConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pkgTarget = appConfig.pkgTarget ? appConfig.pkgTarget : `/Applications`;
            const pkgTargetApp = path.join(pkgTarget, appConfig.appName);
            yield pkgExtractApp(app, pkgTargetApp);
            return true;
        }
        catch (e) {
            console.error(`${app}: pkgExtract failed with error "${e.message}"`);
            return false;
        }
    });
}
