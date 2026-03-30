import { sendVerificationEmail } from "../config/nodemailer.js";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import admin from "../config/firebase.js";

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = new User({
      username,
      email,
      password,
    });

    const verificationCode = user.generateVerificationCode();
    await user.save();

    try {
      await sendVerificationEmail(email, username, verificationCode);
    } catch (error) {
      console.error("Error al enviar el email", error);
    }

    return res.status(201).json({
      ok: true,
      message: "Usuario creado correctamente",
      data: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "Credenciales incorrectas",
      });
    }

    const isPasswordValid = user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(403).json({
        ok: false,
        message: "Credenciales incorrectas",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        ok: false,
        message: "El email no está verificado",
      });
    }

    const token = generateToken(user._id);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: process.env.COOKIE_SAME_SITE || "lax",
      maxAge: parseInt(process.env.COOKIE_MAX_AGE) || 3600000,
    };

    res.cookie("token", token, cookieOptions);
    return res.status(200).json({
      ok: true,
      message: "Login exitos!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        ok: false,
        message: "El usuario ya está verificado",
      });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({
        ok: false,
        message: "Código de verificación incorrecto",
      });
    }

    if (user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({
        ok: false,
        message: "El código de verificación ha expirado",
      });
    }

    user.emailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    return res.status(200).json({
      ok: true,
      message: "Email verificado correctamente",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
};

const getProfile = async (req, res) => {
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
    console.log(error);
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
};

const loginWithGoogle = async (req, res) => {
  try {
    const { token } = req.body;

    let decodedToken;

    try {
      decodedToken = await admin.auth().verifyIdToken(token);
      console.log("DECODED TOKEN:", decodedToken);
    } catch (error) {
      console.error("ERROR VERIFY TOKEN:", error);
      return res.status(401).json({
        ok: false,
        message: error.message,
      });
    }

    const email = decodedToken.email;

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no registrado",
      });
    }

    const jwt = generateToken(user._id);

    res.cookie("token", jwt, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      ok: true,
      message: "Login con Google exitoso",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: "Error en el servidor",
    });
  }
};

const getUsersPaginado = async (req, res) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { state: true };

  const [total, users] = await Promise.all([
    User.countDocuments(query),
    User.find(query).skip(Number(desde)).limit(Number(limite)),
  ]);

  res.status(200).json({
    total,
    users,
  });
};

const deleteUser = async (req, res) => {
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
      usuario,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      message: "Error en el borrado de usuario",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ ok: false, message: "Usuario no encontrado" });
    }

    if (username) user.username = username;
    if (email) user.email = email;

    if (password && password.length > 0) {
      user.password = password;
    }

    await user.save();

    return res.status(200).json({
      ok: true,
      message: "Perfil actualizado correctamente",
      data: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
};

const addAdmin = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        ok: false,
        message: "El email es requerido",
      });
    }

    const usuarioBD = await User.findOne({ email }).select("-password");
    if (!usuarioBD) {
      return res.status(404).json({
        ok: false,
        message: "El usuario no se encuentra en la base de datos",
      });
    }

    if (usuarioBD.role === "admin") {
      return res.status(400).json({
        ok: false,
        message: "El usuario ya cuenta con el rol de admin",
      });
    }

    usuarioBD.role = "admin";
    await usuarioBD.save();

    res.status(200).json({
      ok: true,
      message: `El usuario con el email: ${email} pasa a ser Admin`,
      data: usuarioBD,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
};

const delAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const usuarioBD = await User.findByIdAndUpdate(
      id,
      { role: "user" },
      { new: true },
    ).select("-password");

    if (!usuarioBD) {
      return res.status(404).json({
        ok: false,
        message: `El usuario con el id: ${id} no existe en la base de datos`,
      });
    }

    res.status(200).json({
      ok: true,
      message: `El usuario ${usuarioBD.email} ya no es Admin`,
      data: usuarioBD,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const addSuperAdmin = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        ok: false,
        message: "El email del usuario es requerido",
      });
    }

    const usuarioBD = await User.findOne({ email }).select("-password");
    if (!usuarioBD) {
      return res.status(404).json({
        ok: false,
        message: `El usuario con el email: ${email} no se encuentra en la base de datos`,
      });
    }

    usuarioBD.role = "superadmin";
    await usuarioBD.save();

    res.status(200).json({
      ok: true,
      message: `El usuario con email: ${email} pasa a ser Superadmin`,
      data: usuarioBD,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const delSuperAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const usuarioBD = await User.findByIdAndUpdate(
      id,
      { role: "admin" },
      { new: true },
    ).select("-password");

    if (!usuarioBD) {
      return res.status(404).json({
        ok: false,
        message: `El usuario (${id}) no existe en la base de datos`,
      });
    }

    res.status(200).json({
      ok: true,
      message: `El usuario con el email: ${usuarioBD.email} ya no es Superadmin`,
      data: usuarioBD,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

export {
  register,
  login,
  verifyEmail,
  getProfile,
  getUsersPaginado,
  deleteUser,
  updateProfile,
  loginWithGoogle,
  addAdmin,
  delAdmin,
  addSuperAdmin,
  delSuperAdmin,
};
