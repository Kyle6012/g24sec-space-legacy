import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const SMTP_USERNAME = process.env.BREVO_SMTP_USERNAME;
const SMTP_PASSWORD = process.env.BREVO_SMTP_PASSWORD;
const BASE_URL = process.env.BASE_URL;

if (!SMTP_USERNAME || !SMTP_PASSWORD) {
    throw new Error("The BREVO_SMTP_USERNAME or BREVO_SMTP_PASSWORD environment variables are not set.");
}

// Create a Nodemailer transporter object
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587, // or 465 for secure connection
    secure: false, // use true for 465
    auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD,
    },
});

const logoUrl = `${process.env.BASE_URL}/images/logo.jpg`;

// Function to send verification email
export const sendVerificationEmail = async (email, token) => {
    const mailOptions = {
        from: '"G24" <bahatikylemeshack@gmail.com>',
        to: email,
        subject: 'Please Verify Your Email Address',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <center>
                    <img src="${logoUrl}" alt="G24Sec Logo" style="width:150px; height:auto; border-radius:50%;" />
                </center>

                <h2>Welcome to G24Sec!</h2>
                <p>Thank you for signing up with us. To get started, please verify your email address by clicking the link below:</p>
                <p style="font-size: 18px;">
                    <a href="${BASE_URL}/auth/verify/${token}" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 15px; border-radius: 5px;">Verify Your Email</a>
                </p>
                <p>If you did not sign up for our service, please ignore this email.</p>
                <p>Best Regards,<br>The G24Sec Team</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

// Function to send password reset email
export const sendPasswordResetEmail = async (email, token) => {
    const mailOptions = {
        from: '"G24 <bahatikylemeshack@gmail.com>',
        to: email,
        subject: 'Reset Your Password',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <center>
                    <img src="${logoUrl}" alt="G24Sec Logo" style="width:150px; height:auto; border-radius:50%;" />
                </center>

                <h2>Password Reset Request</h2>
                <p>We received a request to reset your password. You can do so by clicking the link below:</p>
                <p style="font-size: 18px;">
                    <a href="${BASE_URL}/auth/reset-password/${token}" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 15px; border-radius: 5px;">Reset Your Password</a>
                </p>
                <p>If you did not request a password reset, please ignore this email.</p>
                <p>Best Regards,<br>The G24Sec Team</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

// Function to send cyber alerts emailss
export const sendCyberAlertEmail = async (email, cveAlerts, cyberNews) => {
    const cveContent = cveAlerts.map(cve => `<li>${cve.id}: ${cve.summary}</li>`).join("");
    const newsContent = cyberNews.map(news => `<li><a href="${news.url}">${news.title}</a></li>`).join("");

    const mailOptions = {
        from: '"G24" <bahatikylemeshack@gmail.com>',
        to: email,
        subject: 'Daily Cybersecurity Alerts',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <center>
                    <img src="${logoUrl}" alt="G24Sec Logo" style="width:150px; height:auto; border-radius:50%;" />
                </center>

                <h2>Daily Cybersecurity Alerts</h2>
                <p>Dear User,</p>
                <p>Here are the latest CVE updates and cybersecurity news:</p>
                <h3>Latest CVE updates:</h3>
                <ul>${cveContent}</ul>
                <h3>Cybersecurity News:</h3>
                <ul>${newsContent}</ul>
                <p>Stay safe and secure!</p>
                <p>Best Regards,<br>The G24Sec Team</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.response);
    } catch (error) {
        console.error("Error sending cyber alert email:", error);
    }
};

export const sendCustomEmail = async (recipients, subject, message) => {
    const mailOptions = {
        from: '"G24Sec - Admin" <bahatikylemeshack@gmail.com>',
        to: recipients.map(email => ({ email })),
        subject: subject,
        html: `<p>${message}</p>`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.response);
    } catch (error) {
        console.error("Error sending custom email:", error);
    }
};
