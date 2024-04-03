const jwt = require('jsonwebtoken');
require('dotenv').config();
const fetchuser = (req,res,next)=>{
    try {
        const token = req.header('Authorization');  // getting header from request header
        const payload = jwt.verify(token,process.env.JWT_SECRET_KEY); // getting user data from token
        req.user = payload.user;  // appending it into request obj for further use
    } catch (error) {
        res.status(401).send("Please authenticate using valid token");
    }
    next();
}
module.exports = fetchuser;