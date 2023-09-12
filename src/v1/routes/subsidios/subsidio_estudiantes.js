const express = require("express");
const rutasController = require("../../../controllers/subsidios/subsidio_estudiantes.controller");
const router = express.Router();
router.get("/obtener-fecha-habilitacion",rutasController.obtener_fecha_habilitacion);
router.get("/busquedaEstudiantes",rutasController.buscarEstudiante);
router.get("/obtener-tipos-documentos",rutasController.obtener_TiposDocumentos);
router.get("/obtener-tipo-sisben",rutasController.obtener_tipoSisben);
router.post("/guardarInscripcion/:id?",rutasController.guardarInscripcion);

//router.get("/matriculas2",validarJWT,rutasController.getClientes);
module.exports = router;