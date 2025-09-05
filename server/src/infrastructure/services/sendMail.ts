// infrastructure/services/EmailService.ts
import nodemailer from "nodemailer";
import { IEmailService } from "../../domain/interfaces/EmailService";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { Logger } from "winston";


type EmailConfig = {
  service: string;
  auth: {
    user: string;
    pass: string;
  };
  sender: string;
  baseUrl: string;
};


@injectable()
export class NodemailerEmailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    @inject(TYPES.EmailConfig) private config: EmailConfig,
    @inject(TYPES.Logger) private logger: Logger
  ) {
    this.transporter = nodemailer.createTransport({
      service: config.service,
      auth: config.auth
    })

    this.verifyConnection()
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.info('"✅ Email server connection verified"')
      console.log("✅ Email server connection verified");
    } catch (error) {
      this.logger.error('❌ Email server connection failed:', { error })
      console.error("❌ Email server connection failed:", error);
      throw new Error("EMAIL_SERVER_CONNECTION_FAILED");
    }
  }

  private async sendEmail(options: {
    email: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"CourtMate" <${this.config.auth.user}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
        text: options.html.replace(/<[^>]*>/g, '')
      });
    } catch (error) {
      this.logger.error('Email sending failed:', { error })
      console.error("Email sending failed:", error);
      throw new Error("EMAIL_SENDING_FAILED");
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.REDIRECT_URL}/verify-email?token=${token}`;
    const html = this.createVerificationTemplate(verificationUrl);
    return this.sendEmail({
      email,
      subject: "Verify Your CourtMate Account",
      html
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.BASE_URL}/auth/verify-forgotPassword?token=${token}`;

    const html = this.createPasswordResetTemplate(resetUrl);
    return this.sendEmail({
      email,
      subject: "Password Reset Request - CourtMate",
      html
    });
  }

  async sendGenericNotification(email: string, title: string, message: string): Promise<void> {
    const html = this.createGenericTemplate(title, message);
    return this.sendEmail({
      email,
      subject: title,
      html
    });
  }

  async sendVideoCallReminder(
    email: string,
    recipientName: string,
    otherPartyName: string,
    meetingTime: string,
    roomUrl: string
  ): Promise<void> {
    const html = this.createVideoCallReminderTemplate(recipientName, otherPartyName, meetingTime, roomUrl);
    return this.sendEmail({
      email,
      subject: 'Upcoming Video Call Reminder - CourtMate',
      html,
    });
  }

  private createVerificationTemplate(verificationUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #2d3748;">Welcome to CourtMate! 👋</h2>
        <p>Please verify your email address to activate your account:</p>
        <a href="${verificationUrl}" 
           style="display: inline-block; padding: 12px 24px; 
                  background-color: #4299e1; color: white; 
                  text-decoration: none; border-radius: 4px;
                  font-weight: 500;">
           Verify Email
        </a>
        <p style="margin-top: 20px; color: #718096;">
          This will expires in 1 minutes.<br>
        </p>
      </div>
    `;
  }

  private createPasswordResetTemplate(resetUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #2d3748;">Password Reset Request</h2>
        <p>Click the button below to reset your CourtMate password:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 12px 24px; 
                  background-color: #48bb78; color: white; 
                  text-decoration: none; border-radius: 4px;
                  font-weight: 500;">
           Reset Password
        </a>
        <p style="margin-top: 20px; color: #718096;">
          This link expires in 1 minute.<br>
          Didn't request this? Please contact our support team immediately.
        </p>
      </div>
    `;
  }

  private createGenericTemplate(title: string, message: string): string {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #2d3748;">${title}</h2>
        <div style="padding: 20px; background-color: #f7fafc; 
                    border-radius: 4px; margin: 20px 0;">
          ${message}
        </div>
        <p style="color: #718096;">
          Best regards,<br>
          The CourtMate Team
        </p>
      </div>
    `;
  }

  private createVideoCallReminderTemplate(
    recipientName: string,
    otherPartyName: string,
    meetingTime: string,
    roomUrl: string
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #2d3748;">Upcoming Video Call Reminder</h2>
        <p>Dear ${recipientName},</p>
        <p>Your video call with ${otherPartyName} is scheduled at ${meetingTime}.</p>
        <a href="${roomUrl}" 
           style="display: inline-block; padding: 12px 24px; 
                  background-color: #4299e1; color: white; 
                  text-decoration: none; border-radius: 4px;
                  font-weight: 500;">
           Join Video Call
        </a>
        <p style="margin-top: 20px; color: #718096;">
          Please join the call a few minutes early to ensure a smooth connection.<br>
          Best regards,<br>
          The CourtMate Team
        </p>
      </div>
    `;
  }
}
