-- CreateEnum
CREATE TYPE "AthleteStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "EvaluatorType" AS ENUM ('COACH', 'SCOUT', 'PHYSICAL_TRAINER', 'DIRECTOR', 'RESPONSIBLE', 'OBSERVER', 'OTHER');

-- CreateEnum
CREATE TYPE "PlayerLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "EvaluationSource" AS ENUM ('MANUAL', 'CSV_IMPORT', 'API');

-- CreateEnum
CREATE TYPE "ScoutInterestStatus" AS ENUM ('INTERESTED', 'CONTACTED', 'DISCARDED');

-- CreateTable
CREATE TABLE "athletes" (
    "id" TEXT NOT NULL,
    "accessCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "age" INTEGER,
    "position" TEXT,
    "dominantFoot" TEXT,
    "heightCm" INTEGER,
    "country" TEXT,
    "region" TEXT,
    "schoolProject" TEXT,
    "status" "AthleteStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "athletes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluators" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "relationWithAthlete" TEXT,
    "type" "EvaluatorType" NOT NULL DEFAULT 'OTHER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "evaluatorId" TEXT,
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "EvaluationSource" NOT NULL DEFAULT 'MANUAL',
    "physicalCondition" INTEGER,
    "ballControl" INTEGER,
    "passing" INTEGER,
    "finishing" INTEGER,
    "dribbling" INTEGER,
    "decisionMaking" INTEGER,
    "discipline" INTEGER,
    "goals" INTEGER,
    "assists" INTEGER,
    "accuratePasses" INTEGER,
    "wrongPasses" INTEGER,
    "tackles" INTEGER,
    "fouls" INTEGER,
    "shotsOnTarget" INTEGER,
    "minutesPlayed" INTEGER,
    "games" INTEGER,
    "successfulDribbles" INTEGER,
    "duelsWon" INTEGER,
    "recoveries" INTEGER,
    "approved" BOOLEAN,
    "finalGrade" DOUBLE PRECISION,
    "level" "PlayerLevel",
    "potential" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_results" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "performanceScore" DOUBLE PRECISION NOT NULL,
    "calculatedLevel" "PlayerLevel" NOT NULL,
    "passAccuracyRate" DOUBLE PRECISION,
    "offensiveEfficiency" DOUBLE PRECISION,
    "disciplinaryIndex" DOUBLE PRECISION,
    "averageTechnicalScore" DOUBLE PRECISION,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "recommendations" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scout_interests" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "scoutName" TEXT NOT NULL,
    "scoutEmail" TEXT,
    "status" "ScoutInterestStatus" NOT NULL DEFAULT 'INTERESTED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scout_interests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "athletes_accessCode_key" ON "athletes"("accessCode");

-- CreateIndex
CREATE INDEX "athletes_name_idx" ON "athletes"("name");

-- CreateIndex
CREATE INDEX "athletes_position_idx" ON "athletes"("position");

-- CreateIndex
CREATE INDEX "athletes_region_idx" ON "athletes"("region");

-- CreateIndex
CREATE INDEX "evaluators_name_idx" ON "evaluators"("name");

-- CreateIndex
CREATE INDEX "evaluators_email_idx" ON "evaluators"("email");

-- CreateIndex
CREATE INDEX "evaluations_athleteId_idx" ON "evaluations"("athleteId");

-- CreateIndex
CREATE INDEX "evaluations_evaluatorId_idx" ON "evaluations"("evaluatorId");

-- CreateIndex
CREATE INDEX "evaluations_level_idx" ON "evaluations"("level");

-- CreateIndex
CREATE INDEX "evaluations_approved_idx" ON "evaluations"("approved");

-- CreateIndex
CREATE UNIQUE INDEX "performance_results_evaluationId_key" ON "performance_results"("evaluationId");

-- CreateIndex
CREATE INDEX "performance_results_performanceScore_idx" ON "performance_results"("performanceScore");

-- CreateIndex
CREATE INDEX "performance_results_calculatedLevel_idx" ON "performance_results"("calculatedLevel");

-- CreateIndex
CREATE INDEX "scout_interests_athleteId_idx" ON "scout_interests"("athleteId");

-- CreateIndex
CREATE INDEX "scout_interests_scoutName_idx" ON "scout_interests"("scoutName");

-- CreateIndex
CREATE INDEX "scout_interests_status_idx" ON "scout_interests"("status");

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "evaluators"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_results" ADD CONSTRAINT "performance_results_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scout_interests" ADD CONSTRAINT "scout_interests_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
