var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { appBundleIdentifier, appCodeRequirement, appVersion } from './utils.js';
export function appHelperInfo(app, appConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bundleIdentifier = yield appBundleIdentifier(app);
            appConfig.appBundleIdentifier = bundleIdentifier;
            const codeRequirement = yield appCodeRequirement(app);
            appConfig.appCodeRequirement = codeRequirement;
            const version = yield appVersion(app);
            console.log(`${app}: appHelperInfo successful`);
            if (version == appConfig.appVersion)
                return false;
            appConfig.appVersion = version;
            return true;
        }
        catch (e) {
            console.error(`${app}: appHelperInfo failed with error "${e.message}"`);
            throw e;
        }
    });
}
