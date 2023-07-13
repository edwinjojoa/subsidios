const express = require("express");
const rutasController = require("../../controllers/revision_documentos.controller")
const { validarJWT } = require('../../middlewares/validar-jwt');

const router = express.Router();

router.get("/obtener-programas",validarJWT,rutasController.obtener_programas);
router.get("/listar-periodos",validarJWT,rutasController.listar_periodos);
router.post("/estudiantesEPG",validarJWT,rutasController.estudiantesEPG);
router.post("/estudiantesproceso",validarJWT,rutasController.estudiantesproceso);
router.get("/obtener-documentos",validarJWT,rutasController.obtener_documentos);
router.post("/aprobar-documentos",validarJWT,rutasController.aprobar_documentos);
router.post("/solicitar-modificacion",validarJWT,rutasController.solicitar_modificacion);
router.get("/comprobar-notificar-aprobacion",validarJWT,rutasController.comprobar_notificar_aprobacion);
router.post("/notificar-aprobacion-documentos-epg",validarJWT,rutasController.notificar_aprobacion_documentos_epg);
router.get("/informacion-documentos-epg",validarJWT,rutasController.informacion_documentos_epg);



module.exports = router;