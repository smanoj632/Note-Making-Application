const express = require("express");
const fetchuser = require("../middleware/getuser");
const user = require("../models/user");
const { body, validationResult } = require("express-validator");
const Note = require("../models/notes");

const router = express.Router();

// Route 1 : Add a Note , Login required
router.post(
  "/addNote",fetchuser,
  body("title", "Add a valid title").isLength({ min: 3 }),
  body("description", "Add a valid description").isLength({ min: 5 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors });
      }
      let { title, description, tag } = req.body;
      // Checking if same note exists
      let isNote = await Note.findOne({title : title});
      if(isNote){
        return res.status(400).send("A Note with this title already exits");
      }
      let currUser = await user.findOne({email : req.user.email});
      let newNote = await Note.create({
        user : currUser.id,
        title,description,tag
      });
      res.json(newNote);
    } catch (error) {
      res.status(500).json("Internal sever error");
    }
  }
);

//Route 2 : Fetch a Note : login required
router.get('/fetchNote',fetchuser,async (req,res)=>{
  const currUser = await user.findOne({email : req.user.email});
  let notes = await Note.find({user : currUser.id });
  res.json(notes);
})

// Route 3 : Update a Note,login required
router.put('/updateNote/:id',fetchuser,async (req,res)=>{
  const {title,description,tag} = req.body;
  console.log({title,description,tag});
  let newNote = {};
  if(title)newNote.title = title;
  if(description)newNote.description = description;
  if(tag)newNote.tag = tag;
  console.log(req.params.id);
  const currUser = await user.findOne({email : req.user.email});
  let currNote = await Note.findById(req.params.id);
  console.log(currNote);
  console.log(currUser);
  if(!currNote){
    return res.status(400).send("Note does not exist");
  }
  if(currNote.user.toString() !== currUser.id.toString()){
    return res.status(400).send("Not allowed");
  }
  newNote = await Note.findByIdAndUpdate(req.params.id,newNote,{new : true});
  res.json({newNote});
})

//Route 4 : Deleting a Note,login required
router.delete('/deleteNote/:id',fetchuser,async (req,res)=>{
  const currUser = await user.findOne({email : req.user.email});
  const currNote = await Note.findById(req.params.id);
  if(!currNote){
    return res.status(400).send("Note does not exist");
  }
  if(currUser.id.toString() !== currNote.user.toString()){
    return res.status(400).send("Not Allowed");
  }
  await Note.findByIdAndDelete(req.params.id);
  res.json({success : "Note has been delete"});
})
module.exports = router;
