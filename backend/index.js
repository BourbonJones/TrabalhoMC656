import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { fileURLToPath } from "url";


import authRoutes from "./src/routes/authRoutes.js";
import faseRoutes from "./src/routes/faseRoutes.js";

const app = express();


app.use(bodyParser.json());
app.use(cors()); 

app.use(authRoutes); 
app.use(faseRoutes); 


app.get("/", (req, res) => {
  res.json({ message: "Servidor funcionando com arquitetura refatorada!" });
});


const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] && __filename === process.argv[1]) {
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}

export default app; 