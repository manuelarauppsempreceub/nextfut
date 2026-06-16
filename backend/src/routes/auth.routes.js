import { Router } from "express";
import prisma from "../database/prisma.js";
import {
  hashPassword,
  normalizeEmail,
  publicUser,
  signUserToken,
  verifyPassword
} from "../services/auth.service.js";
import { requireAuth } from "../services/auth.middleware.js";

const router = Router();

function normalizeText(value) {
  return String(value || "").trim();
}

function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const number = Number(String(value).replace(",", "."));
  return Number.isFinite(number) ? Math.round(number) : fallback;
}

async function generateNextAccessCode() {
  const athletes = await prisma.athlete.findMany({
    where: {
      accessCode: {
        startsWith: "NF-"
      }
    },
    select: {
      accessCode: true
    }
  });

  const maxNumber = athletes.reduce((max, athlete) => {
    const number = Number(String(athlete.accessCode || "").replace("NF-", ""));

    if (!Number.isFinite(number)) {
      return max;
    }

    return Math.max(max, number);
  }, 0);

  return `NF-${String(maxNumber + 1).padStart(4, "0")}`;
}

router.post("/login", async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");

  if (!email || !password) {
    return res.status(400).json({
      message: "E-mail e senha são obrigatórios"
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (!user) {
    return res.status(401).json({
      message: "Credenciais inválidas"
    });
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);

  if (!passwordMatches) {
    return res.status(401).json({
      message: "Credenciais inválidas"
    });
  }

  if (user.status !== "ACTIVE") {
    return res.status(403).json({
      message: "Cadastro ainda não está ativo para acesso",
      status: user.status
    });
  }

  res.json({
    message: "Login realizado com sucesso",
    token: signUserToken(user),
    user: publicUser(user)
  });
});

router.get("/me", requireAuth, async (req, res) => {
  res.json({
    user: req.user
  });
});

router.post("/register/athlete", async (req, res) => {
  const name = normalizeText(req.body.name);
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");
  const consentDataVisibility = Boolean(req.body.consentDataVisibility);

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Nome, e-mail e senha são obrigatórios"
    });
  }

  if (!consentDataVisibility) {
    return res.status(400).json({
      message: "É necessário concordar com a visualização dos dados por administradores e olheiros"
    });
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (existingUser) {
    return res.status(409).json({
      message: "Já existe um usuário cadastrado com este e-mail"
    });
  }

  const accessCode = await generateNextAccessCode();

  const athlete = await prisma.athlete.create({
    data: {
      accessCode,
      name,
      age: toInt(req.body.age),
      position: normalizeText(req.body.position) || null,
      dominantFoot: normalizeText(req.body.dominantFoot) || null,
      heightCm: toInt(req.body.heightCm),
      country: normalizeText(req.body.country) || null,
      region: normalizeText(req.body.region) || null,
      schoolProject: normalizeText(req.body.schoolProject) || null,
      consentDataVisibility
    }
  });

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: "ATHLETE",
      status: "PENDING",
      athleteId: athlete.id
    }
  });

  res.status(201).json({
    message: "Cadastro de atleta enviado para aprovação",
    user: publicUser(user),
    athlete
  });
});

router.post("/register/scout", async (req, res) => {
  const name = normalizeText(req.body.name);
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Nome, e-mail e senha são obrigatórios"
    });
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (existingUser) {
    return res.status(409).json({
      message: "Já existe um usuário cadastrado com este e-mail"
    });
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: "SCOUT",
      status: "PENDING",
      scoutName: name,
      scoutEmail: email
    }
  });

  res.status(201).json({
    message: "Cadastro de olheiro enviado para aprovação",
    user: publicUser(user)
  });
});

export default router;