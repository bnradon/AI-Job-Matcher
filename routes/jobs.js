const express = require("express");
const router = express.Router();
const jobService = require("../services/jobService");

const data = require("../jobs.json");

// url producción
const webhookURL = process.env.WEBHOOK_URL;

const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage()
});

function urlModifier(text) {
  return text.toLowerCase().replace(/\s/g, "-");
}


router.get("/", async (req, res) => {

 try {

    const jobs = await jobService.getAllJobs(req.query);

    res.json(jobs);



  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message
    });

  }

});

//   router.get("/test", async (req, res) => {

//    try {

//      const filters = {
//         q: req.query.q,
//         country: req.query.country,
//         employmentType: req.query.type,
//         seniority: req.query.seniority
//     };

//     const jobs = await jobService.getAllJobs(filters);

//     res.json(jobs);

//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       error: error.message
//     });
//   }
// });

router.get("/:title/skills", (req, res) => {
  let { title } = req.params;

  title = urlModifier(title);

  const job = data.find(job =>
    urlModifier(job.title) === title
  );

  if (!job) {
    return res.status(404).json({
      error: "Job not found"
    });
  }

  res.json({
    title: job.title,
    skills: job.skills
  });
});


router.get("/:title", (req, res) => {
  let { title } = req.params;

  title = urlModifier(title);

  const job = data.find(job =>
    urlModifier(job.title) === title
  );

  if (!job) {
    return res.status(404).json({
      error: "Job not found"
    });
  }

  res.json(job);
});


router.post("/match", async (req, res) => {

    const userSkills = req.body?.skills;

    if (!userSkills || !Array.isArray(userSkills)) {
        return res.status(400).json({
            error: "skills debe ser un array"
        });
    }

    const matchedJobs = data
        .map(job => {

            const matches = job.skills.filter(skill =>
                userSkills.includes(skill)
            );

            const missingSkills = job.skills.filter(skill =>
                !userSkills.includes(skill)
            );

            const totalSkills = job.skills.length;

            const matchPercentage =
                (matches.length / totalSkills) * 100;

            if (matchPercentage < 20) return null;

            return {
                title: job.title,
                matches,
                missingSkills,
                matchPercentage: matchPercentage.toFixed(1)
            };

        })
        .filter(Boolean)
        .sort((a, b) =>
            Number(b.matchPercentage) - Number(a.matchPercentage)
        );

    const jobsWithVacancies = await Promise.all(

        matchedJobs.map(async (job) => {

            const vacancies = await jobService.getAllJobs({

                q: job.title

            });

            return {

                ...job,

                vacancies

            };

        })

    );

    res.json(jobsWithVacancies);

});

// Webhook

router.post(
  "/upload-pdf",
  upload.single("cv"),
  async (req, res) => {

    try {

      const formData = new FormData();

      const blob = new Blob(
        [req.file.buffer],
        {
          type: req.file.mimetype
        }
      );

      formData.append(
        "cv",
        blob,
        req.file.originalname
      );

      const response = await fetch(
        webhookURL,
        {
          method: "POST",
          body: formData
        }
      );

      const raw = await response.text();

      let result;

      try {

        result = JSON.parse(raw);

      } catch {

        result = raw;

      }

      // Si el webhook no devolvió un array
      if (!Array.isArray(result)) {

        return res.json({
          success: true,
          result
        });

      }

const jobsWithVacancies = await Promise.all(

    result.map(async (match) => {

        const vacancies = await jobService.getAllJobs({

            q: match.title

        });

        return {

            ...match,

            vacancies

        };

    })

);

res.json({

    success: true,

    result: jobsWithVacancies

});

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        error: error.message
      });

    }

  }
);

module.exports = router;