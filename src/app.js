console.log("funciona xd");



const form = document.getElementById("searchForm");
const cvInput = document.getElementById("cvInput");
const resultsDiv = document.getElementById("results");


form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const cv = cvInput.value;

  console.log("CV:", cv);

  resultsDiv.innerHTML = "<p>Analizando...</p>";


  // manejo de pdfs
  const pdfInput = document.getElementById("pdfInput");
  const file = pdfInput.files[0];
  const formData = new FormData();

  formData.append("cv", file);

  console.log(file);
  console.log(formData.get("cv"));
  
  try {
    const response = await fetch(
      "http://localhost:3000/jobs/upload-pdf",
      {
        method: "POST",
         body: formData
      }
    );

const data = await response.json();

console.log("Respuesta:", data);

if (!Array.isArray(data.result) || data.result.length === 0) {
  resultsDiv.innerHTML = `<p style="color:red;">No se recibieron resultados</p>`;
  return;
}

const jobs = data.result;

const html = jobs.map(job => {
  return `
    <div class="result-card">
      <h2>${job.title}</h2>

      <div class="match-score">
        Match: ${job.matchPercentage}%
      </div>

      <h3>Skills encontradas</h3>
      <ul>
        ${job.matches.map(skill => `<li class="good">${skill}</li>`).join("")}
      </ul>

      <h3>Skills faltantes</h3>
      <ul>
        ${job.missingSkills.map(skill => `<li class="missing">${skill}</li>`).join("")}
      </ul>
    </div>
  `;
}).join("");

    resultsDiv.innerHTML = html;

  } catch (error) {
    console.error("Error:", error);

    resultsDiv.innerHTML = `
      <p style="color:red;">
        Error al procesar el CV
      </p>
    `;
  }
});


