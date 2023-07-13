const indexService = require("../services/matricula-epg.service");
//const pool = require('../database/connection');


const getClientes = async (req,res) => {

  //console.log("reqqq",req.body);
  try {
    const services = await indexService.getClientes();
      res.send(services);


  } catch (error) {
    res
    //   //.status(error?.status || 500)
    // .send({ status: "FAILED", data: { error: error?.message || error } });
  }
}

const getClientesId = async (req,res) => {
  const services = await indexService.getClientesId(req.params.id);
  res.send(services);
}


//////////////////////
const verdatospersonalesEPG = async (req,res) => {
  const { params } = req.body;
  //console.log(params);
  try {
    const services = await indexService.verdatospersonalesEPG(params);
      res.send(services);


  } catch (error) {
    res
      //.status(error?.status || 500)
      //.send({ status: "FAILED",data: { error: error?.message || error } });
  }
}
const insertarEPG = async (req,res) => {
  const { params } = req.body;
  try {
    const services = await indexService.insertarEPG(params);
      res.send(services);


  } catch (error) {
    res
      //.status(error?.status || 500)
      //.send({ status: "FAILED",data: { error: error?.message || error } });
  }
}
const updatedatospersonales = async (req,res) => {
  const { params } = req.body;
  try {
    const services = await indexService.updatedatospersonales(params);
      res.send(services);

  } catch (error) {
    res
      //.status(error?.status || 500)
      //.send({ status: "FAILED",data: { error: error?.message || error } });
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////

const consultarmatricula = async (req,res) => {
  const { params } = req.body;
  try {
    const services = await indexService.consultarmatricula(params);
      res.send(services);

  } catch (error) {
    res
      //.status(error?.status || 500)
      //.send({ status: "FAILED",data: { error: error?.message || error } });
  }
}
const obtenerpaises = async (req,res) => {
  // const { params } = req.body;
  try {
    const services = await indexService.obtenerpaises();
      res.send(services);

  } catch (error) {
    res
      //.status(error?.status || 500)
      //.send({ status: "FAILED",data: { error: error?.message || error } });
  }
}
const obtenerdepartamentos = async (req,res) => {
  const { params } = req.body;
  try {
    const services = await indexService.obtenerdepartamentos(params);
      res.send(services);

  } catch (error) {
    res
      //.status(error?.status || 500)
      //.send({ status: "FAILED",data: { error: error?.message || error } });
  }
}
const obtenermunicipios = async (req,res) => {
  const { params } = req.body;
  try {
    const services = await indexService.obtenermunicipios(params);
      res.send(services);

  } catch (error) {
    res
      //.status(error?.status || 500)
      //.send({ status: "FAILED",data: { error: error?.message || error } });
  }
}
const transformarubicacionciudad = async (req,res) => {
  const { params } = req.body;
  try {
    const services = await indexService.transformarubicacionciudad(params);
      res.send(services);

  } catch (error) {
    res
      //.status(error?.status || 500)
      //.send({ status: "FAILED",data: { error: error?.message || error } });
  }
}
const consultaridestudiante = async (req,res) => {
  const { params } = req.body;
  //console.log(params,'ksdbkasbkhbakhfbaskhfbdhkasfbdkabhkbhk');
  try {
    const services = await indexService.consultaridestudiante(params);
      res.send(services);

  } catch (error) {
    res
      //.status(error?.status || 500)
      //.send({ status: "FAILED",data: { error: error?.message || error } });
  }
}
const consultarsemestre = async (req,res) => {
  const { params } = req.body;
  //console.log(params,'ksdbkasbkhbakhfbaskhfbdhkasfbdkabhkbhk');
  try {
    const services = await indexService.consultarsemestre(params);
      res.send(services);

  } catch (error) {
    res
      //.status(error?.status || 500)
      //.send({ status: "FAILED",data: { error: error?.message || error } });
  }
}
// const updatedatospersonales = async (req,res) => {
//   const { params } = req.body;
//   try {
//     const services = await indexService.updatedatospersonales(params);
//       res.send(services);

//   } catch (error) {
//     res
//       //.status(error?.status || 500)
//       //.send({ status: "FAILED",data: { error: error?.message || error } });
//   }confirmamatricula
// }

/////////////////////

module.exports = {
  getClientes,
  getClientesId,
  verdatospersonalesEPG,
  insertarEPG,
  updatedatospersonales,
  consultarmatricula,
  obtenerpaises,
  obtenerdepartamentos,
  obtenermunicipios,
  transformarubicacionciudad,
  consultaridestudiante,
  consultarsemestre
}
