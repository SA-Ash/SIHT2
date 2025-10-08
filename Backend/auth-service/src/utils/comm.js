import twilio from "twilio";

const smsClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Email sending is disabled in this build; fall back to console logging

export async function sendSms(to, body) {
  if (smsClient && process.env.TWILIO_FROM) {
    return smsClient.messages.create({ to, from: process.env.TWILIO_FROM, body });
  }
  // eslint-disable-next-line no-console
  console.log("[dev sms]", to, body);
}

export async function sendEmail(to, subject, html) {
  // eslint-disable-next-line no-console
  console.log("[dev email]", to, subject);
}


