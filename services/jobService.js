const { getHimalayas } = require("./sources/himalayas");
const { getJobicy } = require("./sources/jobicy");

async function getAllJobs(filters = {}) {

    try {

    const results = await Promise.allSettled([
        getHimalayas(filters),
        getJobicy(filters)
    ]);

    return results
        .filter(result => result.status === "fulfilled")
        .flatMap(result => result.value);

} catch (error) {

    console.error("Error obteniendo vacantes Himalayas:", error);

    return [];
  }
  
}

module.exports = {
    getAllJobs
};