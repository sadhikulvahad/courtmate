import { createEmailConfig } from "../config/emailConfig";
import { NodemailerEmailService } from "./sendMail";

const emailConfig = createEmailConfig()
export const emailService = new NodemailerEmailService(emailConfig)


