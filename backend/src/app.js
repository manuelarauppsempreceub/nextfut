import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({
    app: "NextFut API",
    status: "online",
    message: "Backend NextFut em execução"
  });
});

export default app;

