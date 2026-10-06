const nodeMailer = require("nodemailer");
const config = require("../config/env");

const transporter = nodeMailer.createTransport({
  host: config.smtpHost,
  port: Number(config.smtpPort),
  secure: Number(config.smtpPort) === 465,
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `Online Clothing Store < ${config.smtpUser}>`,
    to,
    subject,
    html,
  });
};
module.exports = sendEmail;
