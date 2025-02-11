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
import process from 'process';
import { promisify } from 'util';
import yaml from 'js-yaml';
import { sendMail } from './mailer.js';
import { updateHandlerDmgApp } from './updateHandlerDmgApp.js';
import { updateHandlerDmgPkg } from './updateHandlerDmgPkg.js';
import { updateHandlerPkg } from './updateHandlerPkg.js';
import { updateHandlerScrape } from './updateHandlerScrape.js';
import { updateHandlerZipApp } from './updateHandlerZipApp.js';
import { updateHandlerZipPkg } from './updateHandlerZipPkg.js';
import { updateHandlerNestedDmg } from './updateHandlerNestedDmg.js';
import { updateHandlerNestedZip } from './updateHandlerNestedZip.js';
import { fsExists, quitSuspiciousPackage, uploadPkg } from './utils.js';
export const __dirname = process.cwd();
const fsMkdir = promisify(fs.mkdir);
const fsRm = promisify(fs.rm);
function importYaml(fileName) {
    try {
        return yaml.load(fs.readFileSync(`${fileName}.yaml`, 'utf8'));
    }
    catch (e) {
        console.log(e);
    }
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let config = importYaml('config');
        let configApps = importYaml('config-apps');
        const configTenants = importYaml('config-tenants');
        try {
            if (!(yield fsExists('mnt')))
                yield fsMkdir('mnt');
            if (!(yield fsExists('pkgs')))
                yield fsMkdir('pkgs');
            if (!(yield fsExists('tmp')))
                yield fsMkdir('tmp');
        }
        catch (e) {
            console.error(e.message);
        }
        let appUpdates = [];
        const apps = Object.keys(configApps);
        const updates = [];
        for (let app of apps) {
            try {
                if (yield fsExists(`tmp/${app}`, app))
                    yield fsRm(`tmp/${app}`, { recursive: true, force: true });
                yield fsMkdir(`tmp/${app}`);
            }
            catch (e) {
                console.log(`${app}: removal/creation of tmp-dir failed (${e.message})`);
            }
            switch (configApps[app].downloadType) {
                case 'direct':
                    switch (configApps[app].downloadFileType) {
                        case 'dmg':
                            if (!configApps[app].dmgFileType) {
                                console.error(`${app}: missing "dmgFileType" in confg`);
                                break;
                            }
                            if (configApps[app].dmgFileType == 'app') {
                                appUpdates.push(updateHandlerDmgApp(app, configApps[app], updates));
                            }
                            else if (configApps[app].dmgFileType == 'pkg') {
                                appUpdates.push(updateHandlerDmgPkg(app, configApps[app], updates));
                            }
                            else {
                                console.error(`${app}: no updateHandler for "${configApps[app].downloadType}_${configApps[app].downloadFileType}_${configApps[app].dmgFileType}"`);
                                console.error(`${app}: verify your config and/or contact developer`);
                            }
                            break;
                        case 'pkg':
                            appUpdates.push(updateHandlerPkg(app, configApps[app], updates));
                            break;
                        case 'zip':
                            if (!configApps[app].zipFileType) {
                                console.error(`${app}: missing "zipFileType" in confg`);
                                break;
                            }
                            if (configApps[app].zipFileType == 'app') {
                                appUpdates.push(updateHandlerZipApp(app, configApps[app], updates));
                            }
                            else if (configApps[app].zipFileType == 'pkg') {
                                appUpdates.push(updateHandlerZipPkg(app, configApps[app], updates));
                            }
                            else {
                                console.error(`${app}: no updateHandler for "${configApps[app].downloadType}_${configApps[app].downloadFileType}_${configApps[app].zipFileType}"`);
                                console.error(`${app}: verify your config and/or contact developer`);
                            }
                            break;
                        case 'nested-dmg':
                            if (!configApps[app].nestedDmgFileType) {
                                console.error(`${app}: missing "nestedDmgFileType" in confg`);
                                break;
                            }
                            if (configApps[app].nestedDmgFileType == 'dmg') {
                                appUpdates.push(updateHandlerNestedDmg(app, configApps[app], updates));
                            }
                            else {
                                console.error(`${app}: no updateHandler for "${configApps[app].downloadType}_${configApps[app].downloadFileType}_${configApps[app].nestedDmgFileType}"`);
                                console.error(`${app}: verify your config and/or contact developer`);
                            }
                            break;
                        case 'nested-zip':
                            if (!configApps[app].nestedZipFileType) {
                                console.error(`${app}: missing "nestedZipFileType" in confg`);
                                break;
                            }
                            if (configApps[app].nestedZipFileType == 'dmg' || configApps[app].nestedZipFileType == 'pkg') {
                                appUpdates.push(updateHandlerNestedZip(app, configApps[app], updates));
                            }
                            else {
                                console.error(`${app}: no updateHandler for "${configApps[app].downloadType}_${configApps[app].downloadFileType}_${configApps[app].nestedZipFileType}"`);
                                console.error(`${app}: verify your config and/or contact developer`);
                            }
                            break;
                        default:
                            console.error(`${app}: no updateHandler for "${configApps[app].downloadType}_${configApps[app].downloadFileType}"`);
                            console.error(`${app}: verify your config and/or contact developer`);
                            break;
                    }
                    break;
                case 'github':
                    switch (configApps[app].downloadFileType) {
                        case 'dmg':
                            if (configApps[app].dmgFileType) {
                                if (configApps[app].dmgFileType == 'app') {
                                }
                                else if (configApps[app].dmgFileType == 'pkg') {
                                }
                                else {
                                    console.error(`${app}: no updateHandler for "${configApps[app].downloadType}_${configApps[app].downloadFileType}_${configApps[app].downloadFileType}"`);
                                    console.error(`${app}: verify your config and/or contact developer`);
                                    continue;
                                }
                            }
                            else {
                                console.error(`${app}: missing "dmgFileType" in confg`);
                                continue;
                            }
                            break;
                        case 'pkg':
                            break;
                        default:
                            console.error(`${app}: no updateHandler for "${configApps[app].downloadType}_${configApps[app].downloadFileType}"`);
                            console.error(`${app}: verify your config and/or contact developer`);
                            break;
                    }
                    break;
                case 'scrape':
                    appUpdates.push(updateHandlerScrape(app, configApps[app], updates));
                    break;
                default:
                    console.error(`${app}: no updateHandler for "${configApps[app].downloadType}"`);
                    console.error(`${app}: verify your config and/or contact developer`);
                    break;
            }
        }
        yield Promise.all(appUpdates);
        updates.sort();
        const tenants = Object.keys(configTenants);
        let tenantUpdates = {};
        for (let tenant of tenants) {
            for (let update of updates) {
                if (configTenants[tenant].indexOf(update) > -1) {
                    if (!tenantUpdates[tenant])
                        tenantUpdates[tenant] = {};
                    tenantUpdates[tenant][update] = {
                        appBundleIdentifier: configApps[update].appBundleIdentifier,
                        appCodeRequirement: configApps[update].appCodeRequirement,
                        appName: configApps[update].appName,
                        appVersion: configApps[update].appVersion,
                        cdn: config.cdn.map(server => encodeURI(`${server}${update}_${configApps[update].appVersion}.pkg`)),
                        pkgChecksum: configApps[update].pkgChecksum,
                        pkgSigned: configApps[update].pkgSigned
                    };
                    if (configApps[update].additionalInfo) {
                        tenantUpdates[tenant][update].additionalInfo = {};
                        if (configApps[update].additionalInfo.preInstall)
                            tenantUpdates[tenant][update].additionalInfo.preInstall = configApps[update].additionalInfo.preInstall;
                        if (configApps[update].additionalInfo.postInstall)
                            tenantUpdates[tenant][update].additionalInfo.postInstall = configApps[update].additionalInfo.postInstall;
                    }
                }
            }
        }
        fs.writeFileSync(path.join(__dirname, 'updates.yaml'), yaml.dump(tenantUpdates, { quotingType: "'", forceQuotes: true, sortKeys: true }));
        fs.writeFileSync(path.join(__dirname, 'config-apps.yaml'), yaml.dump(configApps, { quotingType: "'", forceQuotes: true, sortKeys: true }));
        console.log('updated "config-apps.yaml"');
        console.log('updates published to "updates.yaml"');
        quitSuspiciousPackage();
        if (config.uploads) {
            for (let update of updates) {
                yield uploadPkg(update, configApps[update].appVersion, config.uploads);
            }
        }
        if (config.mail) {
            if (updates.length > 0) {
                yield sendMail('MDM-PKG-CREATOR: new updates!', `MDM-PKG-CREATOR uploaded the following new PKGs:\r\n\r\n${updates.toString()}\r\n\r\nFor tenant updates and log refer to attachment.`, config.mail, [{ path: path.join(__dirname, 'updates.yaml') }, { path: path.join(__dirname, 'mdm-pkg-creator.log') }]);
            }
            else {
                yield sendMail('MDM-PKG-CREATOR: no updates!', `MDM-PKG-CREATOR did not detect any updates.\r\n\r\nLog attached.`, config.mail, [{ path: path.join(__dirname, 'mdm-pkg-creator.log') }]);
            }
        }
    });
}
main();
