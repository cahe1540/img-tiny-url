const express = require('express');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const fs = require('fs');
const shortID = require('shortid');

//express object to use as server
const app = express();

//middleware
app.use(express.json());

app.use(methodOverride('_method'));

app.set('view engine', 'ejs');

//mongo uri
const mongoURI = 'mongodb+srv://carlos:Qwerty123@cluster0.1q1gw.mongodb.net/<dbname>?retryWrites=true&w=majority';

//urls
let longURL;
let tinyURL;

//load endpoint html
let endHTML = fs.readFileSync(`${__dirname}/views/img.html`, 'utf-8');

//create mongo connection
const conn = mongoose.createConnection(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true }, (err)=>{
    console.log('connected to Mongo database...');
});

//Init gfs
let gfs;

conn.once('open', ()=>{
    //Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});


//create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
    
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });

  //look for valid file types ONLY
  const fileFilter = (req, file, cb) =>{
    const type = file.mimetype;
    if (type === 'image/jpeg' || type === 'image/png' || type === 'image/heic' || type === 'image/heif' ||
    type === 'image/webp' || type === 'image/svg' || type === 'application/pdf' || type === 'image/gif') {
        cb(null, true);
    }else {
        console.log('invalid file type...');
        cb(null, false);
    }
  }

  const upload = multer({ storage , fileFilter});

//ROUTES
//GET, render home page
app.get('/', (req, res) => {
    res.render('index');
});


//POST, upload the file to mongoDB
app.post('/upload', upload.single('file') , (req, res) => {


    try{

        console.log(req.file);


        //generate the long url name for endpoint
        longURL =  "localhost:5000/img/"+ req.file.filename;

        //generate the tiny url name that corresponds to the long url
        const randomString = shortID.generate();
        shortURL = 'localhost:5000/' + randomString;
        
        //data that needs to be updated
        const data = {"shortURL": shortURL, "longURL": longURL}; 
       /** I would need to PATCH within POST.. need to change method
         * of posting so that this data is ready.
         */
        
    
        //redirect back to home page
        res.redirect('/');

    }catch(error){
        console.log("invalid file type");
    };
});

//GET, to file/:filename
app.get('/image/:filename',  (req, res) => {
    
    gfs.files.findOne({filename: req.params.filename}, (err, file) => {

        //check if file exists
        if(!file || file.length === 0){
            return res.status(404).json({
                message: "no such file exists.."
            });
        }

        //render the image
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
    });
});


//GET render the image embedded in URL page
app.get(`/img/:filename`, (req, res) => {

    let output = endHTML.replace(/{PATH}/g, req.params.filename);

    res.end(output);

});


const port = 5000;

//initialize app
app.listen(port, () => console.log(`Server listening on port ${port}`));


