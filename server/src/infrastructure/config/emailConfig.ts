export const createEmailConfig = () => {
  if (!process.env.NODEMAILER_EMAIL || !process.env.NODEMAILER_PASS) {
    throw new Error("Missing email credentials in environment variables");
  }

  return {
    service: 'gmail',
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASS
    },
    baseUrl: process.env.BASE_URL!,
    sender: `CourtMate <${process.env.NODEMAILER_EMAIL}>`
  };
};