import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import AthletesView from "../views/AthletesView.vue";
import AthleteDetailView from "../views/AthleteDetailView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView
  },
  {
    path: "/atletas",
    name: "athletes",
    component: AthletesView
  },
  {
    path: "/atletas/:id",
    name: "athlete-detail",
    component: AthleteDetailView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
