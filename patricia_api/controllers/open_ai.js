const {consult_gpt_services} = require('../services/open_ai')


const verPrincipal = (req, res) => {
    res.json({
      principal: 'Ruta principal'
    });
  };


const consult_gpt = async (req, res) => {
    try {

      let {prompt} = req.body;

      let result = await consult_gpt_services(prompt);

      res.json({
        result
      })

      
    } catch (error) {
      throw new Error("error", error);
    }
};
  
  module.exports = {
    verPrincipal,
    consult_gpt
  };