/*
  Warnings:

  - Added the required column `totalTests` to the `ChallengeSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChallengeSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "executionTime" INTEGER,
    "memoryUsed" INTEGER,
    "testsPassed" INTEGER NOT NULL DEFAULT 0,
    "totalTests" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "feedback" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    CONSTRAINT "ChallengeSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChallengeSubmission_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ChallengeSubmission" ("challengeId", "code", "feedback", "id", "language", "score", "status", "submittedAt", "userId") SELECT "challengeId", "code", "feedback", "id", "language", "score", "status", "submittedAt", "userId" FROM "ChallengeSubmission";
DROP TABLE "ChallengeSubmission";
ALTER TABLE "new_ChallengeSubmission" RENAME TO "ChallengeSubmission";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
