import { createRouter, createWebHistory } from "vue-router";
import PublicHomeView from "../views/HomeView.vue";
import DashboardView from "../views/DashboardView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterAthleteView from "../views/RegisterAthleteView.vue";
import RegisterScoutView from "../views/RegisterScoutView.vue";
import AdminUsersView from "../views/AdminUsersView.vue";
import AthletesView from "../views/AthletesView.vue";
import AthleteCreateView from "../views/AthleteCreateView.vue";
import AthleteDetailView from "../views/AthleteDetailView.vue";
import ScoutDashboardView from "../views/ScoutDashboardView.vue";
import ImportCsvView from "../views/ImportCsvView.vue";
import AthletePortalView from "../views/AthletePortalView.vue";
import ScoutInterestsView from "../views/ScoutInterestsView.vue";
import { getCurrentUser, isAuthenticated } from "../services/auth";

const routes = [
  {
    path: "/",
    name: "public-home",
    component: PublicHomeView,
    meta: {
      publicLayout: true
    }
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: {
      publicLayout: true
    }
  },
  {
    path: "/cadastro/atleta",
    name: "register-athlete",
    component: RegisterAthleteView,
    meta: {
      publicLayout: true
    }
  },
  {
    path: "/cadastro/olheiro",
    name: "register-scout",
    component: RegisterScoutView,
    meta: {
      publicLayout: true
    }
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/portal-atleta",
    name: "athlete-portal",
    component: AthletePortalView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/atletas",
    name: "athletes",
    component: AthletesView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/atletas/novo",
    name: "athlete-create",
    component: AthleteCreateView,
    meta: {
      requiresAuth: true,
      roles: ["ADMIN", "SCOUT"]
    }
  },
  {
    path: "/atletas/:id",
    name: "athlete-detail",
    component: AthleteDetailView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/olheiro",
    name: "scout-dashboard",
    component: ScoutDashboardView,
    meta: {
      requiresAuth: true,
      roles: ["ADMIN", "SCOUT"]
    }
  },
  {
    path: "/interesses",
    name: "scout-interests",
    component: ScoutInterestsView,
    meta: {
      requiresAuth: true,
      roles: ["ADMIN", "SCOUT"]
    }
  },
  {
    path: "/importar",
    name: "import-csv",
    component: ImportCsvView,
    meta: {
      requiresAuth: true,
      roles: ["ADMIN"]
    }
  },
  {
    path: "/admin/usuarios",
    name: "admin-users",
    component: AdminUsersView,
    meta: {
      requiresAuth: true,
      roles: ["ADMIN"]
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return {
      path: "/login",
      query: {
        redirect: to.fullPath
      }
    };
  }

  const allowedRoles = to.meta.roles;

  if (allowedRoles?.length) {
    const user = getCurrentUser();

    if (!user || !allowedRoles.includes(user.role)) {
      return {
        path: "/dashboard"
      };
    }
  }

  if (to.path === "/login" && isAuthenticated()) {
    return {
      path: "/dashboard"
    };
  }

  return true;
});

export default router;