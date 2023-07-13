const express = require("express");
const rutasController = require("../../controllers/cargue-documentos.controller")
const { validarJWT } = require('../../middlewares/validar-jwt');
const path = require('path')
const multer = require('multer')
const router = express.Router();


router.get("/getperson",validarJWT,rutasController.getperson);
router.get("/getdocumentos",validarJWT,rutasController.getdocumentosepg);
router.post("/crear_carpetas",validarJWT,rutasController.crear_carpetas);

let storage = multer.diskStorage({
    destination:(req, file, cb) => {
        const { nombrecarpeta } = req.query;
        const { nombre_programa } = req.query;
        const { periodoAcad } = req.query;
        const { carpetaestudiante } = req.query;
        cb(null,`public/uploads/expedientes/${nombrecarpeta}/${periodoAcad}/${carpetaestudiante}/${nombre_programa}`);
    },
    filename:(req, file, cb) => {
        const { nombreDocumento } = req.query;
        cb(null,nombreDocumento + path.extname(file.originalname+'.pdf'))
    }
})
const upload = multer({ storage: storage });
router.post('/cargar-documento', upload.single('file'), (req, res) => {
    res.send ({ message: 'El documento fue guardado exitosamente.' });
})
router.post("/cargar-documento-db",validarJWT,rutasController.cargar_documento_db);
router.get("/descargar-documento/:id", function(req, res) {
    let { ruta } = req.query
    let  params  = req.params
    let rutafinal;
    if (ruta === "null" || ruta === "undefined") {
        rutafinal = './public/uploads/expedientes'
    } else {
        rutafinal = './public/uploads/expedientes' + ruta;
    }
    res.sendFile( path.resolve(rutafinal+'/'+params.id) );
});
router.delete("/eliminar-documento-bd-inscripcion/:docpath",rutasController.eliminarBd);
router.delete("/eliminar-documento",validarJWT,rutasController.eliminar_documento);
router.post("/actualizar-documento-db",validarJWT,rutasController.actualizar_documento_db);

module.exports = router;