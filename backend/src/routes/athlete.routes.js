import { Router } from "express";
import prisma from "../database/prisma.js";
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

router.put("/athletes/:id", requireAuth, async (req, res) => {
  const athlete = await prisma.athlete.findUnique({
    where: {
      id: req.params.id
    }
  });

  if (!athlete) {
    return res.status(404).json({
      message: "Atleta nao encontrado"
    });
  }

  const canEdit =
    req.user.role === "ADMIN" ||
    (req.user.role === "ATHLETE" && req.user.athleteId === athlete.id);

  if (!canEdit) {
    return res.status(403).json({
      message: "Você não tem permissão para editar este atleta"
    });
  }  

  const name = normalizeText(req.body.name);
  const age = toInt(req.body.age);
  const position = normalizeText(req.body.position);
  const dominantFoot = normalizeText(req.body.dominantFoot);
  const heightCm = toInt(req.body.heightCm);
  const country = normalizeText(req.body.country);
  const region = normalizeText(req.body.region);
  const schoolProject = normalizeText(req.body.schoolProject);

  if (!name) {
    return res.status(400).json({
      message: "Nome do atleta e obrigatorio"
    });
  }

  const updatedAthlete = await prisma.athlete.update({
    where: {
      id: athlete.id
    },
    data: {
      name,
      age,
      position: position || null,
      dominantFoot: dominantFoot || null,
      heightCm,
      country: country || null,
      region: region || null,
      schoolProject: schoolProject || null
    },
    include: {
      evaluations: {
        orderBy: {
          evaluatedAt: "desc"
        },
        include: {
          evaluator: true,
          performanceResult: true
        }
      },
      scoutInterests: {
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });

  res.json({
    message: "Atleta atualizado com sucesso",
    athlete: updatedAthlete
  });
});

export default router;