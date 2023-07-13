const pool = require('../database/connection');

async function obtener_programas() {
    try {
        const response = await pool.query(`
select id,nombre  from programas where publicado  like 'S' and id_modalidad <> 2
order by nombre asc
    `);
        return response.rows;
    } catch (e) {
        throw error;
        console.log(e);
    }
};
async function listar_periodos() {
    try {
        const response = await pool.query(`
    select id,anio || ' - ' || periodo as periodo
    -- ,actual = true as actual
    from periodos_academicos
    where id BETWEEN 87 and (select valor::INTEGER from  parametros_generales where id=129)
    order by anio::int, periodo::int
    `);
        return response.rows;
    } catch (e) {
        throw error;
        console.log(e);
    }
};
async function estudiantesEPG(params) {
    try {
        const idPrograma = params.idPrograma;
        const idPeriodo = params.idPeriodo;
        const idSemestre = params.idSemestre;
        const estado = params.estado;
        var condicion = '';
        var condicionotrosProgra='';

        if(idPrograma!='14'){
            condicionotrosProgra = `and cg.valor in ('120','121')`;
        }
        if (estado === '1') {
            condicion = `where foo3.aprobados > 0`;
        } else if (estado === '2') {
            condicion = `where foo3.actualizados > 0`
        } else if (estado === '3') {
            condicion = `where foo3.rechazados > 0`
        } else if (estado === '4') {
            condicion = `where foo3.pendientes_revision > 0`
        } else if (estado === '5') {
            condicion = `where foo3.pendientes_fecha > 0`
        } else if (estado === '6') {
            condicion = `where foo3.pendientes_cargue_plazo > 0`
        } else if (estado === '7') {
            condicion = `where foo3.pendientes_cargue > 0`
        }

        const response = await pool.query(
            `select 
              * 
            from (
              select 
                foo2.id_matricula as id_epg,
                foo2.id_programa,
                 foo2.id_persona,
                foo2.numero_identificacion,
                foo2.estudiante as nombre,
                foo2.celular,
                foo2.correo,
                foo2.id_estudiante,
                foo2.codigo,
                count(case when foo2.estado_aprobacion ILIKE 'Aprobado' then true end) as "aprobados",
                count(case when foo2.estado_aprobacion ILIKE 'Actualizado' then true end) as "actualizados",
                count(case when foo2.estado_aprobacion ILIKE 'Rechazado' then true end) as "rechazados",
                count(case when foo2.estado_aprobacion ILIKE 'Pendiente revisión' then true end) as "pendientes_revision",
                count(case when foo2.estado_aprobacion ILIKE 'Pendiente fecha límite carga' then true end) as "pendientes_fecha",
                count(case when foo2.estado_aprobacion ILIKE 'Pendiente carge hasta:%' then true end) as "pendientes_cargue_plazo",
                count(case when foo2.estado_aprobacion ILIKE 'Pendiente cargue' then true end) as "pendientes_cargue"
              from (
                select 
                  foo.*,
                  CASE
                    WHEN (ee.fecha_limite_carga IS NOT NULL AND ee.ruta_documento = '') THEN ('Pendiente carge hasta: '||ee.fecha_limite_carga::text)
                    WHEN (ee.fecha_limite_carga IS NULL AND ee.justificacion_fecha IS NOT NULL) THEN 'Pendiente fecha límite carga'
                    WHEN (ee.revision = FALSE AND ee.modificacion = true) THEN 'Actualizado'
                    WHEN (ee.revision = FALSE AND ee.modificacion = FALSE) THEN 'Rechazado'
                    WHEN (ee.revision = TRUE) THEN 'Aprobado'
                    WHEN ee.id IS NULL THEN 'Pendiente cargue'
                    ELSE 'Pendiente revisión'
                  END AS estado_aprobacion
                from (
                  SELECT
                    epg.id AS id_matricula,
                    epg.id_programa ,
                    p.id AS id_persona,
                    p.numero_identificacion,
                    _getpersonname(p.numero_identificacion) AS estudiante,
                    p.celular,
                    p.correo_electronico AS correo,
                    e.id AS id_estudiante,
                    e.codigo,
                    doc.texto as documento,
                    doc.valor as tipo_documento
                  FROM
                    estudiantes_epg AS epg
                    INNER JOIN estudiantes AS e
                      on e.id = epg.id_estudiante and epg.id_periodo_academico = $3
                      INNER JOIN personas AS p
                        cross join (
                          select
                            *
                          from zeus.combos_generales as cg
                          where cg.nombre_combo ='DOCUMENTOS_PROCESO_GRADO'  and cg.estado = true
                          `+condicionotrosProgra+`
                        ) as doc
                      ON e.id_persona = p.id
                  WHERE
                    epg.id_periodo_academico = $3
                    AND epg.id_programa = $1
                    AND epg.semestre = $2
                  group by
                    id_matricula,
                    p.id,
                    p.numero_identificacion,
                    estudiante,
                    p.celular,
                    correo,
                    e.id,
                    e.codigo,
                    tipo_documento,
                    documento
                ) as foo
                  left join zeus.expediente_estudiante as ee
                  on foo.id_persona = ee.id_persona
                    and foo.tipo_documento = ee.tipo_documento
                   and ee.id_periodo_academico = $3
                order by foo.estudiante, foo.documento
              ) as foo2
              group by
                foo2.id_matricula,
                foo2.id_programa,
                foo2.id_persona,
                foo2.numero_identificacion,
                foo2.estudiante,
                foo2.celular,
                foo2.correo,
                foo2.id_estudiante,
                foo2.codigo
            ) as foo3
            `
            + condicion +
            `
            order by foo3.nombre  
              `,
            [idPrograma,idSemestre,idPeriodo]
        );
        return response.rows;
    } catch (e) {
        throw error;
        console.log(e);
    }
};

