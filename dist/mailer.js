var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const nodemailer = require('nodemailer');
export function sendMail(subject, msg, settings, attachments) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let transporter = nodemailer.createTransport({
                host: settings.server,
                port: settings.port,
                secure: settings.port === 465 ? true : false,
                auth: {
                    user: settings.username,
                    pass: settings.password
                }
            });
            let info = yield transporter.sendMail({
                from: settings.from,
                to: settings.to,
                subject: subject,
                text: msg,
                attachments: attachments ? attachments : {}
            });
            console.log(`updates: mail notification sent`);
            return true;
        }
        catch (e) {
            console.error(`updates: mail notification failed with error "${e.message}"`);
            return false;
        }
    });
}
