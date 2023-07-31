const express = require("express");
const rutasController = require("../../../controllers/subsidios/subsidio_estudiantes.controller");
const router = express.Router();
router.get("/busquedaEstudiante",rutasController.subsidio_estudiantes);
router.get("/obtener-tipos-documentos",rutasController.obtener_TiposDocumentos);
//router.get("/matriculas2",validarJWT,rutasController.getClientes);
module.exports = router;
