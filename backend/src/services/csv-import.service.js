import prisma from "../database/prisma.js";
import { calculatePerformance } from "./performance.service.js";

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeRow(row) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [normalizeKey(key), value])
  );
}

function getValue(row, keys, fallback = null) {
  const normalizedRow = normalizeRow(row);

  for (const key of keys) {
    const normalizedKey = normalizeKey(key);

    if (
      normalizedRow[normalizedKey] !== undefined &&
      normalizedRow[normalizedKey] !== null &&
      String(normalizedRow[normalizedKey]).trim() !== ""
    ) {
      return normalizedRow[normalizedKey];
    }
  }

  return fallback;
}

function extractFirstNumber(value, fallback = null) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const match = String(value)
    .replace(",", ".")
    .match(/-?\d+(\.\d+)?/);

  if (!match) {
    return fallback;
  }

  const number = Number(match[0]);
  return Number.isFinite(number) ? number : fallback;
}

function extractPercent(value, fallback = null) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const match = String(value)
    .replace(",", ".")
    .match(/\((\d+(\.\d+)?)%\)/);

  if (!match) {
    return fallback;
  }

  const number = Number(match[1]);
  return Number.isFinite(number) ? number : fallback;
}

function toInt(value, fallback = null) {
  const number = extractFirstNumber(value, fallback);
  return Number.isFinite(number) ? Math.round(number) : fallback;
}

