import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
    private transporter;
    constructor(private readonly _configService: ConfigService){
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this._configService.get('GMAIL_USER'),
                pass: this._configService.get('GMAIL_APP_PASSWORD'),
            },
        });
    }
    async sendVerificationEmail(email: string, token: string) : Promise<void> {
        const verifyUrl = `${this._configService.get('FRONTEND_URL')}/auth/verify?token=${token}`;
        await this.transporter.sendMail({
            from: this._configService.get('GMAIL_USER'),
            to: email,
            subject: 'Verify your email',
            html: `<p>Click <a href="${verifyUrl}"> here </a> to verify your account</p>`,
        })
    }
    async sendForgotPasswordMail(email: string, token: string) : Promise<void> {
        const resetPasswordUrl = `${this._configService.get('FRONTEND_URL')}/auth/validPasswordToken?token=${token}&email=${email}`;
        await this.transporter.sendMail({
            from: this._configService.get('GMAIL_USER'),
            to: email,
            subject: 'Reset your password',
            html: `<p>Click <a href="${resetPasswordUrl}"> here </a> to reset your password</p>`,
        })
    }
}
