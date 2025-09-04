import Script from '../models/Script.js';
import express from 'express'
const router = express.Router();


//GET /api/scripts - get all scripts in the database
router.get('/', async (req, res) => {
    try {
        //get the scripts
        const scripts = await Script.find();
        //sending the scripts as json for the client
        res.json(scripts);
        console.log(`Scripts fetched from the database: ${scripts.length} scripts.`);
    }
    catch (error) {
        console.error('Error getting the scripts in the database', error.message);
        res.status(500).json({ message: "Error fetching scripts" });
    }
});

//POST /api/scripts - add a new script to the database
router.post('/', async (req, res) => {
    try {
        const newScript = new Script({ ...req.body, rating: 0.0, reviews: 0 });
        // TODO:  Consider making a custom object to return only necessary or allowed fields for security
        const savedScriptResponse = await newScript.save();
        res.status(201).json(savedScriptResponse);
    }
    catch (error) {
        console.error("Error adding script to database!", error.message);
        res.status(400).json({ message: "Error adding script to database!" });
    }
});




export default router;