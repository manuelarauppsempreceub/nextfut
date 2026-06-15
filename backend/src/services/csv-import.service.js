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

function buildAccessCode(index) {
  return `NF-${String(index + 1).padStart(4, "0")}`;
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

export async function importAthletesFromCsv(records) {
  const summary = {
    received: records.length,
    imported: 0,
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

    const accessCode = normalizeName(
      getValue(row, ["accessCode", "codigo", "código", "codigo_acesso"], buildAccessCode(index))
    );

    const athlete = await prisma.athlete.upsert({
      where: {
        accessCode
      },
      update: {
        name,
        age: toInt(getValue(row, ["idade", "age"])),
        position: getValue(row, ["posicao", "posição", "position"]),
        dominantFoot: getValue(row, ["pe_dominante", "pé dominante", "pe dominante", "dominantFoot"]),
        heightCm: toInt(getValue(row, ["altura", "heightCm", "altura_cm"])),
        country: getValue(row, ["pais", "país", "country"]),
        region: getValue(row, ["regiao", "região", "region"]),
        schoolProject: getValue(row, ["escola", "projeto", "schoolProject"])
      },
      create: {
        accessCode,
        name,
        age: toInt(getValue(row, ["idade", "age"])),
        position: getValue(row, ["posicao", "posição", "position"]),
        dominantFoot: getValue(row, ["pe_dominante", "pé dominante", "pe dominante", "dominantFoot"]),
        heightCm: toInt(getValue(row, ["altura", "heightCm", "altura_cm"])),
        country: getValue(row, ["pais", "país", "country"]),
        region: getValue(row, ["regiao", "região", "region"]),
        schoolProject: getValue(row, ["escola", "projeto", "schoolProject"])
      }
    });

    const evaluationData = mapEvaluation(row);

    if (
      evaluationData.physicalCondition === null &&
      evaluationData.ballControl === null &&
      evaluationData.passing === null &&
      evaluationData.finishing === null &&
      evaluationData.dribbling === null &&
      evaluationData.decisionMaking === null &&
      evaluationData.discipline === null &&
      evaluationData.goals === null &&
      evaluationData.assists === null &&
      evaluationData.accuratePasses === null &&
      evaluationData.wrongPasses === null
    ) {
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
  }

  return summary;
}
