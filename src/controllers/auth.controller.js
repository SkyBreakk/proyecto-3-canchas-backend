import { enviarCorreoDeVerificacion } from "../config/nodemailer.js";
import User from "../models/User.js";
import { generarToken } from "../utils/jwt.js";
import admin from "../config/firebase.js";

const registro = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const usuario = new User({
      username,
      email,
      password,
    });

    const codigoDeVerificacion = usuario.generarCodigoDeVerificacion();
    await usuario.save();
    try {
      await enviarCorreoDeVerificacion(email, username, codigoDeVerificacion);
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "Usuario creado, pero hubo un error al enviar el correo",
      });
    }

    return res.status(201).json({
      ok: true,
      message: "Usuario creado correctamente",
      data: {
        username: usuario.username,
        email: usuario.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error al connectarse con el servidor",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await User.findOne({ email }).select("+password");
    if (!usuario || !usuario.comparePassword(password)) {
      return res
        .status(401)
        .json({ ok: false, message: "Credenciales incorrectas" });
    }
    if (!usuario.state) {
      return res.status(403).json({
        ok: false,
        message: "Tu cuenta está desactivada. Contacta a soporte",
      });
    }
    if (!usuario.emailVerified) {
      return res.status(403).json({
        ok: false,
        message: "Escriba su código de verificación para proseguir",
        requiereVerificacion: true,
      });
    }

    const token = generarToken(usuario._id);
    const cookieConfig = {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: process.env.COOKIE_SAME_SITE || "lax",
      maxAge: parseInt(process.env.COOKIE_MAX_AGE) || 3600000,
    };
    res.cookie("token", token, cookieConfig);

    return res.status(200).json({
      ok: true,
      message: "Login exitoso!",
      data: {
        username: usuario.username,
        email: usuario.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error al connectarse con el servidor",
    });
  }
};

const verificarEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }
    if (!usuario.state) {
      return res.status(403).json({
        ok: false,
        message: "Esta cuenta está desactivada",
      });
    }
    if (usuario.emailVerified) {
      return res.status(400).json({
        ok: false,
        message: "El usuario ya está verificado",
      });
    }
    if (usuario.verificationCode !== code) {
      return res.status(400).json({
        ok: false,
        message: "Código de verificación incorrecto",
      });
    }
    if (usuario.verificationCodeExpires < Date.now()) {
      return res.status(400).json({
        ok: false,
        message: "El código de verificación ha expirado",
      });
    }

    usuario.emailVerified = true;
    usuario.verificationCode = undefined;
    usuario.verificationCodeExpires = undefined;
    await usuario.save();

    const token = generarToken(usuario._id);
    const cookieConfig = {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: process.env.COOKIE_SAME_SITE || "lax",
      maxAge: parseInt(process.env.COOKIE_MAX_AGE) || 3600000,
    };
    res.cookie("token", token, cookieConfig);

    return res.status(200).json({
      ok: true,
      message: "Cuenta verificada correctamente!",
      data: {
        username: usuario.username,
        email: usuario.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error al connectarse con el servidor",
    });
  }
};

const reenviarCodigoDeVerificacion = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        ok: false,
        message: "El email es requerido",
      });
    }
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }
    if (!usuario.state) {
      return res.status(403).json({
        ok: false,
        message: "Esta cuenta está desactivada",
      });
    }
    if (usuario.emailVerified) {
      return res.status(400).json({
        ok: false,
        message: "El usuario ya está verificado",
      });
    }

    const codigoDeVerificacion = usuario.generarCodigoDeVerificacion();
    await usuario.save();
    try {
      await enviarCorreoDeVerificacion(
        email,
        usuario.username,
        codigoDeVerificacion,
      );
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "Error al connectarse con el servidor",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Código de verificación reenviado correctamente",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error al connectarse con el servidor",
    });
  }
};

const obtenerPerfil = async (req, res) => {
  try {
    res.json({
      ok: true,
      data: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        emailVerified: req.user.emailVerified,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error al connectarse con el servidor",
    });
  }
};

const loginConGoogle = async (req, res) => {
  try {
    const { token } = req.body;
    let tokenDecodificado;
    try {
      tokenDecodificado = await admin.auth().verifyIdToken(token);
    } catch (error) {
      return res.status(401).json({
        ok: false,
        message: "Error al connectarse con el servidor",
      });
    }
    const email = tokenDecodificado.email;

    let usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no registrado",
      });
    }
    if (!usuario.state) {
      return res.status(403).json({
        ok: false,
        message: "Tu cuenta está desactivada. Contacta a soporte",
      });
    }

    const tokenUsuario = generarToken(usuario._id);
    res.cookie("token", tokenUsuario, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: process.env.COOKIE_SAME_SITE || "lax",
      maxAge: parseInt(process.env.COOKIE_MAX_AGE) || 3600000,
    });

    return res.status(200).json({
      ok: true,
      message: "Login con Google exitoso",
      data: { username: usuario.username, email: usuario.email },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error en el servidor",
    });
  }
};

const obtenerUsuarios = async (req, res) => {
  try {
    const { limite = 5, desde = 0 } = req.query;
    const filtro = { state: true };

    const [total, users] = await Promise.all([
      User.countDocuments(filtro),
      User.find(filtro)
        .select("-password")
        .skip(Number(desde))
        .limit(Number(limite)),
    ]);

    res.status(200).json({
      ok: true,
      total,
      users,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al traer los usuarios",
    });
  }
};

const desactivarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await User.findByIdAndUpdate(
      id,
      { state: false },
      { new: true },
    );
    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    res.json({
      ok: true,
      message: "Usuario desactivado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error en el borrado de usuario",
    });
  }
};

const actualizarPerfil = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const usuario = await User.findById(req.user._id);
    if (!usuario) {
      return res
        .status(404)
        .json({ ok: false, message: "Usuario no encontrado" });
    }

    if (username) usuario.username = username;
    if (email) usuario.email = email;
    if (password && password.length > 0) {
      usuario.password = password;
    }
    await usuario.save();

    return res.status(200).json({
      ok: true,
      message: "Perfil actualizado correctamente",
      data: {
        username: usuario.username,
        email: usuario.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error al connectarse con el servidor",
    });
  }
};

const otorgarRolAdmin = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        ok: false,
        message: "El email es requerido",
      });
    }

    const usuario = await User.findOne({ email }).select("-password");
    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "El usuario no se encuentra en la base de datos",
      });
    }

    if (usuario.role === "admin") {
      return res.status(400).json({
        ok: false,
        message: "El usuario ya cuenta con el rol de admin",
      });
    }

    usuario.role = "admin";
    await usuario.save();

    res.status(200).json({
      ok: true,
      message: `El usuario con el email: ${email} pasa a ser Admin`,
      data: { username: usuario.username, role: usuario.role },
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al connectarse con el servidor",
    });
  }
};

const removerRolAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await User.findByIdAndUpdate(
      id,
      { role: "user" },
      { new: true },
    ).select("-password");

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: `El usuario con el id: ${id} no existe en la base de datos`,
      });
    }

    res.status(200).json({
      ok: true,
      message: `El usuario ${usuario.email} ya no es Admin`,
      data: usuario,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al connectarse con el servidor",
    });
  }
};

export {
  registro,
  login,
  verificarEmail,
  reenviarCodigoDeVerificacion,
  obtenerPerfil,
  obtenerUsuarios,
  desactivarUsuario,
  actualizarPerfil,
  loginConGoogle,
  otorgarRolAdmin,
  removerRolAdmin,
};
