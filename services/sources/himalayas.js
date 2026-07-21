
// si no hay filtros
const BASE_URL = "https://himalayas.app/jobs/api";

// si hay filtros
const SEARCH_URL = "https://himalayas.app/jobs/api/search";


  async function getHimalayas(filters = {}) {
  try {

    
   const params = new URLSearchParams();

    let useSearch = false;

    //consulta
    if (filters.q) {
        params.set("q", filters.q);
        useSearch = true;
    }

    //pais
    if (filters.country) {
      params.set("country", filters.country);
         useSearch = true;
    }

    //nivel
    if (filters.seniority) {
      params.set("seniority", filters.seniority);
      useSearch = true;
    }

    //tipo de empleo
    if (filters.employmentType) {
      params.set("employment_type", filters.employmentType);
         useSearch = true;
    }

    params.set("sort", "recent");

    const endpoint = useSearch
  
        ? `${SEARCH_URL}?${params}`
        : BASE_URL;

    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

// console.log("================================");
// console.log("DATA:");
// console.dir(data, { depth: null });
// console.log("================================");

    const jobs = data.jobs.map(job => ({

      title: job.title,
      company: job.companyName,
      location: job.locationRestrictions?.join(", ") || "Remote",
      description: job.excerpt,
      url: job.applicationLink,

      salary:
        job.minSalary && job.maxSalary
          ? `${job.currency} ${job.minSalary} - ${job.maxSalary}`
          : "Not specified",

      employmentType: job.employmentType,
      source: "Himalayas"

    }));

    return jobs;

  } catch (error) {

    console.error("Error obteniendo vacantes de Himalayas:", error);

    return [];
  }
}

module.exports = {
  getHimalayas
};