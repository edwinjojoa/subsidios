const pool = require('../database/connection');

const  getClientes = async() => {
      try {
        const response = await pool.query(`
        select 
        '758' as emp_codi,
        ti.abreviatura as tip_codi,
        p.numero_identificacion AS ter_coda,
        'solo si es nit' as ter_dive,
        p.primer_nombre ||' '|| COALESCE(p.segundo_nombre,'') AS ter_nomb,
        p.primer_apellido ||' '|| COALESCE(p.segundo_apellido,'') AS ter_apel,
        'Nombre comercial del tercero' as ter_noco,
        'Código módulo' as mod_codi,
        ps.codigo as pai_codi,
        dep.codigo as dep_codi,
        mun.codigo as mun_codi,
        p.direccion ||' '|| COALESCE(p.barrio,'') as ter_dire,
        p.celular AS ter_ntel,
        p.correo_electronico as ter_mail,
        '0' as ter_nfax,
        'Si' AS ter_audp
        from personas p
        INNER JOIN tipos_identificacion ti ON p.id_tipo_identificacion = ti.id 
        INNER JOIN municipios mun INNER JOIN departamentos dep 
        INNER JOIN paises ps ON dep.id_pais = ps.id ON mun.id_departamento =dep.id ON p.id_lugar_nacimiento= mun.id limit 10 `);
        //console.log(response.rows);
        return response.rows;
        
    }catch(e){
        throw error;
        console.log(e);
    }
  };


  const getClientesId = async() => {
        try {
          const id = parseInt(req.params.id);
          const response = await pool.query(
          `	SELECT
          'codigo empresa' as emp_codi,
          ti.abreviatura as tip_codi,
          p.numero_identificacion AS ter_coda,
          0 as cli_dive,
          p.primer_nombre ||' '|| COALESCE(p.segundo_nombre,'') AS cli_nomb,
          p.primer_apellido ||' '|| COALESCE(p.segundo_apellido,'') AS cli_apel,
          'Nombre comercial del tercero' as cli_noco,
          'Código módulo' as mod_codi,
          ps.codigo as pai_codi,
          dep.codigo as dep_codi,
          mun.codigo as mun_codi,
          'string' as cli_coda,
          0 as tcl_codi,
          0 as cal_codi,
          0 as coc_codi,
          0 as cim_codi,
          'string' as arb_csuc,
          p.direccion ||' '|| COALESCE(p.barrio,'') as dcl_dire,
          p.celular AS dcl_ntel,
          P.correo_electronico as dcl_mail,
          0 as dcl_nfax,
          'string' as arb_clte,
          'S' AS cli_inna,
          0.0 as ven_codi,
          'string' as arb_ccec,
          0 as lis_codi,
          'string ' as dcl_obse,
          'string ' as dcl_apar,
          'string ' as dcl_cloc,
          'string ' as cli_anex,
          'string ' as cli_hpra,
          0 as cli_fecm,
          0 as cli_feca,
          'S' as cli_audp,
          'string' as Authorization
          FROM
          personas p
          INNER JOIN tipos_identificacion ti
          ON p.id_tipo_identificacion = ti.id
          LEFT JOIN municipios mun
          LEFT JOIN departamentos dep
          LEFT JOIN paises ps
          ON dep.id_pais = ps.id
          ON mun.id_departamento =dep.id
          ON p.id_lugar_nacimiento= mun.id
          WHERE
          p.numero_identificacion = $1`,[id]);
      
         // console.log(response.rows);
          return res.send(response.rows);
          
      }catch(e){
          //console.log(e);
          return res.status(500).json('Internal server error');
      }
  };
///////////////

