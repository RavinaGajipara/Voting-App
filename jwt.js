const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtAuthMiddleware = (req,res,next)=>{
    // first check request headers has authorization or not 
    const authHeader = req.headers.authorization;
    if(!authHeader) {return res.status(401).json({error:' token not found'});
}
    //EXtract the jwt token from the request header
    const token = authHeader.split(' ')[1];
    if(!token) return res.status(401).json({error: 'UNauthorized'});

    try{
        //Verify Jwt token
        const decoded=jwt.verify(token, process.env.JWT_SECRET);

        //Attach user information to the request object
        req.user =decoded;
        next();
    }catch(err){
        console.log(err);
        res.status(401).json({err: 'Invalid token'});   
    }
}

//function to generate JWT token
const generateToken = (userData)=>{
    //generate a new JWT token using user data
    return jwt.sign(userData,process.env.JWT_SECRET);

}

module.exports = {jwtAuthMiddleware, generateToken};