import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import AthletesView from "../views/AthletesView.vue";

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
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
