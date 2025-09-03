import { model } from 'mongoose';
import Script from '../models/Script';
import express from 'express'
const router = express.Router();


//GET /api/scripts - get all scripts in the database
router.get('/', async (req, res) => {
    try{
        //get the scripts
        const scripts = await Script.find();
        //sending the scripts as json for the client
        res.json(scripts);
    }
    catch(error){
        console.error('Error getting the scripts in the database',error.message);
        res.status(500).json({message:"Error fetching scripts"});
    }
});

router.post('/', async (req, res) => {
    try{
        const newScript = new Script(req.body);
        // TODO:  Consider making a custom object to return only necessary or allowed fields for security
        const savedScriptResponse = await newScript.save();
        res.status(201).json(savedScriptResponse);
    }
    catch(error){
        console.error("Error adding script to database!", error.message);
        res.status(400).json({message: "Error adding script to database!"});
    }
});




module.exports = router;