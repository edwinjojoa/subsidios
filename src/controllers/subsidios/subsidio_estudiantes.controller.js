const indexService = require("../../services/subsidios/subsidio_estudiantes.service");

const subsidio_estudiantes = async (req,res) => {
    const { params } = req.body;
    //console.log(params);
    try {
        const services = await indexService.buscarEstudiante(params);
        res.send(services);
    } catch (error) {
        res
        //.status(error?.status || 500)
        //.send({ status: "FAILED",data: { error: error?.message || error } });
    } 
}
const obtener_TiposDocumentos = async (req,res) => {
    const { params } = req.body;
    //console.log(params);
    try {
        const services = await indexService.obtener_TiposDocumentos(params);
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

module.exports = {
    subsidio_estudiantes,
    obtener_TiposDocumentos,
    filtroestudiante
}