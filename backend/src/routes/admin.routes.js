import { Router } from "express";
import prisma from "../database/prisma.js";
import { requireAuth, requireRoles } from "../services/auth.middleware.js";
import { publicUser } from "../services/auth.service.js";

const router = Router();

router.use(requireAuth);
router.use(requireRoles("ADMIN"));

router.get("/users", async (req, res) => {
  const status = String(req.query.status || "").trim().toUpperCase();
  const role = String(req.query.role || "").trim().toUpperCase();

  const where = {};

  if (status) {
    where.status = status;
  }

  if (role) {
    where.role = role;
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: {
      createdAt: "desc"
    },
    include: {
      athlete: true
    }
  });

  res.json(users.map((user) => ({
    ...publicUser(user),
    athlete: user.athlete || null
  })));
});


router.get("/scouts", async (req, res) => {
  const status = String(req.query.status || "").trim().toUpperCase();
  const search = String(req.query.search || "").trim().toLowerCase();

  const where = {
    role: "SCOUT"
  };

  if (status) {
    where.status = status;
  }

  const scoutUsers = await prisma.user.findMany({
    where,
    orderBy: {
      createdAt: "desc"
    }
  });

  const filteredScouts = search
    ? scoutUsers.filter((user) => {
        const haystack = [
          user.name,
          user.email,
          user.scoutName,
          user.scoutEmail
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(search);
      })
    : scoutUsers;

  const scouts = await Promise.all(
    filteredScouts.map(async (user) => {
      const interestWhere = {
        OR: [
          {
            scoutEmail: user.scoutEmail || user.email
          },
          {
            scoutName: user.scoutName || user.name
          }
        ]
      };

      const [interestsCount, latestInterest] = await Promise.all([
        prisma.scoutInterest.count({
          where: interestWhere
        }),
        prisma.scoutInterest.findFirst({
          where: interestWhere,
          orderBy: {
            createdAt: "desc"
          },
          include: {
            athlete: true
          }
        })
      ]);

      return {
        ...publicUser(user),
        interestsCount,
        latestInterest
      };
    })
  );

  res.json(scouts);
});


router.patch("/users/:id/status", async (req, res) => {
  const allowedStatuses = ["PENDING", "ACTIVE", "INACTIVE", "REJECTED"];
  const status = String(req.body.status || "").trim().toUpperCase();

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Status inválido",
      allowedStatuses
    });
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      id: req.params.id
    }
  });

  if (!existingUser) {
    return res.status(404).json({
      message: "Usuário não encontrado"
    });
  }

  if (existingUser.role === "ADMIN" && status !== "ACTIVE") {
    const activeAdmins = await prisma.user.count({
      where: {
        role: "ADMIN",
        status: "ACTIVE"
      }
    });

    if (activeAdmins <= 1) {
      return res.status(400).json({
        message: "Não é permitido desativar/rejeitar o último administrador ativo"
      });
    }
  }

  const user = await prisma.user.update({
    where: {
      id: existingUser.id
    },
    data: {
      status
    },
    include: {
      athlete: true
    }
  });

  res.json({
    message: "Status do usuário atualizado com sucesso",
    user: {
      ...publicUser(user),
      athlete: user.athlete || null
    }
  });
});

router.post("/reset-athletes", async (req, res) => {
  const confirmation = String(req.body.confirmation || "").trim();

  if (confirmation !== "ZERAR ATLETAS") {
    return res.status(400).json({
      message: "Confirmação inválida. Digite exatamente: ZERAR ATLETAS"
    });
  }

  const [
    scoutInterestsDeleted,
    performanceResultsDeleted,
    evaluationsDeleted,
    athleteUsersDeleted,
    athletesDeleted
  ] = await prisma.$transaction([
    prisma.scoutInterest.deleteMany({}),
    prisma.performanceResult.deleteMany({}),
    prisma.evaluation.deleteMany({}),
    prisma.user.deleteMany({
      where: {
        role: "ATHLETE"
      }
    }),
    prisma.athlete.deleteMany({})
  ]);

  res.json({
    message: "Base de atletas zerada com sucesso",
    deleted: {
      scoutInterests: scoutInterestsDeleted.count,
      performanceResults: performanceResultsDeleted.count,
      evaluations: evaluationsDeleted.count,
      athleteUsers: athleteUsersDeleted.count,
      athletes: athletesDeleted.count
    }
  });
});

export default router;