const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;
const webhookUrl = process.env.WEBHOOK_URL;
const frontendUrl = process.env.FRONTEND_URL;

const jobsRoutes = require("./routes/jobs");

app.use(express.json());

app.use("/jobs", jobsRoutes);



app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port} :)`);
  });