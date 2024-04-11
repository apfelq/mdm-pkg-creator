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
import child_process from 'child_process';
import path from 'path';
import { promisify } from 'util';
import { __dirname } from './index.js';
const exec = promisify(child_process.exec);
export function appBundleIdentifier(app, appName) {
    return __awaiter(this, void 0, void 0, function* () {
        let inputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.app`, `Contents`, `Info.plist`);
        try {
            if (!(yield fsExists(inputPath, app))) {
                let inputPath = path.join(__dirname, 'tmp', `${app}`, `${appName}`, `Contents`, `Info.plist`);
                if (!(yield fsExists(inputPath, app))) {
                    let inputPath = path.join(`/Application/${appName}`, `Contents`, `Info.plist`);
                    if (!(yield fsExists(inputPath, app)))
                        throw new Error('Path does not exist');
                }
            }
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
export function appCodeRequirement(app, appName) {
    return __awaiter(this, void 0, void 0, function* () {
        let inputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.app`);
        try {
            if (!(yield fsExists(inputPath, app))) {
                let inputPath = path.join(__dirname, 'tmp', `${app}`, `${appName}`);
                if (!(yield fsExists(inputPath, app))) {
                    let inputPath = path.join(`/Application/${appName}`);
                    if (!(yield fsExists(inputPath, app)))
                        throw new Error('Path does not exist');
                }
            }
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
        const inputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.app`);
        const outputPath = path.join(__dirname, 'tmp', `${app}`, appName);
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
export function appVersion(app, appName) {
    return __awaiter(this, void 0, void 0, function* () {
        let inputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.app`, `Contents`, `Info.plist`);
        try {
            if (!(yield fsExists(inputPath, app))) {
                let inputPath = path.join(__dirname, 'tmp', `${app}`, `${appName}`, `Contents`, `Info.plist`);
                if (!(yield fsExists(inputPath, app))) {
                    let inputPath = path.join(`/Application/${appName}`, `Contents`, `Info.plist`);
                    if (!(yield fsExists(inputPath, app)))
                        throw new Error('Path does not exist');
                }
            }
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
export function dmgExtractFile(app, downloadFileType, appName, dmgFileType, dmgFileName) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.${downloadFileType}`);
        const mountPoint = path.join(__dirname, 'mnt', `${app}`);
        const outputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.${dmgFileType}`);
        const fileName = dmgFileName && dmgFileName.length > 0 ? dmgFileName : appName;
        try {
            yield exec(`sh ./src/dmgExtractFile.sh "${inputPath}" "${mountPoint}" "${outputPath}" "${fileName}"`);
            console.log(`${app}: dmgExtractFile successful`);
            return true;
        }
        catch (e) {
            console.error(`${app}: dmgExtractFile failed with error "${e.message}"`);
            throw e;
        }
    });
}
export function dmgInstallFile(app, downloadFileType, installCommand) {
    return __awaiter(this, void 0, void 0, function* () {
        const appTmpDir = path.join(__dirname, 'tmp', `${app}`);
        const inputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.${downloadFileType}`);
        const mountPoint = path.join(__dirname, 'mnt', `${app}`);
        const installCmd = `${mountPoint}/${installCommand.replaceAll('<APPDIR>', appTmpDir)}`;
        try {
            yield exec(`sh ./src/dmgInstallFile.sh "${inputPath}" "${mountPoint}" "${installCmd}"`);
            console.log(`${app}: dmgInstallFile successful`);
            return true;
        }
        catch (e) {
            console.error(`${app}: dmgInstallFile failed with error "${e.message}"`);
            throw e;
        }
    });
}
export function fileDelete(app, fileName, dir) {
    return __awaiter(this, void 0, void 0, function* () {
        if (dir == 'tmp')
            dir = `tmp/${app}`;
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
export function fileRename(app, oldName, newName) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputPath = path.join(__dirname, 'tmp', `${app}`, `${oldName}`);
        const outputPath = path.join(__dirname, 'tmp', `${app}`, `${newName}`);
        try {
            const output = yield exec(`sh ./src/appRename.sh "${inputPath}" "${outputPath}"`);
            console.log(`${app}: fileRename successful`);
            return true;
        }
        catch (e) {
            console.error(`${app}: fileRename failed with error "${e.message}"`);
            throw e;
        }
    });
}
export function fsExists(path, app) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs.access(path);
            return true;
        }
        catch (e) {
            app ? console.error(`${app}: fsExists failed with error "${e.message}"`) : console.error(`fsExists failed with error "${e.message}"`);
            return false;
        }
    });
}
export function pkgChecksum(app) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.pkg`);
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
        const inputPath = path.join(__dirname, 'tmp', `${app}`, appName);
        const outputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.pkg`);
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
        const inputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.pkg`);
        const outputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.app`);
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
        const inputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.pkg`);
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
export function pkgInstall(app) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.pkg`);
        try {
            yield exec(`/usr/sbin/installer -target "/" -pkg "${inputPath}"`);
            console.log(`${app}: pkgInstall successful`);
            return true;
        }
        catch (e) {
            console.error(`${app}: pkgInstall failed with error "${e.message}"`);
            throw e;
        }
    });
}
export function pkgSigned(app) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.pkg`);
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
export function quitSuspiciousPackage() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const output = yield exec(`sh ./src/quitSuspiciousPackage.sh`);
            return true;
        }
        catch (e) {
            console.error(`quitSuspiciousPackage failed with error "${e.message}"`);
            return false;
        }
    });
}
export function uploadPkg(app, version, uploadConfigs) {
    return __awaiter(this, void 0, void 0, function* () {
        let uploads = [];
        const inputPath = path.join(__dirname, 'pkgs', `${app}_${version}.pkg`);
        for (let uploadConfig of uploadConfigs) {
            if (uploadConfig.username && uploadConfig.password) {
                uploads.push(exec(`/usr/local/bin/duck --assumeyes --existing skip --username '${uploadConfig.username}' --password '${uploadConfig.password}' --upload '${uploadConfig.server}' '${inputPath}'`));
            }
            else if (uploadConfig.username) {
                uploads.push(exec(`/usr/local/bin/duck --assumeyes --existing skip --username '${uploadConfig.username}' --upload '${uploadConfig.server}' '${inputPath}'`));
            }
            else {
                uploads.push(exec(`/usr/local/bin/duck --assumeyes --existing skip --upload '${uploadConfig.server}' '${inputPath}'`));
            }
        }
        try {
            yield Promise.all(uploads);
            console.log(`${app}: uploadPkg successful`);
            return true;
        }
        catch (e) {
            console.error(`${app}: uploadPkg failed with error "${e.message}"`);
            return false;
        }
    });
}
export function zipExtractFile(app, appName, type) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.zip`);
        const extractPath = path.join(__dirname, 'tmp', `${app}`, `${app}`);
        const outputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.${type}`);
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
