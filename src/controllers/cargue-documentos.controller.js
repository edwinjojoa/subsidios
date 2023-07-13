const indexService = require("../services/cargue-documentos.service");
const pool = require('../database/connection');


const getperson = async(req, res) => {
      try {
        let data=req.query;
        const services = await indexService.getperson(data.idInscripcion,data.programa_epg);
        res.send(services);
      } catch (error) {
        res
        //  .status(error?.status || 500)
        //  .send({ status: "FAILED", data: { error: error?.message || error } });
      }
  }

  const getdocumentosepg = async(req, res) => {
    let data=req.query;
    const services =await indexService.getdocumentosepg(data.id_inscripcion,data.programa_epg);
    res.send(services);
  }

  const crear_carpetas = async(req, res) => {
    try{
      const {params}= req.body;
      const {nombrecarpeta}=params;
      const { nombre_programa } = params;
      const { periodoAcad } = params;
      const { carpetaestudiante } = params;

     const destination='public/uploads/expedientes/';
     const fs = require('fs');
      fs.mkdirSync('public/uploads/expedientes/'+nombrecarpeta+"/"+periodoAcad+"/"+carpetaestudiante+"/"+nombre_programa,{recursive:true});
      res.send({ message: 'El documento fue guardado exitosamente.' });
    }catch(err){
      throw new ServiceUnavailableException('error al crear la carpeta.');
    }

  }
  
  const cargar_documento_db = async(req, res) => {
    try{
      const { params } = req.body;
      await pool.query('BEGIN');
      const respuesta = await indexService.guardarDoc(params)
      if (respuesta.guardado == true) {
          await pool.query('COMMIT');
          res.send({ message: 'El documento fue guardado exitosamente.' });

      } else {
          await pool.query('ROLLBACK');
          console.log("error al guardar el documento");
      }

    }catch(err){
     console.log("error",err);
    }
  }
  const eliminarBd = async(req, res) => {
    try {
      let  params  = req.params
      await pool.query('BEGIN');
      const respuesta = await indexService.eliminarDocinscripcion(params.docpath);

      if (respuesta.eliminado === true) {
          await pool.query('COMMIT');
          res.send({ message: respuesta.message });
      } else {
          await pool.query('ROLLBACK');
      }

  } catch (err) {
      await pool.query('ROLLBACK');
  }
  }
  const eliminar_documento = async(req, res) => {
    const fs = require('fs');
    let {urlDoc}=req.query
    const path = './public/uploads/expedientes/' + urlDoc
    const removido = false
    fs.unlink(path, (err) => {
        if (err) {

            console.log("error",err);
        } else {
          res.send({ message: 'El documento fue eliminado' });
        }
    })
    
  }

  const actualizar_documento_db = async(req, res) => {
    try{
      const data  = req.body;
      const respuesta = await indexService.updateDoc(data)
      res.send({ message: respuesta.message });
    }catch(err){
      console.log("error al la consulta");  
      }
  }

  module.exports = {
    getperson,getdocumentosepg,crear_carpetas,cargar_documento_db,eliminarBd,eliminar_documento,actualizar_documento_db
  }
