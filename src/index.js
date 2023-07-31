const express = require("express");
const matricula = require("./v1/routes/matriculas-epg");
const cargue_documentos = require("./v1/routes/cargue-documentos");
const revision_documentos = require("./v1/routes/revision_documentos");
const consultar_proceso = require("./v1/routes/consultar_proceso");
const subsidio_estudiantes = require("./v1/routes/subsidios/subsidio_estudiantes");
const cors = require("cors");
const { application } = require("express");
const jwt = require('jsonwebtoken');
const { log } = require("handlebars");


const app = express();
const PORT = process.env.PORT || 3100;

app.use(express.json());
app.use(cors());

// Rutas para las diferentes modulos en proceso de grado
app.use("/proceso-grado", matricula);
app.use("/cargue-documentos",cargue_documentos);
app.use("/revision-documentos",revision_documentos);
app.use("/consultar-proceso",consultar_proceso);
app.use("/subsidio_estudiantes",subsidio_estudiantes);

app.listen(PORT, () => {
    console.log(`🚀 Ecuchando en el puerto  ${PORT} para estudiantes en  proceso de grado`);
});
  
const login = async (req,res) => {
  const { params } = req.body;
  //const usu = usuario.req.body;
  console.log(req.body);
  console.log(params);

  const usu = req.body.usuario;
  const psw = req.body.pasword;
  if (usu == 'EpG2023un1c35m4g' && psw == '357ud14nt353PG2023') {
    const payload = {
      check: true
    }
    const token = jwt.sign(payload,process.env.AUTH_JWT_SECRET,{
      expiresIn: '7d'
    });
    res.json({
      message: 'autenticacion exitosa',
      token: token
    });
  } else {
    res.json({
      message: 'datos mal'
    })
  }
}

app.use('/login',login);