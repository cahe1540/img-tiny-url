# img-tiny-url

Develop web app that creates tiny url for uploaded image [Check it out](https://img-tiny-url-maker.herokuapp.com/)

### Languages, Frameworks, Libraries or other technologies used
* HTML, CSS, JS
* node.js, express, multer, mongoose

### Description
This app allows the user to upload an image to a MongoDB database using an express server. This is done via multer. The database connection to the app is facilitated using mongoose. Each uploaded image is assigned a URL that the express server uses to retrieve and render the image. The server takes care of retrieving the image and rendering the image using template end point html files. When the target short url is input to the browser, the server redirects to the correct long url. All pages related to this app are rendered via server side rendering. Bootstrap and jQuery are used to create the UI.

### Notes
If anyone wishes to download this for learning purposes or even to expand to it, feel free to do so.