async function verdatospersonalesEPG(params) {
  try {
    //console.log(params,'params');
    const id_estudiante = params.id_estudiante;
    //console.log(id_persona);
    const response = await pool.query(`
	select pe.primer_nombre , pe.segundo_nombre, pe.primer_apellido, pe.segundo_apellido, pe.numero_identificacion,
  concat(pe.primer_apellido,' ',pe.segundo_apellido,' ',pe.primer_nombre,' ',pe.segundo_nombre) as nombre_estudiante,
				 pe.id as id_persona, pe.barrio,  pe.correo_electronico, pe.celular, pe.telefono, pe.direccion, pe.vivienda_propia, pr.nombre, pr.id as id_programa , es.codigo,es.id as id_estudiante,
         	case 	when id_estado_estudiante = 3 then 'Estudiante' 
				when id_estado_estudiante = 10 then 'Estudiante Proceso Grado' 
								when id_estado_estudiante = 11 then 'Titulado' 
								when id_estado_estudiante = 9 then 'Retirado' 
				else 'otros'
				end as estado_estudiante ,es.id_estado_estudiante,
				   to_char(pe.fecha_nacimiento, 'yyyy-mm-dd') as fecha_nacimiento,
      to_char(pe.fecha_expedicion, 'yyyy-mm-dd') as fecha_expedicion,
				 pe.id_lugar_nacimiento,pe.id_lugar_expedicion, pe.id_lugar_radicacion, mun.nombre as expedicion, mun2.nombre as nacimiento, pe.eps
        from personas pe inner join estudiantes es on pe.id = es.id_persona
        inner join programas pr on pr.id = es.id_programa inner join municipios mun on mun.id = pe.id_lugar_expedicion
				inner join municipios mun2  on mun2.id = pe.id_lugar_nacimiento
				where es.id = $1 ;`,[id_estudiante]
    );
    return response.rows;
  } catch (e) {
    throw error;
    console.log(e);
  }
};
async function insertarEPG(params) {
  try {
    const modalidad = params.modalidad;
    const programa = params.programa;
    const semestre = params.semestre;
    const id_estudiante = params.id_estudiante;
    const id_persona_adm = params.id_persona_adm;

    console.log(params);
    const response = await pool.query(`
    INSERT INTO estudiantes_epg (id_estudiante,id_tg_modalidad_grado, semestre, id_periodo_academico, fecha_matricula, estado_matricula, estado_pago, id_programa,documentos_completos, id_persona_adm ) 
     VALUES ( $4,$1,$2,(select valor::INTEGER from parametros_generales where id=129),now(),'f','f',$3,false, $5); `,[modalidad,semestre,programa,id_estudiante, id_persona_adm]
    );
    //console.log(response.rows);
    return response.rows;

  } catch (e) {
    throw error;
    console.log(e);
  }
};
  async function updatedatospersonales(params) {
  try {
    const barrio = params.barr;
    const direccion = params.dir;
    const telefono = params.tel;
    const correo = params.corr;
    const expedicion = params.exped;
    const id_persona = params.id_persona;
    const response = await pool.query(`
    UPDATE personas SET  barrio = $1, direccion = $2  , celular = $3, correo_electronico = $4 ,id_lugar_radicacion = $5 WHERE id = $6;`,[barrio,direccion,telefono,correo,expedicion,id_persona]
    );
    //console.log(response.rows);
    return response.rows;

  } catch (e) {
    throw error;
    console.log(e);
  }
};/////////////////////////////////////////////////////////////////////////////////////////////////////////