async function obtener_documentos(id_epg,id_programa) {
    try {
        let condicion = ``
        if (id_programa !== '14') {
            condicion = `and cg.valor in ('120','121')`
        }

        const response = await pool.query(`
    SELECT
    texto AS documento,
    ee.id as id_documento,
    p.id as id_persona,
    cg.texto as tipo_documento,
    ee.ruta_documento||''||nombre_documento as ruta_documento,
    ee.justificacion_fecha,
			 CASE
			WHEN (ee.revision = FALSE AND ee.modificacion = true) THEN 'Actualizado'
			WHEN (ee.revision = FALSE AND ee.modificacion = FALSE) THEN 'Rechazado'
			WHEN (ee.revision = TRUE) THEN 'Aprobado'
			WHEN ee.id IS NULL THEN 'Pendiente cargue'
			ELSE 'Pendiente revisión'
		END AS estado_aprobacion,
      ee.fecha_limite_carga
      FROM zeus.combos_generales cg
      LEFT JOIN zeus.expediente_estudiante ee
      INNER JOIN personas p
          INNER JOIN estudiantes e  ON p.id = e.id_persona 
          INNER JOIN estudiantes_epg epg on e.id=epg.id_estudiante and epg.id=$1 and epg.id_periodo_academico=(select valor::int from  parametros_generales where id=129)
      ON ee.id_persona = p.id
      ON cg.valor = ee.tipo_documento  and ee.id_programa=epg.id_programa
      WHERE cg.nombre_combo = 'DOCUMENTOS_PROCESO_GRADO'
      `+ condicion + `
      and cg.estado=true
    `,[id_epg]);
        return response.rows;
    } catch (e) {
        throw error;
        console.log(e);
    }
};


async function aprobar_documentos(id_expediente_estudiante) {
    try {
        var actualizado = true;
        var resultadoE = await pool.query(
            `
            UPDATE 
                zeus.expediente_estudiante
            SET
                revision = true,
                modificacion = false
            WHERE
                id = $1
        `,
            [
                id_expediente_estudiante
            ],
        );

        if (resultadoE.rowCount < 1) {
            actualizado = false;
            console.log("ERROR");
        }
        return { actualizado,message: 'El documento se ha aprobado correctamente.' };
    } catch (error) {
        throw error;
    }
};

async function estudiantesproceso(params) {
    try {
        const idPrograma = params.idPrograma;
        const idPeriodo = params.idPeriodo;
        const idSemestre = params.idSemestre;
        const idModalidad = params.idModalidad;
        //console.log(idPrograma,idPeriodo,idSemestre,idModalidad);
        const response = await pool.query(`
							 SELECT p.id as id_persona, es.id as id_estudiante, pr.nombre as programa, pr.id as idprograma,p.numero_identificacion as documento,  celular, p.correo_electronico,
        epg.semestre,es.codigo,concat(p.primer_apellido,' ',p.segundo_apellido,' ',p.primer_nombre,' ',p.segundo_nombre) as nombre,estado_matricula, id_tg_estado_modalidad as estado_modalidad,
         tgmd.nombre as modalidad , tgmd.id as id_modalidad, epg.id_periodo_academico from estudiantes es INNER JOIN personas p on p.id = es.id_persona inner JOIN programas pr on pr.id = es.id_programa  
        INNER join estudiantes_epg epg on epg.id_estudiante = es.id  INNER JOIN tg_modalidades_grado tgmd on tgmd.id = epg.id_tg_modalidad_grado 
				where  es.id_programa = $1
         and id_periodo_academico = $2
				 and epg.semestre= $3
				and epg.id_tg_modalidad_grado =$4
				 order by nombre asc 
       `,[idPrograma,idPeriodo,idSemestre,idModalidad]
        );
        // console.log(response.rows);
        return response.rows;
    } catch (e) {
        throw error;
        console.log(e);
    }
};

async function solicitarModificacion(id_expediente_estudiante,observaciones) {
    try {
        var actualizado = true;
        var resultadoE = await pool.query(
            `UPDATE zeus.expediente_estudiante SET revision = false,modificacion = false,observacion = $2 WHERE id = $1`,
            [id_expediente_estudiante, observaciones],
        );
        if (resultadoE.rowCount < 1) {
            actualizado = false;
        }
        return { actualizado, message: 'Se ha notificado correctamente.' };
    } catch (error) {
        console.log("errir",error);
    }
};

