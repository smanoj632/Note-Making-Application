// importing required modules
const express = require("express");
const user = require("../models/user");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/getuser')
require('dotenv').config();
const {body, validationResult } = require("express-validator");
const router = express.Router();
// Route 1 : Creating Create user endpoint : No login required
router.post(
  "/createUser",
  //Validating for constraints on input fields
 body("name", "Enter a valid name").isLength({ min: 3 }), 
 body("email", "Enter a valid email").isEmail(),
 body("password", "password should be atleast 5 chars long").isLength({
    min: 5,
  }),
  async (req, res) => {
    // Encapsulating whole response in try catch block
    try{
    const errors = validationResult(req);
    let success = false;
    // sending error if input fields are not correct
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }
    // Checking if a user email already exists
    let isUserEmail = await user.findOne({email : req.body.email});
    if(isUserEmail){
        return res.status(400).send({success,msg :"A User Already exists with this email"});
    }
    // Encrypting the user password
    let securePass = req.body.password;
    const salt = await bcrypt.genSalt(10);
    securePass = await bcrypt.hash(securePass,salt);
    req.body.password = securePass;
    // Creating a new user and sending it as response
    let newUser = await user.create(req.body);
    const payload = {
      user : {
        email : newUser.email
      }
    }
    //Sending jwt token to user 
    const authToken = jwt.sign(payload,process.env.JWT_SECRET_KEY);
    success = true;
    res.json({success,authToken});
// Sending error if some internal error occurs
    }catch(error){
        res.status(500).send("Some internal server error occured");
    }      
  }
);

// Route 2 : Creating Login Endpoint : No login required
router.post('/login',
body("email","Enter a valid email").isEmail(),
body("password","Don't enter a blank string").exists(),
async (req,res)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors : errors});
  }
  let {email,password} = req.body;
  let success = false;
  // Checking for email
  let currUser = await user.findOne({email});
  if(!currUser){
    return res.status(400).send({success,msg : "Login using correct credentials"});
  }
  // verifying password
  let passwordCompare = await bcrypt.compare(password,currUser.password);
  if(!passwordCompare){
    res.status(400).send({success,msg : "Login using correct credentials"});
  }
  const payload = {
    user : {
      email : currUser.email
    }
  }
  //Sending jwt token to user 
  const authToken = jwt.sign(payload,process.env.JWT_SECRET_KEY);
  success = true;
  res.json({success,authToken});
})

// Route 3 : Get user details using token : login required
router.post('/getUser',fetchuser,async (req,res)=>{
   try{
    const email = req.user.email;
    const currUser = await user.find({email : email}).select("-password");
    res.json(currUser);
   }catch(err){
    res.status(500).send("Internal sever error");
   }
})
module.exports = router;
