import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email: string, token: string) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your Email',
        text: `Please verify your email by clicking the following link: ${process.env.BASE_URL}/verify-email?token=${token}`,
    };

    await transporter.sendMail(mailOptions);
};
