const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const port = 3000;



const jobsRoutes = require("./routes/jobs");

app.use(express.json());

app.use("/jobs", jobsRoutes);



app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port} :)`);
  });