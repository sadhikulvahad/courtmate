export interface IEmailService {
  sendVerificationEmail(email: string, token: string): Promise<void>;
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
  sendGenericNotification(email: string, title: string, message: string): Promise<void>;
  sendVideoCallReminder(
    email: string,
    recipientName: string,
    otherPartyName: string,
    meetingTime: string,
    roomUrl: string
  ): Promise<void>;
}