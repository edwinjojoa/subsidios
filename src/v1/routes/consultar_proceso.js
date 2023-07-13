const express = require("express");
const rutasController = require("../../controllers/consultar_proceso.controller")
const { validarJWT } = require('../../middlewares/validar-jwt');

const router = express.Router();

router.post("/consultarestudiante",validarJWT,rutasController.consultarestudiante);
router.post("/filtroestudiante",validarJWT,rutasController.filtroestudiante);
router.post("/cambiarestado",validarJWT,rutasController.cambiarestado);
router.post("/agregarperfil",validarJWT,rutasController.agregarperfil);
router.post("/confirmamatricula",validarJWT,rutasController.confirmamatricula);
router.post("/eliminarmatricula",validarJWT,rutasController.eliminarmatricula);
router.post("/consultaplanestudios",validarJWT,rutasController.consultaplanestudios);
router.post("/consultarperiodocursado",validarJWT,rutasController.consultarperiodocursado);


module.exports = router;