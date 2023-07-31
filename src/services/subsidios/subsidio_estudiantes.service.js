const pool = require('../../database/connection');

async function buscarEstudiante(params) {
    try {
        //const codigo = params.codigo;
      //  const dato = JSON.parse(localStorage.getItem('personData'));
// console.log(data, 'dataaa');
        const response = await pool.query(`
        SELECT 
        
				DISTINCT p.numero_identificacion,
        "_getpersonname"(p.numero_identificacion) as nombres,
        p.correo_electronico,
        p.direccion,
        p.celular,
        n.sisben,
				prg.nombre,
				s.jornada,
				s.numero
        from personas p
        INNER JOIN subsidios sub ON p.id=sub.id_persona
        INNER JOIN nucleos_familiares n ON p.id=n.id_persona 
				INNER JOIN estudiantes e on p.id=e.id_persona
				INNER JOIN zeus.matriculas m on e.id=m.id_estudiante
				INNER JOIN semestres  s on s.id=m.id_semestre
				INNER JOIN programas prg on prg.id=e.id_programa
				WHERE m.id_periodo_academico=(SELECT id from periodos_academicos WHERE estado=2)
				limit 100
				`,//[codigo]
        );
        //console.log(response.rows);
        return response.rows;
    } catch (e) {
        throw error;
        
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
				`,[true]
        );
        //console.log(response.rows);
        return response.rows;
    } catch (e) {
        throw error;
        
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


module.exports = {
    buscarEstudiante,
    obtener_TiposDocumentos,
    filtroestudiante
    
}