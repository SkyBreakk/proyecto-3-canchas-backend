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

export const sendContactEmail = async (nombre, contacto, descripcion) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_USER,
    subject: `⚽ Nueva Consulta de Reserva: ${nombre}`,
    html: `
      <div style="font-family: sans-serif; color: #333;">
        <h2 style="color: #1e7e34;">Nueva solicitud de contacto</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email de contacto:</strong> ${contacto}</p>
        <hr />
        <p><strong>Mensaje/Descripción:</strong></p>
        <p style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">${descripcion}</p>
        <hr />
        <p style="font-size: 12px; color: #888;">Este mensaje fue enviado desde el formulario de contacto de Zona5.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};
