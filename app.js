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
const morgan = require('morgan');
const dotenv = require('dotenv');

//env variables configuration
dotenv.config({ path: './config.env' });

//express object to use as server
const app = express();

//MIDDLEWARE
app.use(express.json());

app.use(morgan('dev'));

app.use(methodOverride('_method'));

app.use(express.static('img'));


/*MONGODB CONNECTION*/
//mongo uri
const mongoURI = 'mongodb+srv://carlos:Qwerty123@cluster0.1q1gw.mongodb.net/<dbname>?retryWrites=true&w=majority';
//create mongo connection
const conn = mongoose.createConnection(mongoURI, 
  {
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  }, 
    (err) => {
      console.log('connected to Mongo database...');
});

//Init GRIDFS
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
          
          //generate the random url path
          let randomString = shortID.generate();
          randomString = randomString.replace(/_|-/g, "");
          randomString = randomString.slice(0, -2);
          
          //generate unique filename wiht randombytes
          const filename = buf.toString('hex') + path.extname(file.originalname);
          
          //create fileInfo object to resolve 
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads',
            //add tiny url in metadata
            metadata: `img-tiny-url-maker.herokuapp.com/${randomString}`
            
          };
          resolve(fileInfo);
        });
      });
    }
  });

  //look for valid file types ONLY
  const fileFilter = (req, file, cb) => {
    const type = file.mimetype;
    
    //check for valid mimetype
    if (type === 'image/jpeg' || type === 'image/png' || type === 'image/heic' || type === 'image/heif' ||
    type === 'image/webp' || type === 'image/svg' || type === 'application/pdf' || type === 'image/gif') {
        cb(null, true);
    
      //check that image size < 10MB
      }else if(((req.headers['content-length']*1)-imgSizeCorrection) > 10000000) {
        console.log('Invalid, image size too large...');
        cb(null, false);
    }
    else {
        console.log('invalid file type...');
        cb(null, false);
    }
  }

  const upload = multer({ storage , fileFilter});


//UI CONTROLLER DATA AND FUNCTIONS
let data = [];

//load endpoint html, index.html
let indexHTML = fs.readFileSync(`${__dirname}/views/index.html`, 'utf-8');
let endHTML = fs.readFileSync(`${__dirname}/views/img.html`, 'utf-8');
let tableTemplate = fs.readFileSync(`${__dirname}/views/table-template.html`, 'utf-8');
let indexTemplate = fs.readFileSync(`${__dirname}/views/index-template.html`, 'utf-8');

const updateMarkup = (html, obj) => {

  let resHtml = html.replace(/{LONG}/g, obj.longUrl);
  resHtml = resHtml.replace(/{FILENAME}/g, obj.fileName);
  resHtml = resHtml.replace(/{SHORTURL}/g, obj.shortUrl);

  return resHtml;

}


//ROUTES
//GET, render home page
app.get('/', (req, res) => {
    res.status(201).end(indexHTML);
});

//POST, upload the file to mongoDB
app.post('/upload', upload.single('file') , (req, res) => {
    try{
        
        //store url information to update UI
        data.push({longUrl: `img-tiny-url-maker.herokuapp.com/img/${req.file.filename}`, shortUrl: `${req.file.metadata}`, fileName: `${req.file.filename}`});

        //update URLs on UI
        const table = data.map(el => updateMarkup(tableTemplate, el)).join('');
        const indexUpdate = indexTemplate.replace(/{TABLE}/g, table);

        res.status(200).end(indexUpdate);
        
        
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


//GET render the endpoint html file
app.get(`/img/:filename`, (req, res) => {

    let output = endHTML.replace(/{PATH}/g, req.params.filename);
    
    res.status(201).end(output);

});

//GET redirect the short url
app.get(`/:shortUrl`, (req, res) => {
  
  gfs.files.findOne({"metadata": `localhost:5000/${req.params.shortUrl}`}, (err, file) => {
    //check if file exists/
    if(!file || file.length === 0){
        return res.status(404).json({
            message: "no such file exists.."
        });
    }
    const redirectAddress = `img/${file.filename}`;

    res.status(201).redirect(`/${redirectAddress}`);
  });
});


//INITIALIZE APP

//define port number
const port = process.env.PORT || 3000;

//launch server
app.listen(port, () => {
  //console.log(`Server listening on port ${port}`);
});
