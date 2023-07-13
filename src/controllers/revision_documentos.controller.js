const indexService = require("../services/revision_documentos.service");
const pool = require('../database/connection');
// const hbs = require('hbs');
 const fs = require("fs")
 const path = require("path")
 const handlebars = require("handlebars")
 const nodemailer = require("nodemailer");


const obtener_programas = async (req,res) => {
    try {
        const services = await indexService.obtener_programas();
        res.send(services);
    } catch (error) {
        res

    }
}
const listar_periodos = async (req,res) => {
    try {
        const services = await indexService.listar_periodos();
        res.send(services);
    } catch (error) {
        res

    }
}
const estudiantesEPG = async (req,res) => {
    const { params } = req.body;
    try {
        const services = await indexService.estudiantesEPG(params);
        res.send(services);
    } catch (error) {
        res
            .status(error?.status || 500)
            .send({ status: "FAILED",data: { error: error?.message || error } });
    }
}

const obtener_documentos = async (req,res) => {
    try {
        const { id_epg } = req.query;
        const { id_programa } = req.query;

        const services = await indexService.obtener_documentos(id_epg,id_programa);
        res.send(services);
    } catch (error) {
        res
            .status(error?.status || 500)
            .send({ status: "FAILED",data: { error: error?.message || error } });
    }
}

const aprobar_documentos = async (req,res) => {
    try {
        const documentosSeleccionados = req.body;
        let services;
        await pool.query('BEGIN');
        for (var i = 0; i < documentosSeleccionados.length; i++) {
            services = await indexService.aprobar_documentos(documentosSeleccionados[i].id_documento,req);
            if (services.actualizado === false) {
                await pool.query('ROLLBACK');
                console.log("ERROR AL GUARDAR EN BASE DE DATOS");
            }
        }
        await pool.query('COMMIT');
        console.log("services",services);
        res.send({ message: services.message });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.log("error",err);
    }

}

const solicitar_modificacion = async (req,res) => {
    try {
        var documentos=req.body.documentosSeleccionados
        var datos=req.body.datos
        var nombredoc='';

        for (let i = 0; i < documentos.length; i++) {
            respuesta = await indexService.solicitarModificacion(documentos[i].id_documento, req.body.observaciones);
            if (respuesta.actualizado === false) {
                await pool.query('ROLLBACK');
                throw new ServiceUnavailableException('(02) ¡Ocurrió un error al intentar solicitar la modificación del documento!');
            }
            nombredoc+=documentos[i].documento +" - ";
        }

        async function main() {
            let testAccount = await nodemailer.createTestAccount();
            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: '465',
                secure: true, 
                auth: {
                    user: 'comunicados@unicesmag.edu.co', 
                    pass: '79684896', 
                },
            });
            const emailTemplateSource = fs.readFileSync(path.join(__dirname,"./../template/solicitud-modificacion-documentos.hbs"),"utf8")
            const template = handlebars.compile(emailTemplateSource);
            const replacements = {
                urlRuah: '',
                firstname: datos.nombre,
                lastname: " ",
                documentos: nombredoc,
                fecha_limite: " ",
                observaciones:req.body.observaciones
            };
            const finalHtml = template(replacements);

            let info = await transporter.sendMail({
                from: '"Solicitud modificación documento(s) - Universidad Cesmag " ', 
                to: datos.correo.trim().toLowerCase(), 
                subject: "Solicitud modificación documento(s) - Universidad Cesmag ", 
                html: finalHtml, 
            });
            res.send({ message: 'se envio correo electronico exitosamente' });
        }
        main().catch(console.error);


    } catch (err) {
        await pool.query('ROLLBACK');
        console.log("error",err);
    }

}
const estudiantesproceso = async (req,res) => {
    const { params } = req.body;
    //console.log(params);
    try {
        const services = await indexService.estudiantesproceso(params);
        res.send(services);
    } catch (error) {
        res
            .status(error?.status || 500)
            .send({ status: "FAILED",data: { error: error?.message || error } });
    }
}

const comprobar_notificar_aprobacion = async (req,res) => {
    try {
        var documentos_completos = await indexService.comprobarRequisitosCompletos(req);
        res.send(documentos_completos);
    } catch (error) {
        console.log("error controller");
    }
}

const notificar_aprobacion_documentos_epg = async (req,res) => {
    try {
        var datos=req.body.datos 
        const epg = req.body.id_epg;
        const person_adm = req.body.idpersona_adm; 
        respuesta = await indexService.actualizarDocumentosCompletos(epg,person_adm);
            if (respuesta.actualizado === false) {
                console.log('(02) ¡Ocurrió un error al intentar solicitar la modificación del documento!');
            }
    
        async function main() {
            let testAccount = await nodemailer.createTestAccount();
            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: '465',
                secure: true, 
                auth: {
                    user: 'comunicados@unicesmag.edu.co', 
                    pass: '79684896', 
                },
            });
            const emailTemplateSource = fs.readFileSync(path.join(__dirname,"./../template/aprobacion-documentos-epg.hbs"),"utf8")
            const template = handlebars.compile(emailTemplateSource);
            const replacements = {
                firstname: datos.nombre,
                lastname: " ",
              
            };
            const finalHtml = template(replacements);
            let info = await transporter.sendMail({
                from: '"Aprobación documentos - Universidad Cesmag " ', 
                to: datos.correo.trim().toLowerCase(),
                subject: "Aprobación documentos - Universidad Cesmag ", 
                html: finalHtml, 
            });
            res.send({ message: 'se envio correo electronico exitosamente de la aprobacion de los documentos en proceso de grado.' });
        }
        main().catch(console.error);


    } catch (err) {
            console.log('(02) ¡Ocurrió un error al intentar solicitar la modificación del documento!');
    }
}

const informacion_documentos_epg = async (req,res) => {
    try {
        const  params  = req.query;
        const services = await indexService.informacion_documentos_epg(params);
        res.send(services);
    } catch (error) {
        res
            .status(error?.status || 500)
            .send({ status: "FAILED",data: { error: error?.message || error } });
    }
}


module.exports = {
    obtener_programas,
    estudiantesEPG,
    listar_periodos,
    obtener_documentos,
    aprobar_documentos,
     solicitar_modificacion,
    estudiantesproceso,
    comprobar_notificar_aprobacion,
    notificar_aprobacion_documentos_epg,
    informacion_documentos_epg
}