async function comprobarRequisitosCompletos(req) {
    const id_epg = req.query.id_epg;
    try {
        const { rows } = await pool.query(`SELECT  documentos_completos FROM estudiantes_epg WHERE id = $1`,
            [id_epg],
        );
        return rows;
    } catch (err) {
console.log("error");  
  }
};

async function actualizarDocumentosCompletos(id_epg,idpersona) {
    try {
        var actualizado = true;
        //console.log(id_epg,idpersona,'serice');
        var resultadoE = await pool.query(`UPDATE estudiantes_epg  SET documentos_completos = true , id_persona_adm= $2  WHERE id = $1`,
            [id_epg,idpersona],
        );

        if (resultadoE.rowCount < 1) {
            actualizado = false;
            console.log('(01) ¡Ocurrió un error al intentar actualizar la columna documentos_completos!');
        }

        return { actualizado, message: 'Se ha actualizado documentos_completos.' };
    } catch (error) {
        throw error;
    }
};
async function informacion_documentos_epg(params) {
    try {
    //    const idPrograma = params.id_programa;
    if(params.id_semestre=="null"){
        validar='1'
    }else{validar=params.id_semestre}

        const response = await pool.query(
            `    select 	
            'PROGRAMA-'||p.nombre || 
            ' - Actualizados: ' || foo3."actualizados"|| 
            ', Rechazados: ' || foo3."rechazados"||
            ', Pendientes por revisar: ' || foo3."pendientes_revision"
        as lista
         from (
           select 
             foo2.id_programa,
             count(case when foo2.estado_aprobacion ILIKE 'Actualizado' then true end) as "actualizados",
             count(case when foo2.estado_aprobacion ILIKE 'Rechazado' then true end) as "rechazados",
             count(case when foo2.estado_aprobacion ILIKE 'Pendiente revisión' then true end) as "pendientes_revision"
           from (
             select 
               foo.*,
               CASE
                 WHEN (ee.fecha_limite_carga IS NOT NULL AND ee.ruta_documento = '') THEN ('Pendiente carge hasta: '||ee.fecha_limite_carga::text)
                 WHEN (ee.fecha_limite_carga IS NULL AND ee.justificacion_fecha IS NOT NULL) THEN 'Pendiente fecha límite carga'
                 WHEN (ee.revision = FALSE AND ee.modificacion = true) THEN 'Actualizado'
                 WHEN (ee.revision = FALSE AND ee.modificacion = FALSE) THEN 'Rechazado'
                 WHEN (ee.revision = TRUE) THEN 'Aprobado'
                 WHEN ee.id IS NULL THEN 'Pendiente cargue'
                 ELSE 'Pendiente revisión'
               END AS estado_aprobacion
             from (
               SELECT
                 epg.id AS id_matricula,
                 epg.id_programa ,
                 p.id AS id_persona,
                 p.numero_identificacion,
                 _getpersonname(p.numero_identificacion) AS estudiante,
                 p.celular,
                 p.correo_electronico AS correo,
                 e.id AS id_estudiante,
                 e.codigo,
                 doc.texto as documento,
                 doc.valor as tipo_documento
               FROM
                 estudiantes_epg AS epg
                 INNER JOIN estudiantes AS e
                   on e.id = epg.id_estudiante and epg.id_periodo_academico = $2
                   INNER JOIN personas AS p
                     cross join (
                       select
                         *
                       from zeus.combos_generales as cg
                       where cg.nombre_combo ='DOCUMENTOS_PROCESO_GRADO'  and cg.estado = true
                                                 and cg.valor in ('120','121')
                     ) as doc
                   ON e.id_persona = p.id
               WHERE
                 epg.id_periodo_academico = $2
                 --AND epg.id_programa = $1
                AND epg.semestre = $1
               group by
                 id_matricula,
                 p.id,
                 p.numero_identificacion,
                 estudiante,
                 p.celular,
                 correo,
                 e.id,
                 e.codigo,
                 tipo_documento,
                 documento
             ) as foo
               left join zeus.expediente_estudiante as ee
               on foo.id_persona = ee.id_persona
                 and foo.tipo_documento = ee.tipo_documento
                and ee.id_periodo_academico = $2
             order by foo.estudiante, foo.documento
           ) as foo2
           group by foo2.id_programa
                     ) as foo3
                     INNER JOIN programas p on p.id=foo3.id_programa 
                     GROUP BY p.nombre,foo3.actualizados,foo3.rechazados,foo3.pendientes_revision
              `,
            [validar,params.id_periodo]
        );

        return response.rows;
    } catch (error) {
        throw error;
    }
};


module.exports = {
    obtener_programas,
    estudiantesEPG,
    obtener_documentos,
    listar_periodos,
    aprobar_documentos,
    estudiantesproceso,
    solicitarModificacion,
    comprobarRequisitosCompletos,
    actualizarDocumentosCompletos,
    informacion_documentos_epg
}