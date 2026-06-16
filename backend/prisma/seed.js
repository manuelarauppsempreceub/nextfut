import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({
  adapter
});

async function main() {

  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);

  await prisma.user.upsert({
    where: {
      email: "admin@nextfut.local"
    },
    update: {
      name: "Administrador NextFut",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      status: "ACTIVE"
    },
    create: {
      name: "Administrador NextFut",
      email: "admin@nextfut.local",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      status: "ACTIVE"
    }
  });

  console.log("Usuário administrador disponível: admin@nextfut.local / Admin@123");

  const evaluator = await prisma.evaluator.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Avaliador Inicial",
      email: "avaliador@nextfut.local",
      relationWithAthlete: "Técnico",
      type: "COACH"
    }
  });

  const athlete = await prisma.athlete.upsert({
    where: { accessCode: "NF-0001" },
    update: {},
    create: {
      accessCode: "NF-0001",
      name: "Atleta Demonstração",
      age: 15,
      position: "Meia",
      dominantFoot: "Direito",
      heightCm: 165,
      country: "Brasil",
      region: "Distrito Federal",
      schoolProject: "Projeto Social NextFut"
    }
  });

  const existingEvaluation = await prisma.evaluation.findFirst({
    where: {
      athleteId: athlete.id,
      evaluatorId: evaluator.id
    }
  });

  if (!existingEvaluation) {
    const evaluation = await prisma.evaluation.create({
      data: {
        athleteId: athlete.id,
        evaluatorId: evaluator.id,
        source: "MANUAL",
        physicalCondition: 8,
        ballControl: 4,
        passing: 5,
        finishing: 3,
        dribbling: 4,
        decisionMaking: 4,
        discipline: 5,
        goals: 2,
        assists: 3,
        accuratePasses: 45,
        wrongPasses: 10,
        tackles: 6,
        fouls: 2,
        shotsOnTarget: 5,
        approved: true,
        finalGrade: 7.4,
        level: "HIGH",
        potential: 4,
        performanceResult: {
          create: {
            performanceScore: 78.5,
            calculatedLevel: "HIGH",
            passAccuracyRate: 0.818,
            offensiveEfficiency: 1.0,
            disciplinaryIndex: 0.9,
            averageTechnicalScore: 4.2,
            strengths: ["Passe", "Disciplina", "Condição Física"],
            weaknesses: ["Finalização", "Drible"],
            recommendations: [
              "Treinos de finalização, chute ao gol e posicionamento ofensivo",
              "Treinos de condução, drible em espaço reduzido e proteção de bola"
            ]
          }
        }
      }
    });

    console.log("Avaliação inicial criada:", evaluation.id);
  }

  console.log("Seed concluído com sucesso.");
}

main()
  .catch((error) => {
    console.error("Erro no seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
