const express = require("express");
const rutasController = require("../../controllers/matriculas-epg.controller")
const { validarJWT } = require('../../middlewares/validar-jwt');

const router = express.Router();

router.get("/matriculas2",validarJWT,rutasController.getClientes);
router.get("/clientes/:id",validarJWT,rutasController.getClientesId);
router.post("/verdatospersonalesEPG",validarJWT,rutasController.verdatospersonalesEPG);
router.post("/insertarEPG",validarJWT,rutasController.insertarEPG);
router.post("/updatedatospersonales",validarJWT,rutasController.updatedatospersonales);
router.post("/consultarmatricula",validarJWT,rutasController.consultarmatricula);
router.get("/obtenerpaises",validarJWT,rutasController.obtenerpaises);
router.post("/obtenerdepartamentos",validarJWT,rutasController.obtenerdepartamentos);
router.post("/obtenermunicipios",validarJWT,rutasController.obtenermunicipios);
router.post("/transformarubicacionciudad",validarJWT,rutasController.transformarubicacionciudad);
router.post("/consultaridestudiante",validarJWT,rutasController.consultaridestudiante); 
router.post("/consultarsemestre",validarJWT,rutasController.consultarsemestre); 


module.exports = router;