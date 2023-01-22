const jwt= require('jsonwebtoken');

const verifyToken= (req, res, next)=>{
    const token= req.headers.token.split(" ")
   jwt.verify(token[1], process.env.KEY_ACCESS_TOKEN, (err, data)=>{
        if(err){

            res.status(403).json(err);
            
            return;
        }
        req.user = data;
        next()
    })
}

module.exports= verifyToken;