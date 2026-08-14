const form = document.getElementById("searchForm");
const pdfInput = document.getElementById("pdfInput");
const resultsDiv = document.getElementById("results");
const summary = document.getElementById("summary");
const counter = document.getElementById("jobCounter");
const uploadArea = document.querySelector(".upload-area");
const uploadTitle = document.querySelector(".upload-title");
const uploadSubtitle = document.querySelector(".upload-subtitle");
const searchButton = document.getElementById("searchButton");

searchButton.disabled = true;


['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, (e) => e.preventDefault());
});

['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => {
        uploadArea.classList.add("dragover"); 
    });
});

['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => {
        uploadArea.classList.remove("dragover");
    });
});

function archivoExitoso(file) {

    if (!file) {

        searchButton.disabled = true;
        return;

    }

    if (file.type !== "application/pdf") {

        searchButton.disabled = true;

        alert("Solo archivos PDF");

        return;

    }

    uploadArea.style.borderColor = "#28a745";
    uploadArea.style.backgroundColor = "#14711c20";

    uploadTitle.textContent = file.name;
    uploadSubtitle.textContent = "Listo";

    searchButton.disabled = false;
}

// drop del archivo 
uploadArea.addEventListener("drop", (e) => {
    const files = e.dataTransfer.files;
    
    if (files.length > 0) {
        pdfInput.files = files; 
        archivoExitoso(files[0]);
    }
});


pdfInput.addEventListener("change", () => {

      const file = pdfInput.files[0];

});

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const file = pdfInput.files[0];

    if (!file) {

        alert("Selecciona un PDF.");

        return;
    
    }


    const formData = new FormData();

    formData.append("cv", file);

    resultsDiv.innerHTML = `
        <div class="card">
            <h2>Buscando ofertas...</h2>
            <p>Esto puede tardar unos segundos.</p>
        </div>
    `;

    summary.innerHTML = `
        <h3>${file.name}</h3>

        <p>Analizando CV...</p>
    `;

    try {

        const response = await fetch(
            "http://localhost:3000/jobs/upload-pdf",

            {

                method: "POST",

                body: formData

            }

        );

        const data = await response.json();

        console.log(data);

        const jobs = data.result.slice(0,20);

        if (!Array.isArray(jobs) || jobs.length === 0) {

            resultsDiv.innerHTML = `
                <div class="card">

                    <h2>No se encontraron ofertas.</h2>

                </div>
            `;

            return;

        }

        // resumen del match

        const allMatches = [...new Set(

            jobs.flatMap(job => job.matches)

        )];

        const allMissing = [...new Set(

            jobs.flatMap(job => job.missingSkills)

        )];

        let detectedLevel = "No detectado";

        for (const job of jobs) {

            const t = job.title.toLowerCase();

            if (t.includes("senior")) {

                detectedLevel = "Senior";

                break;

            }

            if (t.includes("junior")) {

                detectedLevel = "Junior";

            }

            if (t.includes("intern")) {

                detectedLevel = "Intern";

            }

        }

        summary.innerHTML = `

            <h3>${file.name}</h3>

            <br>

            <strong>Nivel detectado</strong>

            <p>${detectedLevel}</p>

            <br>

            <strong>Skills encontradas</strong>

            <ul class="skills">

                ${allMatches.map(skill =>

                    `<li class="good">${skill}</li>`

                ).join("")}

            </ul>

            <br>

            <strong>Skills faltantes</strong>

            <ul class="skills">

                ${allMissing.map(skill =>

                    `<li class="missing">${skill}</li>`

                ).join("")}

            </ul>

        `;

                // contador

   const totalVacancies = jobs.reduce(

    (acc, job) => acc + job.vacancies.length,

    0

);

counter.textContent = `${totalVacancies} vacantes`;



// tarjetas de resultados

        resultsDiv.innerHTML = jobs.flatMap(match =>

    match.vacancies.map(vacancy => `

        <div class="result-card">

            ${vacancy.logo ? `
                <img
                    src="${vacancy.logo}"
                    alt="${vacancy.company}"
                    style="
                        width:60px;
                        height:60px;
                        object-fit:contain;
                        margin-bottom:15px;
                        border-radius:12px;
                        background:#fff;
                        padding:6px;
                    ">
            ` : ""}

            <h2>${vacancy.title}</h2>

            <div class="match-score">

                ${match.matchPercentage}% Match

            </div>

            <p><strong>${vacancy.company}</strong></p>

            <p>${vacancy.location}</p>

            <p>${vacancy.salary}</p>

            <p>${vacancy.employmentType}</p>

            <p style="color:#9b9ba5">

                ${vacancy.description}

            </p>

            <div>

                <h3>Skills encontradas</h3>

                <ul>

                    ${match.matches.map(skill =>

                        `<li class="good">${skill}</li>`

                    ).join("")}

                </ul>

            </div>

            <div>

                <h3>Skills faltantes</h3>

                <ul>

                    ${match.missingSkills.map(skill =>

                        `<li class="missing">${skill}</li>`

                    ).join("")}

                </ul>

            </div>

            <a

                class="offer-button"

                href="${vacancy.url}"

                target="_blank"

            >

                Ver oferta →

            </a>

        </div>

    `)

).join("");

    }

    catch (err) {

        console.error(err);

        summary.innerHTML = `
            <p>Error analizando CV.</p>
        `;

        resultsDiv.innerHTML = `
            <div class="card">

                <h2>Ocurrió un error.</h2>

            </div>
        `;

    }

});

