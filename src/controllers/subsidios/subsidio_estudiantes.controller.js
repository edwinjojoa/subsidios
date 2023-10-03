const indexService = require("../../services/subsidios/subsidio_estudiantes.service");
const fs = require("fs")
const path = require("path")
const handlebars = require("handlebars")
const nodemailer = require("nodemailer");

const obtener_fecha_habilitacion = async (req, res) => {
    const { params } = req.body;
    try {
        const services = await indexService.obtener_fecha_habilitacion(params);
        res.send(services[0]);
    } catch (error) {
        res
    }
}
const buscarEstudiante = async (req, res) => {
    try {
        let dato = req.query;
        const services = await indexService.buscarEstudiante(dato.documento);
        res.send(services[0]);
    } catch (error) {
        // Manejar errores y enviar solo el mensaje de error
        
        res;
        //res.status(404).json({ message: 'Error al buscar estudiante' });
        //return res.status(400).json({ message: 'puto' });
    }
}

const obtener_TiposDocumentos = async (req, res) => {
    const { params } = req.body;
    try {
        const services = await indexService.obtener_TiposDocumentos(params);
        res.send(services);
    } catch (error) {
        res
    }
}

const obtener_tipoSisben = async (req, res) => {
    const { params } = req.body;
    try {
        const services = await indexService.obtener_tipoSisben(params);
        res.send(services);
        //console.log(services);
    } catch (error) {
        res
    }
}

const guardarInscripcion = async (req, res) => {
    const datos = req.body;
    
    const validarPersona = await indexService.validarPersonaVerificacion(datos.documento);
    let aspiranteId = validarPersona[0].id;
    try {
        if (datos.documento) {
            const verificacionEmaiEE = await indexService.actualizarPersonaInscripcion(datos, aspiranteId);
            if (verificacionEmaiEE.actualizado === false) {
                await pool.query('ROLLBACK');
                throw new ServiceUnavailableException('(¡Ocurrió un error al intentar solicitar la modificación de sus datos!');
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
                const emailTemplateSource = fs.readFileSync(path.join(__dirname, "../../template/envio-inscripción-subsidio.hbs"), "utf8")
                const template = handlebars.compile(emailTemplateSource);
                const replacements = {
                    urlRuah: '',
                    firstname: datos.primer_nombre,
                    consecutivo: verificacionEmaiEE.consecutivo,
                };
                const finalHtml = template(replacements);
                let info = await transporter.sendMail({
                    from: '"Obtención cupo para el subsidio de la Universidad Cesmag" ',
                    to: datos.email.trim().toLowerCase(),
                    subject: "Obtención cupo para el subsidio de la Universidad Cesmag",
                    html: finalHtml,
                });
                //res.send({ message: 'se envio correo electronico exitosamente.' });
            }
            main().catch(console.error);
            //--------------------------
            res.send({ message: 'La solicitud se ha registrado correctamente <p><b>Cupo numero ' + verificacionEmaiEE.consecutivo + '</b> </p> Verificar su Correo Electronico' });

        }
    } catch (error) {
        res
        console.error('Error en guardarInscripcion:', error);
    }
};


module.exports = {
    obtener_fecha_habilitacion,
    buscarEstudiante,
    obtener_TiposDocumentos,
    obtener_tipoSisben,
    guardarInscripcion,


}