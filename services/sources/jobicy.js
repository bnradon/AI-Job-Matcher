const BASE_URL = "https://jobicy.com/api/v2/remote-jobs";

async function getJobicy(filters = {}) {
  try {

    const params = new URLSearchParams();

    params.set("count", filters.count || 20);

// búsqueda
if (filters.q) {
    params.set("tag", filters.q);
}

// país
if (filters.country) {
    params.set("geo", filters.country.toLowerCase());
}

// tipo de empleo
if (filters.employmentType) {
    params.set("type", filters.employmentType.toLowerCase());
}

      const jobTypes = {
      "Full Time": "full-time",
      "Part Time": "part-time",
      "Contract": "contract",
      "Internship": "internship",
      "Freelance": "freelance"
    };

    if (filters.employmentType) {
        params.set("type", jobTypes[filters.employmentType] || filters.employmentType);
    }
    
    const response = await fetch(`${BASE_URL}?${params}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();


    
    return data.jobs.map(job => ({

    title: job.jobTitle,
    company: job.companyName,
    logo: job.companyLogo,
    location: job.jobGeo,
    description: job.jobExcerpt,
    url: job.url,

    salary:
        job.salaryMin && job.salaryMax
            ? `${job.salaryCurrency} ${job.salaryMin} - ${job.salaryMax}`
            : "Not specified",

    employmentType: job.jobType?.join(", "),
    level: job.jobLevel,
    source: "Jobicy"

}));

  } catch (error) {

    console.error("Error obteniendo vacantes Jobicy:", error);

    return [];
  }


}

module.exports = {
  getJobicy
};