async function consultarmatricula(params) {
  try {
    const id_estudiante = params.id_estudiante;
    const response = await pool.query(`
SELECT p.id as id_persona, es.id as id_estudiante, pr.nombre as prog, pr.id as programa,p.numero_identificacion as documento,
        epg.semestre,es.codigo,concat(p.primer_apellido,' ',p.segundo_apellido,' ',p.primer_nombre,' ',p.segundo_nombre) as nombre,estado_matricula,
        				 case when estado_matricula =false then 'PENDIENTE' when estado_matricula = true then 'CONFIRMADO' end as nom_estado_matricula,
         tgmd.nombre as modalidad , tgmd.id as id_modalidad from estudiantes es INNER JOIN personas p on p.id = es.id_persona inner JOIN programas pr on pr.id = es.id_programa  
        INNER join estudiantes_epg epg on epg.id_estudiante = es.id  INNER JOIN tg_modalidades_grado tgmd on tgmd.id = epg.id_tg_modalidad_grado where es.id = $1 
         and id_periodo_academico = (select valor::INTEGER from parametros_generales where id=129) order by epg.id desc limit 1
    `,[id_estudiante]
    );
    //console.log(response.rows, ' consultar matricula');
    return response.rows;

  } catch (e) {
    throw error;
    console.log(e);
  }
};
async function obtenerpaises() {
  try {
    const response = await pool.query(`
    SELECT id, nombre As pais,codigo FROM paises WHERE activo = true  ORDER BY nombre;
    `
    );
    //console.log(response.rows);
    return response.rows;

  } catch (e) {
    throw error;
    console.log(e);
  }
};
async function obtenerdepartamentos(params) {
  try {
    const pais = params.pais;
    const response = await pool.query(`
SELECT id, nombre As departamento,  id_pais FROM   departamentos WHERE     id_pais = $1 ORDER BY nombre;
    `,[pais]
    );
    //console.log(response.rows);
    return response.rows;

  } catch (e) {
    throw error;
    console.log(e);
  }
};
async function obtenermunicipios(params) {
  try {
    const departamento = params.departamento;
    const response = await pool.query(`
    SELECT id, nombre As municipio, id_departamento FROM  municipios WHERE  id_departamento = $1 ORDER BY nombre;
    `,[departamento]
    );
   // console.log(response.rows);
    return response.rows;

  } catch (e) {
    throw error;
    console.log(e);
  }
};
async function transformarubicacionciudad(params) {
  try {
    const municipio = params.municipioid;
    const response = await pool.query(`
           SELECT
        m.id as municipioid,
        m.nombre as municipio,
        d.id as regionid,
        d.nombre as region,
        p.id as paisid,
        p.nombre as pais
        FROM
        municipios m
        INNER JOIN departamentos d
          INNER JOIN paises p
          ON p.id = d.id_pais
        ON d.id = m.id_departamento
        WHERE
        m.id = $1
    `,[municipio]
    );
   // console.log(response.rows);
    return response.rows;

  } catch (e) {
    throw error;
    console.log(e);
  }
};
async function consultaridestudiante(params) {
  try {
    const id_persona = params.id_persona;
    const response = await pool.query(`
    SELECT id_persona, es.id as id_estudiante , codigo , es.id_programa , id_estado_estudiante FROM estudiantes es  
        WHERE id_persona =  $1 and activo = true and id_estado_estudiante = 10
    `,[id_persona]
    );
    //console.log(response.rows, 'consultar id estudiante');
    return response.rows;

  } catch (e) {
    throw error;
    console.log(e);
  }
};
async function consultarsemestre(params) {
  try {
    const id_estudiante = params.id_estudiante;
    const response = await pool.query(`
    select 
    case 
    when semestre = '1' then '2'
     when semestre = '2' then '3'
     when semestre = '3' then '4'
     when semestre = '4' then '0'
     --when semestre  is null or EMPTY  then '1'
     ELSE '1'
    end as semestre 
     from estudiantes_epg where id_estudiante =$1;
    `,[id_estudiante]
    );
    //console.log(response.rows, 'consultar id estudiante');
    return response.rows;

  } catch (e) {
    throw error;
    console.log(e);
  }
};
  module.exports = {
 
    getClientes,
    getClientesId,
    verdatospersonalesEPG,
    insertarEPG,
    updatedatospersonales,
    consultarmatricula,
    obtenerpaises,
    obtenerdepartamentos,
    obtenermunicipios,
    transformarubicacionciudad,
    consultaridestudiante,
    consultarsemestre
  };