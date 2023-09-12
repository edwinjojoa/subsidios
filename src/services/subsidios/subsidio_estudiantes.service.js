const { log } = require('handlebars');
const pool = require('../../database/connection');

async function obtener_fecha_habilitacion(params) {
  try {
    const response = await pool.query(`
    SELECT 
    CASE 
		WHEN (now() >= (valor::json->>'fecha_inicio')::TIMESTAMP) AND (now() <= (valor::json->> 'fecha_fin')::TIMESTAMP) 
		THEN true
		ELSE 'false'
    END AS habilitado,
		now() AS hora_actual,
		(valor::json->> 'fecha_inicio')::TIMESTAMP AS fecha_inicio,	
    (valor::json->> 'fecha_fin')::TIMESTAMP AS fecha_fin,
    CASE  
		WHEN (SELECT count(id) from subsidios sub WHERE sub.id_periodo_academico=(SELECT id from periodos_academicos WHERE estado=2))< (valor::json->> 'numero_cupos')::INT 
		THEN TRUE
		ELSE false
		END cupoMaximos,
		valor::json->> 'numero_cupos' AS numero_cupos
		FROM parametros_generales
		WHERE id = 122;
		`,
    );
    //console.log(response.rows);
    return response.rows;
  } catch (e) {
    throw error;

  }
};

const buscarEstudiante = async (documento) => {
  try {
    const response = await pool.query(`
    SELECT 
    p.id As "aspiranteId",
    p.id_tipo_identificacion As tipo_documento,
    p.primer_nombre,
    p.segundo_nombre,
    p.primer_apellido,
    p.segundo_apellido,
    p.genero,
    p.direccion,
    p.celular,
    SPLIT_PART(p.correo_electronico, ',', 1) As email,
    s.numero as  SEMESTRE,
    prg.nombre as programa,
    nf.sisben as sisben_nucleo,
    CASE 
		WHEN sub.id_periodo_academico=m.id_periodo_academico  THEN sub.consecutivo
		ELSE ''
    END as numero_cupo
    from personas p
    INNER JOIN estudiantes e on p.id=e.id_persona
    INNER JOIN zeus.matriculas m on e.id=m.id_estudiante
    INNER JOIN semestres s on s.id=m.id_semestre
    INNER JOIN programas prg on prg.id=e.id_programa
    LEFT JOIN nucleos_familiares nf on p.id=nf.id_persona
    LEFT JOIN subsidios sub on p.id=sub.id_persona
    WHERE 
    TRIM(p.numero_identificacion) = $1
    and m.id_periodo_academico=(SELECT id from periodos_academicos WHERE estado=2)
    and e.id_estado_estudiante  = 3 
    ORDER BY s.numero desc limit 1
        `, [documento]);

    return response.rows;

  } catch (error) {
    //throw error;
    //console.error('Error al buscar estudiante:', error);
    //throw new Error('Error al buscar estudiante');
    return res.status(500).json(e,'Error al buscar estudiante');
  }
};



async function obtener_TiposDocumentos(params) {
  try {
    //const codigo = params.codigo;
    //  const dato = JSON.parse(localStorage.getItem('personData'));
    // console.log(data, 'dataaa');
    const response = await pool.query(`
        SELECT
          id,
          descripcion as tipo_documento
        FROM
          tipos_identificacion
        WHERE
          estado = $1
        ORDER BY
          descripcion
				`, [true]
    );
    //console.log(response.rows);
    return response.rows;
  } catch (e) {
    throw error;

  }
};

async function obtener_tipoSisben(params) {
  try {
    //const codigo = params.codigo;
    //  const dato = JSON.parse(localStorage.getItem('personData'));
    // console.log(data, 'dataaa');
    const response = await pool.query(`
      SELECT 
      valor,
			nombre as sisben_nucleo
      from opciones 
      WHERE razon='6444' 
      and activa_casilla =$1
      ORDER BY id  asc

      `, [true]
    );
    return response.rows;
  } catch (e) {
    throw error;

  }
};

async function validarPersonaVerificacion(documento) {
  try {

    const response = await pool.query(`
SELECT
  id
FROM
  personas
WHERE
   numero_identificacion = $1
`,
      [documento.trim()]);

    return response.rows;
  } catch (e) {
    throw error;

  }
};

async function actualizarPersonaInscripcion(datos, aspiranteId) {
  //console.log('datos', aspiranteId);
  //console.log('ttttt', datos);
  try {
    let actualizado = true;
    let periodoAcademico = await pool.query(
     `SELECT
      (count(sub.id) + 1) as consecutivo,
      pa.anio,
      pa.periodo,
      pa.id
      from subsidios sub
      RIGHT JOIN periodos_academicos pa on pa.id=sub.id_periodo_academico
      WHERE pa.estado=2
      GROUP BY pa.anio,pa.periodo, pa.id
      limit 1
      `);
    let updateUser = await pool.query(
      `UPDATE personas SET celular = $1, direccion = $2
      WHERE id = $3
        `,
      [datos.celular, datos.direccion, aspiranteId]
    );
    let updateNucleos = await pool.query(
      `UPDATE nucleos_familiares SET sisben = $2
          WHERE id_persona = $1
           `,
      [aspiranteId, datos.sisben_nucleo]
    );
    
    let insertSubsidio = await pool.query(
      `INSERT INTO subsidios (id_persona, consecutivo, estado_subsidio,fecha_creacion,codigo_barras, observaciones, ano, periodo, id_periodo_academico) 
           VALUES ($1, $2, 1,'now()', '0100418997539120200425', 'pendientes', $3, $4, $5);
       `,
      [aspiranteId, periodoAcademico.rows[0].consecutivo, periodoAcademico.rows[0].anio, periodoAcademico.rows[0].periodo, periodoAcademico.rows[0].id]
    );

    if (updateUser.rowCount && insertSubsidio.rowCount && updateNucleos < 1) {
      actualizado = false;
      console.log("ERROR");
    }
    let consecutivo=periodoAcademico.rows[0].consecutivo;
    return { actualizado, consecutivo, message: 'Datos procesados correctamente' };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  obtener_fecha_habilitacion,
  buscarEstudiante,
  obtener_TiposDocumentos,
  obtener_tipoSisben,
  validarPersonaVerificacion,
  actualizarPersonaInscripcion,
}