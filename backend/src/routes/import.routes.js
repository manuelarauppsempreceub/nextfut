import { Router } from "express";
import multer from "multer";
import fs from "fs";
import { parse } from "csv-parse/sync";
import { importAthletesFromCsv } from "../services/csv-import.service.js";

const router = Router();

const upload = multer({
  dest: "uploads/"
});

router.post("/csv", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Nenhum arquivo CSV enviado. Use o campo file."
      });
    }

    const content = fs.readFileSync(req.file.path, "utf8");

    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true
    });

    fs.unlinkSync(req.file.path);

    const columns = records.length > 0 ? Object.keys(records[0]) : [];
    const importSummary = await importAthletesFromCsv(records);

    res.json({
      message: "CSV importado com sucesso",
      file: {
        originalName: req.file.originalname,
        size: req.file.size
      },
      summary: {
        rows: records.length,
        columns,
        ...importSummary
      },
      preview: records.slice(0, 3)
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: "Erro ao processar CSV",
      error: error.message
    });
  }
});

export default router;
