import Script from '../models/Script.js';
import express from 'express'
const router = express.Router();
import { ensureAuthenticated } from './auth.js';
import multer from 'multer';
import AWS from 'aws-sdk'
//for generating unique file names
import { v4 as uuidv4 } from 'uuid'

//We need to have AWS set up to upload the executables to Amazon S3 
// Configure AWS SDK
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

//Multer setup for file uploads(it unpacks multipart/form-data into req.file or req.files and req.body)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50MB
 });




//GET /api/scripts - get all scripts in the database
router.get('/', async (req, res) => {
    try {
        //get all the scripts from the 'scripts' collection
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
router.post('/', ensureAuthenticated, upload.array('scriptFiles', 10), async (req, res) => {
    try {
        //take the files from the request 
        let files = req.files;
        if (!files || files.length === 0) {
            if(req.file){
                return res.status(400).json({ message: 'No files uploaded, but req.file is valid!' });
            }
            return res.status(400).json({ message: 'No files uploaded!' });
        }
        // Upload each file to S3 and collect the file keys in an array, then add the fileKeys to the script document
        const uploadPromises = files.map((file) => {
            const fileKey = `${uuidv4()}-${file.originalname}`;
            const uploadParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: fileKey,
                Body: file.buffer
            };
            return s3.upload(uploadParams).promise().then(data => data.Key);
        });

        const fileKeys = await Promise.all(uploadPromises);
        // Create a new script document, create it with the necessary fields only to avoid unwanted data
        const newScript = new Script({
            name: req.body.name,
            description: req.body.description,
            longDescription: req.body.longDescription,
            version: req.body.version || '1.0.0',
            category: req.body.category,
            type: 'community',
            author: req.user.username,
            tags: req.body.tags,
            parameters: JSON.parse(req.body.parameters || '[]'), 
            outputExtension: req.body.outputExtension || 'none',
            executable: req.body.executable,
            fileKeys: fileKeys,
            downloads: 0,
            rating: 0,
            ratingCount: 0,
        });
        const savedScriptResponse = await newScript.save();
        res.status(201).json(savedScriptResponse);
    }
    catch (error) {
        console.error("Error adding script to database!", error.message);
        res.status(400).json({ message: "Error adding script to database!" , error:error});
    }
});


//GET /api/scripts/:id/download - get a specific script's executable file from S3
router.get('/:id/download', ensureAuthenticated, async (req, res) => {
    try{
        //find the script by the id in the url
        const script = await Script.findById(req.params.id);
        if(!script){
            return res.status(404).json({message:'Script not found in the database!'});
        }

        //get the temporary links
        const urlPromises = script.fileKeys.map((key)=>{
            const downloadParams = {
                Bucket:process.env.AWS_BUCKET_NAME,
                Expires:60,
                Key:key
            };

            return s3.getSignedUrlPromise('getObject', downloadParams);
        });

        const links = await Promise.all(urlPromises);
        //send the links to the client
        res.send({urls:links});

    }
    catch(error){
        console.error(error);
        res.status(500).json({message:'Cannot download links for S3!'});
    }
});




export default router;