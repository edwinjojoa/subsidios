const pool = require('../database/connection');

const  getperson = async(id_persona,programa_epg) => {
      try {
        const response = await pool.query(`
          SELECT
            e.id,
            p.id as id_persona,
            p.numero_identificacion,
            prog.nombre as programa,
            m.id as id_modalidad,
            m.nombre as nombre_modalidad,
            (select valor from  parametros_generales where id=129) as periodo_academico,
            pe.anio
        FROM estudiantes_epg epg 
          INNER JOIN	estudiantes e on epg.id_Estudiante=e.id
          INNER JOIN periodos_academicos pe on epg.id_periodo_academico=pe.id
          INNER JOIN personas p on e.id_persona=p.id
          INNER JOIN programas prog on epg.id_programa=prog.id
          INNER JOIN modalidades m  ON prog.id_modalidad = m.id
          WHERE p.id =$1 and epg.id_programa=$2
        `,[id_persona,programa_epg]);

        return response.rows;
        
    }catch(e){
        throw error;
        console.log(e);
    }
  };


  async function getdocumentosepg(id,programa_epg) {
    
        try {
          let response
          if(programa_epg==='14'){
            console.log("entrando1");
             response = await pool.query( `SELECT
            cg.id as id_combo,
            cg.nombre_combo,
            cg.modulo,
            cg.valor,
            cg.abreviatura,
            cg.texto,
            cg.descripcion,
            ee.id as id_documento,
            ee.id_persona,
            ee.tipo_documento,
            case WHEN ee.nombre_documento is null then ee.ruta_documento
            ELSE concat(ee.ruta_documento||ee.nombre_documento) END as ruta_documento,
            ee.revision,
            CASE 
              WHEN ee.id IS NULL THEN TRUE
              WHEN ee.id IS NOT NULL
                THEN (
                  CASE 
                    WHEN (ee.revision IS NULL) THEN FALSE
                    WHEN (ee.revision = TRUE) THEN FALSE
                    WHEN (ee.revision = FALSE AND ee.modificacion = FALSE) THEN TRUE
                    WHEN (ee.revision = FALSE AND ee.modificacion = TRUE) THEN FALSE
                  END
                )
              ELSE FALSE
            END AS boton_cargar,
            CASE 
              WHEN ee.id IS NOT NULL
                  THEN (
                    CASE
                      WHEN (ee.revision IS NULL) THEN TRUE
                      ELSE FALSE 
                    END
                  )
              ELSE FALSE
            END AS boton_eliminar,
            CASE
              WHEN ee.id IS NULL THEN FALSE
              ELSE TRUE
            END AS boton_descargar,
            CASE 
              WHEN ee.id IS NULL THEN 'CARGAR'
              WHEN ee.id IS NOT NULL
                THEN (
                  CASE 
                    WHEN (ee.revision = FALSE AND ee.modificacion = FALSE) THEN 'MODIFICACION'
                    ELSE 'NO PROCESO DE CARGA'
                  END
                )
              ELSE 'NO PROCESO DE CARGA'
            END AS proceso_documento,
            CASE
              WHEN (ee.revision = FALSE AND ee.modificacion = FALSE) THEN 'Rechazado'
              WHEN (ee.revision = TRUE) THEN 'Aprobado'
              WHEN ee.id IS NULL THEN 'Pendiente cargue'
              ELSE 'Pendiente revisión'
            END AS estado_aprobacion, 
            ee.observacion
        FROM zeus.combos_generales cg
        LEFT JOIN zeus.expediente_estudiante ee
        ON cg.valor = ee.tipo_documento  AND ee.id_persona = $1 and ee.id_programa=$2 and ee.id_periodo_academico=(select valor::int from  parametros_generales where id=129)
    WHERE cg.nombre_combo = 'DOCUMENTOS_PROCESO_GRADO' and cg.estado=true`,[id,programa_epg]);
    return response.rows; 
  }else{
              response = await pool.query( `SELECT
          cg.id as id_combo,
          cg.nombre_combo,
          cg.modulo,
          cg.valor,
          cg.abreviatura,
          cg.texto,
          cg.descripcion,
          ee.id as id_documento,
          ee.id_persona,
          ee.tipo_documento,
          case WHEN ee.nombre_documento is null then ee.ruta_documento
          ELSE concat(ee.ruta_documento||ee.nombre_documento) END as ruta_documento,
          ee.revision,
          CASE 
            WHEN ee.id IS NULL THEN TRUE
            WHEN ee.id IS NOT NULL
              THEN (
                CASE 
                  WHEN (ee.revision IS NULL) THEN FALSE
                  WHEN (ee.revision = TRUE) THEN FALSE
                  WHEN (ee.revision = FALSE AND ee.modificacion = FALSE) THEN TRUE
                  WHEN (ee.revision = FALSE AND ee.modificacion = TRUE) THEN FALSE
                END
              )
            ELSE FALSE
          END AS boton_cargar,
          CASE 
            WHEN ee.id IS NOT NULL
                THEN (
                  CASE
                    WHEN (ee.revision IS NULL) THEN TRUE
                    ELSE FALSE 
                  END
                )
            ELSE FALSE
          END AS boton_eliminar,
          CASE
            WHEN ee.id IS NULL THEN FALSE
            ELSE TRUE
          END AS boton_descargar,
          CASE 
            WHEN ee.id IS NULL THEN 'CARGAR'
            WHEN ee.id IS NOT NULL
              THEN (
                CASE 
                  WHEN (ee.revision = FALSE AND ee.modificacion = FALSE) THEN 'MODIFICACION'
                  ELSE 'NO PROCESO DE CARGA'
                END
              )
            ELSE 'NO PROCESO DE CARGA'
          END AS proceso_documento,
          CASE
            WHEN (ee.revision = FALSE AND ee.modificacion = FALSE) THEN 'Rechazado'
            WHEN (ee.revision = TRUE) THEN 'Aprobado'
            WHEN ee.id IS NULL THEN 'Pendiente cargue'
            ELSE 'Pendiente revisión'
          END AS estado_aprobacion, 
          ee.observacion
      FROM zeus.combos_generales cg
      LEFT JOIN zeus.expediente_estudiante ee
      ON cg.valor = ee.tipo_documento  AND ee.id_persona = $1 and ee.id_programa=$2 and ee.id_periodo_academico=(select valor::int from  parametros_generales where id=129)
      WHERE cg.nombre_combo = 'DOCUMENTOS_PROCESO_GRADO' and cg.estado=true
      and cg.valor in ('120','121')
      `,[id,programa_epg]);
return response.rows; 
          }
          
          
      }catch(e){
          console.log(e);
          return res.status(500).json(e,'Internal server error');
      }
  };
  

