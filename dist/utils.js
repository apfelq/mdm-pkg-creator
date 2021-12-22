var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import child_process from 'child_process';
import path from 'path';
import { promisify } from 'util';
import { __dirname } from './index.js';
const exec = promisify(child_process.exec);
export function appBundleIdentifier(app) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputPath = path.join(__dirname, 'tmp', `${app}.app`, `Contents`, `Info.plist`);
        try {
            const output = yield exec(`sh ./src/appBundleIdentifier.sh "${inputPath}"`);
            console.log(`${app}: appBundleIdentifier successful`);
            return output.stdout.replace(/(\r\n|\n|\r)/gm, "");
        }
        catch (e) {
            console.error(`${app}: appBundleIdentifier failed with error "${e.message}"`);
            throw e;
        }
    });
}
export function appCodeRequirement(app) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputPath = path.join(__dirname, 'tmp', `${app}.app`);
        try {
            const output = yield exec(`sh ./src/appCodeRequirement.sh "${inputPath}"`);
            console.log(`${app}: appCodeRequirement successful`);
            return output.stdout.replace(/(\r\n|\n|\r)/gm, "");
        }
        catch (e) {
            console.error(`${app}: appCodeRequirement failed with error "${e.message}"`);
            throw e;
        }
    });
}
export function appRename(app, appName) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputPath = path.join(__dirname, 'tmp', `${app}.app`);
        const outputPath = path.join(__dirname, 'tmp', appName);
        try {
            const output = yield exec(`sh ./src/appRename.sh "${inputPath}" "${outputPath}"`);
            console.log(`${app}: appRename successful`);
            return true;
        }
        catch (e) {
            console.error(`${app}: appRename failed with error "${e.message}"`);
            throw e;
        }
    });
}
export function appVersion(app) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputPath = path.join(__dirname, 'tmp', `${app}.app`, `Contents`, `Info.plist`);
        try {
            const output = yield exec(`sh ./src/appVersion.sh "${inputPath}"`);
            console.log(`${app}: appVersion successful`);
            return output.stdout.replace(/(\r\n|\n|\r)/gm, "");
        }
        catch (e) {
            console.error(`${app}: appVersion failed with error "${e.message}"`);
            throw e;
        }
    });
}
export function dmgExtractFile(app, appName, type) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputPath = path.join(__dirname, 'tmp', `${app}.dmg`);
        const mountPoint = path.join(__dirname, 'mnt', `${app}`);
        const outputPath = path.join(__dirname, 'tmp', `${app}.${type}`);
        try {
            yield exec(`sh ./src/dmgExtractFile.sh "${inputPath}" "${mountPoint}" "${outputPath}" "${appName}"`);
            console.log(`${app}: dmgExtractFile successful`);
            return true;
        }
        catch (e) {
            console.error(`${app}: dmgExtractFile failed with error "${e.message}"`);
            throw e;
        }
    });
}
export function fileDelete(app, fileName, dir) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputPath = path.join(__dirname, dir, fileName);
        try {
            const output = yield exec(`sh ./src/fileDelete.sh "${inputPath}"`);
            console.log(`${app}: fileDelete successful`);
            return true;
        }
        catch (e) {
            console.error(`${app}: fileDelete failed with error "${e.message}"`);
            throw e;
        }
    });
}
export function pkgChecksum(app) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputPath = path.join(__dirname, 'tmp', `${app}.pkg`);
        try {
            const output = yield exec(`sh ./src/pkgChecksum.sh "${inputPath}"`);
            console.log(`${app}: pkgChecksum successful`);
            return output.stdout.replace(/(\r\n|\n|\r)/gm, "");
        }
        catch (e) {
            console.error(`${app}: pkgChecksum failed with error "${e.message}"`);
            throw e;
        }
    });
}
export function pkgCreate(app, appName, pkgTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputPath = path.join(__dirname, 'tmp', appName);
        const outputPath = path.join(__dirname, 'tmp', `${app}.pkg`);
        try {
            const output = yield exec(`sh ./src/pkgCreate.sh "${inputPath}" "${pkgTarget}" "${outputPath}"`);
            console.log(`${app}: pkgCreate successful`);
            return true;
        }
        catch (e) {
            console.error(`${app}: pkgCreate failed with error "${e.message}"`);
            throw e;
        }
    });
}
export function pkgExtractApp(app, appTargetPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputPath = path.join(__dirname, 'tmp', `${app}.pkg`);
        const outputPath = path.join(__dirname, 'tmp', `${app}.app`);
        try {
            const output = yield exec(`sh ./src/pkgExtractApp.sh "${inputPath}" "${appTargetPath}" "${outputPath}"`);
            console.log(`${app}: pkgExtractApp successful`);
            return true;
        }
        catch (e) {
            console.error(`${app}: pkgExtractApp failed with error "${e.message}"`);
            throw e;
        }
    });
}
export function pkgFinalize(app, version) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputPath = path.join(__dirname, 'tmp', `${app}.pkg`);
        const outputPath = path.join(__dirname, 'pkgs', `${app}_${version}.pkg`);
        try {
            yield exec(`sh ./src/appRename.sh "${inputPath}" "${outputPath}"`);
            console.log(`${app}: pkgFinalize successful`);
            return true;
        }
        catch (e) {
            console.error(`${app}: pkgFinalize failed with error "${e.message}"`);
            throw e;
        }
    });
}
export function pkgSigned(app) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputPath = path.join(__dirname, 'tmp', `${app}.pkg`);
        try {
            const output = yield exec(`sh ./src/pkgSigned.sh "${inputPath}"`);
            console.log(`${app}: pkgSigned successful`);
            if (output.stdout.startsWith('not-signed'))
                return false;
            return true;
        }
        catch (e) {
            console.error(`${app}: pkgSigned failed with error "${e.message}"`);
            return false;
        }
    });
}
export function zipExtractFile(app, appName, type) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputPath = path.join(__dirname, 'tmp', `${app}.zip`);
        const extractPath = path.join(__dirname, 'tmp', `${app}`);
        const outputPath = path.join(__dirname, 'tmp', `${app}.${type}`);
        try {
            yield exec(`sh ./src/zipExtractFile.sh "${inputPath}" "${extractPath}" "${outputPath}" "${appName}"`);
            console.log(`${app}: zipExtractFile successful`);
            return true;
        }
        catch (e) {
            console.error(`${app}: zipExtractFile failed with error "${e.message}"`);
            throw e;
        }
    });
}
