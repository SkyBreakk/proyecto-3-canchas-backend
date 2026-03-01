import nodemailer from "nodemailer";

export const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendVerificationEmail = async (
  email,
  username,
  verificationCode,
) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verifica tu email en nuestra aplicación",
    html: `
      <h2>${username} - Bienvenido a nuestro sitio!</h2>
      <p>Tu codigo de verificación es:</p>
      <h1 style="font-size: 32px; letter-spacing: 5px; color: #4CAF50; margin: 20px 0;">${verificationCode}</h1>
      <p>Este código expira en 15 minutos.</p>
      <p>Si no creaste una cuenta en nuestra app, ignora este email.</p>
        `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error al enviar el email:", error);
  }
};
