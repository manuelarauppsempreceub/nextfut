import { getCurrentUser } from "./auth";

export function currentUser() {
  return getCurrentUser();
}

export function currentRole() {
  return currentUser()?.role || null;
}

export function isAdmin() {
  return currentRole() === "ADMIN";
}

export function isScout() {
  return currentRole() === "SCOUT";
}

export function isAthlete() {
  return currentRole() === "ATHLETE";
}

export function canCreateAthlete() {
  return isAdmin();
}

export function canEditAthlete(athlete) {
  const user = currentUser();

  if (!user || !athlete) {
    return false;
  }

  if (user.role === "ADMIN") {
    return true;
  }

  return user.role === "ATHLETE" && user.athleteId === athlete.id;
}

export function canCreateEvaluation() {
  return isAdmin() || isScout();
}

export function canRegisterInterest() {
  return isAdmin() || isScout();
}

export function canManageInterests() {
  return isAdmin() || isScout();
}

export function athleteListActionLabel(athlete) {
  return canEditAthlete(athlete) || canCreateEvaluation() || canRegisterInterest()
    ? "Abrir perfil"
    : "Visualizar";
}