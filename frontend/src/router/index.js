import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import AthletesView from "../views/AthletesView.vue";
import AthleteCreateView from "../views/AthleteCreateView.vue";
import AthleteDetailView from "../views/AthleteDetailView.vue";
import ScoutDashboardView from "../views/ScoutDashboardView.vue";
import ImportCsvView from "../views/ImportCsvView.vue";
import AthletePortalView from "../views/AthletePortalView.vue";
import ScoutInterestsView from "../views/ScoutInterestsView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView
  },
  {
    path: "/portal-atleta",
    name: "athlete-portal",
    component: AthletePortalView
  },
  {
    path: "/atletas",
    name: "athletes",
    component: AthletesView
  },
  {
    path: "/atletas/novo",
    name: "athlete-create",
    component: AthleteCreateView
  },
  {
    path: "/atletas/:id",
    name: "athlete-detail",
    component: AthleteDetailView
  },
  {
    path: "/olheiro",
    name: "scout-dashboard",
    component: ScoutDashboardView
  },
  {
    path: "/interesses",
    name: "scout-interests",
    component: ScoutInterestsView
  },
  {
    path: "/importar",
    name: "import-csv",
    component: ImportCsvView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;