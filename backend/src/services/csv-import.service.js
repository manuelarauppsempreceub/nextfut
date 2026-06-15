import prisma from "../database/prisma.js";
import { calculatePerformance } from "./performance.service.js";

function getValue(row, keys, fallback = null) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== "") {
      return row[key];
    }
  }

  return fallback;
}

function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const normalized = String(value).replace(",", ".");
  const number = Number(normalized);

  return Number.isFinite(number) ? Math.round(number) : fallback;
}

function toFloat(value, fallback = null) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const normalized = String(value).replace(",", ".");
  const number = Number(normalized);

  return Number.isFinite(number) ? number : fallback;
}

function normalizeName(value) {
  return String(value || "").trim();
}

function normalizeComparable(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

async function generateNextAccessCode() {
  const lastAthlete = await prisma.athlete.findFirst({
    where: {
      accessCode: {
        startsWith: "NF-"
      }
    },
    orderBy: {
      accessCode: "desc"
    }
  });

  if (!lastAthlete) {
    return "NF-0001";
  }

  const lastNumber = Number(lastAthlete.accessCode.replace("NF-", ""));

  if (!Number.isFinite(lastNumber)) {
    return `NF-${String(Date.now()).slice(-6)}`;
  }

  return `NF-${String(lastNumber + 1).padStart(4, "0")}`;
}

async function findMatchingAthlete({ name, age, position, region, explicitAccessCode }) {
  if (explicitAccessCode) {
    const byCode = await prisma.athlete.findUnique({
      where: {
        accessCode: explicitAccessCode
      }
    });

    if (byCode) {
      return byCode;
    }
  }

  const candidates = await prisma.athlete.findMany({
    where: {
      name
    }
  });

  return candidates.find((candidate) => {
    const sameAge = age === null || candidate.age === age;
    const samePosition =
      !position ||
      !candidate.position ||
      normalizeComparable(candidate.position) === normalizeComparable(position);
    const sameRegion =
      !region ||
      !candidate.region ||
      normalizeComparable(candidate.region) === normalizeComparable(region);

    return sameAge && samePosition && sameRegion;
  }) || null;
}

function mapLevel(value) {
  const normalized = String(value || "").trim().toLowerCase();

  if (["alto", "high"].includes(normalized)) {
    return "HIGH";
  }

  if (["baixo", "low"].includes(normalized)) {
    return "LOW";
  }

  if (["medio", "médio", "medium"].includes(normalized)) {
    return "MEDIUM";
  }

  return null;
}

function mapEvaluation(row) {
  return {
    source: "CSV_IMPORT",
    physicalCondition: toInt(getValue(row, ["condicao_fisica", "condição física", "condição_física", "physicalCondition"])),
    ballControl: toInt(getValue(row, ["controle_bola", "controle de bola", "ballControl"])),
    passing: toInt(getValue(row, ["passe", "passing"])),
    finishing: toInt(getValue(row, ["finalizacao", "finalização", "finishing"])),
    dribbling: toInt(getValue(row, ["drible", "dribbling"])),
    decisionMaking: toInt(getValue(row, ["tomada_decisao", "tomada de decisão", "decisionMaking"])),
    discipline: toInt(getValue(row, ["disciplina", "discipline"])),
    goals: toInt(getValue(row, ["gols", "goals"])),
    assists: toInt(getValue(row, ["assistencias", "assistências", "assists"])),
    accuratePasses: toInt(getValue(row, ["passes_certos", "passes certos", "accuratePasses"])),
    wrongPasses: toInt(getValue(row, ["passes_errados", "passes errados", "wrongPasses"])),
    tackles: toInt(getValue(row, ["desarmes", "tackles"])),
    fouls: toInt(getValue(row, ["faltas", "faltas cometidas", "fouls"])),
    shotsOnTarget: toInt(getValue(row, ["chutes_no_gol", "chutes no gol", "shotsOnTarget"])),
    minutesPlayed: toInt(getValue(row, ["minutos_jogados", "minutos jogados", "minutesPlayed"])),
    games: toInt(getValue(row, ["jogos", "games"])),
    successfulDribbles: toInt(getValue(row, ["dribles_certos", "dribles certos", "successfulDribbles"])),
    duelsWon: toInt(getValue(row, ["disputas_vencidas", "disputas vencidas", "duelsWon"])),
    recoveries: toInt(getValue(row, ["recuperacoes", "recuperações", "recoveries"])),
    approved: null,
    finalGrade: toFloat(getValue(row, ["nota_final", "nota final", "finalGrade"])),
    level: mapLevel(getValue(row, ["nivel", "nível", "level"])),
    potential: toInt(getValue(row, ["potencial", "potential"]))
  };
}

function hasAnyEvaluationData(evaluationData) {
  return Object.entries(evaluationData).some(([key, value]) => {
    if (["source", "approved", "level"].includes(key)) {
      return false;
    }

    return value !== null && value !== undefined;
  });
}

export async function importAthletesFromCsv(records) {
  const summary = {
    received: records.length,
    imported: 0,
    athletesCreated: 0,
    athletesUpdated: 0,
    evaluationsCreated: 0,
    skipped: 0,
    errors: []
  };

  for (const [index, row] of records.entries()) {
    const name = normalizeName(getValue(row, ["nome", "name", "jogador", "atleta"]));

    if (!name) {
      summary.skipped++;
      summary.errors.push({
        row: index + 1,
        message: "Nome do atleta não informado"
      });
      continue;
    }

    const age = toInt(getValue(row, ["idade", "age"]));
    const position = getValue(row, ["posicao", "posição", "position"]);
    const region = getValue(row, ["regiao", "região", "region"]);
    const explicitAccessCode = normalizeName(
      getValue(row, ["accessCode", "codigo", "código", "codigo_acesso"])
    );

    const existingAthlete = await findMatchingAthlete({
      name,
      age,
      position,
      region,
      explicitAccessCode
    });

    const athleteData = {
      name,
      age,
      position,
      dominantFoot: getValue(row, ["pe_dominante", "pé dominante", "pe dominante", "dominantFoot"]),
      heightCm: toInt(getValue(row, ["altura", "heightCm", "altura_cm"])),
      country: getValue(row, ["pais", "país", "country"]),
      region,
      schoolProject: getValue(row, ["escola", "projeto", "schoolProject"])
    };

    let athlete;

    if (existingAthlete) {
      athlete = await prisma.athlete.update({
        where: {
          id: existingAthlete.id
        },
        data: athleteData
      });

      summary.athletesUpdated++;
    } else {
      const accessCode = explicitAccessCode || await generateNextAccessCode();

      athlete = await prisma.athlete.create({
        data: {
          accessCode,
          ...athleteData
        }
      });

      summary.athletesCreated++;
    }

    const evaluationData = mapEvaluation(row);

    if (!hasAnyEvaluationData(evaluationData)) {
      summary.imported++;
      continue;
    }

    const performance = calculatePerformance(evaluationData);

    await prisma.evaluation.create({
      data: {
        athleteId: athlete.id,
        ...evaluationData,
        level: evaluationData.level || performance.calculatedLevel,
        performanceResult: {
          create: performance
        }
      }
    });

    summary.imported++;
    summary.evaluationsCreated++;
  }

  return summary;
}
