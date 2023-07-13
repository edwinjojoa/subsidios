const pool = require('../database/connection');

async function consultarestudiante(params) {
    try {
        const codigo = params.codigo;
      //  const dato = JSON.parse(localStorage.getItem('personData'));
// console.log(data, 'dataaa');
        const response = await pool.query(`
 SELECT id_persona, es.id as id_estudiante , codigo , es.id_programa , id_estado_estudiante FROM estudiantes es  
        WHERE codigo =  $1 
    `,[codigo]
        );
        //console.log(response.rows);
        return response.rows;
    } catch (e) {
        throw error;
        console.log(e);
    }
};
async function filtroestudiante(params) {
    try {
        const req = params.filtro;
       // console.log(req);
        const response = await pool.query(`
select
                DISTINCT (p.numero_identificacion),
                p.primer_nombre,
                p.segundo_nombre,
                p.primer_apellido,
                p.segundo_apellido,
                case
                    when prog.id is not null then prog.nombre
                    when (prog.id is null and prog2.id is not null) then prog2.nombre
                    else prog3.nombre
                    end
                as programa,
                _getpersonname(p.numero_identificacion) as nombre_completo,
                e.codigo
             from
                personas p
                    inner join estudiantes e
                        inner join programas prog3
                        on e.id_programa = prog3.id
                        left join estudiantes_plan ep
                            inner join planes_estudio pe2
                                inner join programas prog2
                                on pe2.id_programa = prog2.id
                            on ep.id_plan_estudio = pe2.id
                        on e.id = ep.id_estudiante
                        left join zeus.estudiante_plan_matricula epm
                            inner join planes_estudio pe
                                inner join programas prog
                                on pe.id_programa = prog.id
                            on epm.id_plan_estudios = pe.id
                        on e.id = epm.id_estudiante
                    on p.id = e.id_persona
                    and substring(e.codigo,1,3)!=(select concat(pa.periodo,substring(pa.anio,3,4)) from periodos_academicos pa where estado='3')
             where
                p.numero_identificacion like $1
                or LOWER(coalesce(p.primer_apellido, '') || ' ' || coalesce(p.segundo_apellido, '') || ' ' || coalesce(p.primer_nombre, '') || ' ' || coalesce(p.segundo_nombre, '')) like LOWER('%${req }%') 
                or LOWER(coalesce(p.primer_nombre, '') || ' ' || coalesce(p.segundo_nombre, '') || ' ' || coalesce(p.primer_apellido, '') || ' ' || coalesce(p.segundo_apellido, '')) like LOWER('%${ req }%') 
                or LOWER(coalesce(p.primer_nombre, '') || ' ' || coalesce(p.primer_apellido, '')) like LOWER('%${ req}%') 
             order by
                programa,p.primer_apellido
    `,[req]
        );
        //console.log(response.rows);
        return response.rows;
    } catch (e) {
        throw error;
        console.log(e);
    }
};
async function cambiarestado(params) {
    try {
        const id_estudiante = params.id_estudiante;
        const response = await pool.query(`
 		UPDATE estudiantes SET id_estado_estudiante = 10 where id = $1;
    `,[id_estudiante]
        );
        //console.log(response.rows);
        return response.rows;
    } catch (e) {
        throw error;
        console.log(e);
    }
};
async function agregarperfil(params) {
    try {
        const id_estudiante = params.id_estudiante;
        const id_programa = params.id_programa;
        const perfil = 0
        if (id_programa == 11 || id_programa == 58 || id_programa == 9 || id_programa == 7 || id_programa == 10 || id_programa == 39) {
            this.perfil = 25;
        } else {
            this.perfil = 24;
        }
        const response = await pool.query(`
	INSERT INTO zeus.usuarios_perfiles (fecha_creacion, id_usuario, id_perfil, estado) VALUES (now(), 	
		(select us.id from estudiantes es  inner join  usuarios us
		on es.id_persona= us.id_persona  where es.id = $1), $2, true);
    `,[id_estudiante,this.perfil]
        );
        console.log(this.perfil, 'res');
        return response.rows;
    } catch (e) {
        throw error;
        console.log(e);
    }
};
async function confirmamatricula(params) {
    try {
        const idestudiante = params.idestudiante;
        const idpersona = params.idpersona;
        //console.log(idestudiante);
        const response = await pool.query(`
UPDATE estudiantes_epg SET estado_matricula = true, id_persona_adm= $2  where semestre = '1' and id_periodo_academico = (select valor::INTEGER from parametros_generales where id=129) and id_estudiante = $1
    `,[idestudiante,idpersona]
        );
        //console.log(response.rows);
        return response.rows;

    } catch (e) {
        throw error;
        console.log(e);
    }
};
async function eliminarmatricula(params) {
    try {
        const idestudiante = params.idestudiante;
        //console.log(idestudiante);
        const response = await pool.query(`
    delete from estudiantes_epg where semestre = '1' and id_periodo_academico = (select valor::INTEGER from parametros_generales where id=129)  and id_estudiante = $1
    `,[idestudiante]
        );
        //console.log(response.rows);
        return response.rows;

    } catch (e) {
        throw error;
        console.log(e);
    }
};
async function consultaplanestudios(params) {
    try {
        const idestudiante = params.id_estudiante;
        //console.log(idestudiante);
        const response = await pool.query(`
            select
        (select codigo as idest from estudiantes where id in ($1)) as est,
            count(jmfoo.asig_sem) as total,
            count(jmfoo.asig_apro) as asig --into asignaturas_semestre,asignaturas_aprobadas
        from(
            select
                ape.codigo_siga as asig_sem,
                aa.codigo_siga as asig_apro
            from
                planes_estudio pe inner join
                    asignaturas_plan_estudios ape left join
                        asignaturas_aprobadas aa
                    on ape.codigo_siga = aa.codigo_siga
                    and aa.id_estudiante in         (select id as idest from estudiantes where id in ($1))
                    and aa.aprobado = true
                on pe.id = ape.id_plan_estudios
            where
                pe.id = (select id_plan_estudio from estudiantes_plan where id_estudiante in        (select id as idest from estudiantes where id in ($1) and estado = true limit 1))
                and ape.habilitada = true
                and ape.semestre in (1,2,3,4,5,6,7,8,9,10)
                --and ape.semestre::text in (select explode_array(string_to_array(jm_semestre_new,',')))
        ) as jmfoo;    `,[idestudiante]
        );
        //console.log(response.rows);
        return response.rows;

    } catch (e) {
        throw error;
        console.log(e);
    }
};
async function consultarperiodocursado(params) {
    try {
        const idestudiante = params.id_estudiante;
        //console.log(idestudiante);
        const response = await pool.query(`
	select DISTINCT(id_estudiante) ,   concat(id_estudiante,',' ),id_periodo_academico from asignaturas_aprobadas where id_periodo_academico =86 AND
					 id_estudiante in($1
	)  order by id_periodo_academico desc    `,[idestudiante]
        );
        //console.log(response.rows);
        return response.rows;

    } catch (e) {
        throw error;
        console.log(e);
    }
};
module.exports = {
    consultarestudiante,
    filtroestudiante,
    cambiarestado,
    agregarperfil,
    confirmamatricula,
    eliminarmatricula,
    consultaplanestudios,
    consultarperiodocursado
}