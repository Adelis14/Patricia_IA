require('dotenv').config();
const { consult_gpt_services } = require('./services/open_ai.js');

(async () => {
  try {
    const res = await consult_gpt_services("qué hora es");
    console.log("RESPONSE:", res);
  } catch (err) {
    console.error("FATAL:", err);
  }
})();
