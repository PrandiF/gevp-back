import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // app password
  },
});

export const sendMail = async ({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) => {
  await transporter.sendMail({
    from: `"GEVP Calendario" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });
};