async function guardarDoc(datos) {
  try {
    var guardado = false;
      const insertDoc = await pool.query(`
          insert into zeus.expediente_estudiante (id_persona, tipo_documento, ruta_documento,nombre_documento,id_periodo_academico,id_programa,id_estudiante) values ($1, $2, $3,$4,$5,$6,$7)`
        , [datos.id_persona, datos.id_tipo_documento, datos.urlcarpeta,datos.nombre_documento,datos.id_periodo_academico,datos.programa_epg,datos.id_estudiante]
      );
      if (insertDoc.rowCount > 0) {
        guardado = true
        return { message: 'El documento fue guardado', guardado: guardado}
      }
  } catch (error) {
    console.log("error",error);

    //   throw new ServiceUnavailableException(error.message)
  }
};

async function eliminarDocinscripcion(idDocumento) {
  try{
    const deleteEmpresaRut = await pool.query(
      ` delete from zeus.expediente_estudiante where id = $1`
      , [idDocumento]
    );
    if (deleteEmpresaRut.rowCount > 0) {
      eliminado = true
      return { message: 'El documento fue guardado', eliminado: eliminado }
    }
  } catch (error) {
    console.log("error base de datos");
  }
}

async function updateDoc(datos) {
  try {

    var updateDocumento;
    var guardado = false;

    updateDocumento = await pool.query(
      `
        update zeus.expediente_estudiante set ruta_documento = $1, modificacion = true, fecha_modificacion = (select NOW()),nombre_documento=$3 where id = $2
      `
      , [datos.urlcarpeta, datos.id_documento,datos.nombre_documento]

    );
    

    if (updateDocumento.rowCount > 0) {
      guardado = true
      return { message: 'El documento fue actualizado', guardado: guardado}
    }
  } catch (error) {
    console.log("error en service");  }

}



  module.exports = {
    getperson,getdocumentosepg,guardarDoc,eliminarDocinscripcion,updateDoc
  };