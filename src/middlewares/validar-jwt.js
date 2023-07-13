const { response } = require("express");
const jwt = require('jsonwebtoken')

const validarJWT = (req, res = response, next) => {

    let token = req.header('authorization')

    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: 'error en el token'
        })
    }


    try {
        token=token.replace('Bearer ','');
        const { uid, name } = jwt.verify(token, process.env.AUTH_JWT_SECRET);
       // console.log(uid, name);

        req.uid = uid,
            req.name = name

    } catch (error) {
        return res.status(401).json({
            ok: false,
            msge: 'token no valido'
        })
    }

    //si todo sale  bien llamamos el next
    next()
}

module.exports = {
    validarJWT
}