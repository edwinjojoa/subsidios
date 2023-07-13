const indexService = require("../services/consultar_proceso.service");

const consultarestudiante = async (req,res) => {
    const { params } = req.body;
    //console.log(params);
    try {
        const services = await indexService.consultarestudiante(params);
        res.send(services);
    } catch (error) {
        res
        //.status(error?.status || 500)
        //.send({ status: "FAILED",data: { error: error?.message || error } });
    } 
}
const filtroestudiante = async (req,res) => {
    const { params } = req.body;
    //console.log(params);
    try {
        const services = await indexService.filtroestudiante(params);
        res.send(services);
    } catch (error) {
        res
        //.status(error?.status || 500)
        //.send({ status: "FAILED",data: { error: error?.message || error } });
    }
}
const cambiarestado = async (req,res) => {
    const { params } = req.body;
    //console.log(params);
    try {
        const services = await indexService.cambiarestado(params);
        res.send(services);
    } catch (error) {
        res
        //.status(error?.status || 500)
        //.send({ status: "FAILED",data: { error: error?.message || error } });
    }
}
const agregarperfil = async (req,res) => {
    const { params } = req.body;
    //console.log(params);
    try {
        const services = await indexService.agregarperfil(params);
        res.send(services);
    } catch (error) {
        res
        //.status(error?.status || 500)
        //.send({ status: "FAILED",data: { error: error?.message || error } });
    }
}
const confirmamatricula = async (req,res) => {
    const { params } = req.body;
    //console.log(params);
    try {
        const services = await indexService.confirmamatricula(params);
        res.send(services);

    } catch (error) {
        res
        //.status(error?.status || 500)
        //.send({ status: "FAILED",data: { error: error?.message || error } });
    }
}
const eliminarmatricula = async (req,res) => {
    const { params } = req.body;
    //console.log(params, 'params');
    try {
        const services = await indexService.eliminarmatricula(params);
        res.send(services);

    } catch (error) {
        res
        //.status(error?.status || 500)
        //.send({ status: "FAILED",data: { error: error?.message || error } });
    }
}
const consultaplanestudios = async (req,res) => {
    const { params } = req.body;
    //console.log(params, 'params');
    try {
        const services = await indexService.consultaplanestudios(params);
        res.send(services);

    } catch (error) {
        res
        //.status(error?.status || 500)
        //.send({ status: "FAILED",data: { error: error?.message || error } });
    }
}
const consultarperiodocursado = async (req,res) => {
    const { params } = req.body;
   // console.log(params, 'params');
    try {
        const services = await indexService.consultarperiodocursado(params);
        res.send(services);

    } catch (error) {
        res
        //.status(error?.status || 500)
        //.send({ status: "FAILED",data: { error: error?.message || error } });
    }
}
module.exports = {
    consultarestudiante,
    filtroestudiante,
    cambiarestado,
    agregarperfil,
      confirmamatricula,
    eliminarmatricula,
    consultaplanestudios,
    consultarperiodocursado
}