import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({
    app: "NexFut API",
    status: "online",
    message: "Backend NexFut em execução"
  });
});

export default app;
