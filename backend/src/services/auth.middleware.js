import prisma from "../database/prisma.js";
import { publicUser, verifyUserToken } from "./auth.service.js";

export async function requireAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization || "";
    const [, token] = authorization.split(" ");

    if (!token) {
      return res.status(401).json({
        message: "Token de autenticação não informado"
      });
    }

    const payload = verifyUserToken(token);

    const user = await prisma.user.findUnique({
      where: {
        id: payload.sub
      }
    });

    if (!user) {
      return res.status(401).json({
        message: "Usuário não encontrado"
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        message: "Usuário ainda não está ativo"
      });
    }

    req.user = publicUser(user);
    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido ou expirado"
    });
  }
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Acesso não permitido para este perfil"
      });
    }

    return next();
  };
}