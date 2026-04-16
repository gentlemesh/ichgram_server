import nodemailer from 'nodemailer';
import { config as loadEnv } from 'dotenv';
import { JSDOM } from 'jsdom';

loadEnv();

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'localhost',
    port: +process.env.MAIL_PORT || 1025,
    secure: process.env.MAIL_IS_SECURE === 'true' || process.env.MAIL_IS_SECURE === '1',
    auth: {
        user: process.env.MAIL_APP_LOGIN,
        pass: process.env.MAIL_APP_PASS,
    },
});

const getPlainText = html => JSDOM.fragment(`<div>${html}</div>`).firstChild.textContent;

const mail = async (to, subject, message, isHtml = false, from = process.env.EMAIL_FROM) => {
    const options = { from, to, subject };
    if (isHtml) {
        options.html = message;
        options.text = getPlainText(message);
    } else {
        options.text = message;
    }

    try {
        await transporter.sendMail(options);
        return true;
    } catch (err) {
        console.error('Error while sending a email: ', err.stack);
        return false;
    }
}

export default mail;