function toFloat(value, fallback = null) {
  return extractFirstNumber(value, fallback);
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

function parseDate(value) {
  if (!value) {
    return null;
  }

  const raw = String(value).trim();

  const brDate = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (brDate) {
    const [, day, month, year] = brDate;
    const date = new Date(Number(year), Number(month) - 1, Number(day));

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function mapPosition(value) {
  const normalized = normalizeComparable(value);

  const positions = {
    forward: "Atacante",
    striker: "Atacante",
    atacante: "Atacante",
    midfielder: "Meio-campo",
    meia: "Meio-campo",
    meio_campo: "Meio-campo",
    defender: "Defensor",
    zagueiro: "Defensor",
    lateral: "Defensor",
    goalkeeper: "Goleiro",
    goleiro: "Goleiro"
  };

  return positions[normalized] || normalizeName(value) || null;
}

function normalizeFoot(value) {
  const normalized = normalizeComparable(value);

  if (normalized.includes("direito")) {
    return "Direito";
  }

  if (normalized.includes("esquerdo")) {
    return "Esquerdo";
  }

  if (normalized.includes("ambidestro")) {
    return "Ambidestro";
  }

  return normalizeName(value) || null;
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

function scoreFromPercent(percent, max = 5) {
  if (percent === null || percent === undefined) {
    return null;
  }

  return Math.round(Math.max(0, Math.min(100, percent)) / 100 * max);
}

function calculateTechnicalScores(row) {
  const passPercent = extractPercent(getValue(row, ["PASSES_CERTOS_PCT", "passes_certos_pct"]));
  const longPassPercent = extractPercent(getValue(row, ["PASSES_LONGOS_PCT", "passes_longos_pct"]));
  const finalizations = toFloat(getValue(row, ["FINALIZACOES_POR_JOGO", "finalizacoes_por_jogo"]), 0);
  const shotsOnTarget = toFloat(getValue(row, ["CHUTES_CERTOS_POR_JOGO", "chutes_certos_por_jogo"]), 0);
  const successfulDribbles = toFloat(getValue(row, ["DRIBBLES_CERTOS_POR_JOGO", "dribbles_certos_por_jogo"]), 0);
  const duelsWon = toFloat(getValue(row, ["DISPUTAS_BOLA_VENCIDAS_POR_JOGO", "disputas_bola_vencidas_por_jogo"]), 0);
  const fouls = toFloat(getValue(row, ["FALTAS_POR_JOGO", "faltas_por_jogo"]), 0);
  const yellowCards = toFloat(getValue(row, ["CARTAO_AMARELO", "cartao_amarelo"]), 0);
  const redCards = toFloat(getValue(row, ["CARTAO_VERMELHO", "cartao_vermelho"]), 0);

  const passing = scoreFromPercent(passPercent, 5) ?? scoreFromPercent(longPassPercent, 5);
  const finishing = Math.round(Math.max(0, Math.min(5, finalizations + shotsOnTarget)));
  const dribbling = Math.round(Math.max(0, Math.min(5, successfulDribbles * 2)));
  const ballControl = Math.round(Math.max(0, Math.min(5, (duelsWon + successfulDribbles) / 1.5)));
  const disciplinePenalty = fouls + yellowCards * 1.5 + redCards * 3;
  const discipline = Math.round(Math.max(0, Math.min(5, 5 - disciplinePenalty)));

  return {
    ballControl,
    passing,
    finishing,
    dribbling,
    decisionMaking: passing,
    discipline
  };
}

function mapEvaluation(row) {
  const technicalScores = calculateTechnicalScores(row);

  const accuratePassesValue = getValue(row, ["PASSES_CERTOS_PCT", "passes_certos_pct"]);
  const accuratePasses = toInt(accuratePassesValue);

  const totalMinutes = toInt(getValue(row, ["TOTAL_MINUTOS_JOGADOS", "total_minutos_jogados"]));
  const minutesPerGame = toInt(getValue(row, ["MINUTOS_POR_JOGO", "minutos_por_jogo"]));
  const games = toInt(getValue(row, ["JOGOS", "jogos"]));
  const minutesPlayed = totalMinutes ?? (
    minutesPerGame !== null && games !== null ? minutesPerGame * games : null
  );

  const foulsPerGame = toFloat(getValue(row, ["FALTAS_POR_JOGO", "faltas_por_jogo"]), 0);
  const yellowCards = toInt(getValue(row, ["CARTAO_AMARELO", "cartao_amarelo"]), 0);
  const redCards = toInt(getValue(row, ["CARTAO_VERMELHO", "cartao_vermelho"]), 0);
  const disciplinaryEvents = Math.round(foulsPerGame + yellowCards + redCards * 2);

  return {
    source: "CSV_IMPORT",

    physicalCondition: toInt(getValue(row, ["condicao_fisica", "physicalCondition"]), null),
    ballControl: toInt(getValue(row, ["controle_bola", "ballControl"]), technicalScores.ballControl),
    passing: toInt(getValue(row, ["passe", "passing"]), technicalScores.passing),
    finishing: toInt(getValue(row, ["finalizacao", "finishing"]), technicalScores.finishing),
    dribbling: toInt(getValue(row, ["drible", "dribbling"]), technicalScores.dribbling),
    decisionMaking: toInt(getValue(row, ["tomada_decisao", "decisionMaking"]), technicalScores.decisionMaking),
    discipline: toInt(getValue(row, ["disciplina", "discipline"]), technicalScores.discipline),

    goals: toInt(getValue(row, ["GOLS", "gols", "goals"])),
    assists: toInt(getValue(row, ["ASSISTENCIAS", "assistencias", "assists"])),
    accuratePasses,
    wrongPasses: null,
    tackles: toInt(getValue(row, ["INTERCEPCOES_POR_JOGO", "intercepcoes_por_jogo", "desarmes", "tackles"])),
    fouls: disciplinaryEvents,
    shotsOnTarget: toInt(getValue(row, ["CHUTES_CERTOS_POR_JOGO", "chutes_certos_por_jogo", "shotsOnTarget"])),
    minutesPlayed,
    games,
    successfulDribbles: toInt(getValue(row, ["DRIBBLES_CERTOS_POR_JOGO", "dribbles_certos_por_jogo", "successfulDribbles"])),
    duelsWon: toInt(getValue(row, ["DISPUTAS_BOLA_VENCIDAS_POR_JOGO", "disputas_bola_vencidas_por_jogo", "duelsWon"])),
    recoveries: toInt(getValue(row, ["BOLAS_RECUPERADAS_POR_JOGO", "bolas_recuperadas_por_jogo", "recoveries"])),

    approved: null,
    finalGrade: toFloat(getValue(row, ["nota_final", "finalGrade"])),
    level: mapLevel(getValue(row, ["nivel", "level"])),
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
    const name = normalizeName(getValue(row, [
      "NOME_JOGADOR",
      "nome_jogador",
      "nome",
      "name",
      "jogador",
      "atleta"
    ]));

    if (!name) {
      summary.skipped++;
      summary.errors.push({
        row: index + 1,
        message: "Nome do atleta não informado"
      });
      continue;
    }

    const age = toInt(getValue(row, ["IDADE", "idade", "age"]));
    const position = mapPosition(getValue(row, ["POSICAO", "posicao", "posição", "position"]));
    const region = normalizeName(getValue(row, ["REGIAO_DF", "regiao_df", "regiao", "região", "region"]));
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
      birthDate: parseDate(getValue(row, ["DATA_NASCIMENTO", "data_nascimento", "birthDate"])),
      age,
      position,
      dominantFoot: normalizeFoot(getValue(row, ["PE_PREFERENCIAL", "pe_preferencial", "pe_dominante", "pé dominante", "dominantFoot"])),
      heightCm: toInt(getValue(row, ["ALTURA_CM", "altura_cm", "altura", "heightCm"])),
      country: normalizeName(getValue(row, ["PAIS", "pais", "país", "country"])),
      region,
      schoolProject: normalizeName(getValue(row, ["ESCOLA", "PROJETO", "escola", "projeto", "schoolProject"])) || "Captação nas escolas"
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