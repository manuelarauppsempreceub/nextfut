import { Router } from "express";
import prisma from "../database/prisma.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "nextfut-backend",
    timestamp: new Date().toISOString()
  });
});

router.get("/db-health", async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT now() as current_time`;

    res.json({
      status: "ok",
      service: "nextfut-database",
      database: "postgresql",
      currentTime: result[0].current_time
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      service: "nextfut-database",
      message: "Falha ao conectar ao banco de dados",
      error: error.message
    });
  }
});

export default router;
