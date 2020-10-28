# img-tiny-url

Develop web app that creates tiny url for uploaded image
## To do List:

What I *think I need to do:
### //********PART 1 UPLOAD DATA TO DATABASE
[x] 1. research how to upload files to mongo db using node.js 
[x] 2. Max img size 10MB                                    
[x] 3. accept different file types                         
[x] 4. server side binary upload                            
[x] 5. convert to data blob                                 
[x] 6. store it in mongo db, use atlas                    

### //**********PART 2 CREATE THE URL AND MAKE THE LINK WORK
[x] 1. research software on how to create tiny urls          
[x] 2. create alphanumeric characters (e.g.A23hs5)          
[x]   a. update the urls into database                     
[x]   b. make it so that if the short url is searched, the server redirects to the long url


### //**********PART 3 UI
[x] 1. Make a template html file to display as endpoint for hte tinyurl  
[ ] 2. look up tutorial on prepping your html code so that search engines can properly work with data from your page
[ ] 3. add proper tags for Google and open graph protocol for hte UI that will be served for the html code  
[x] 4. do research on how to use bootstrap              
[x] 5. create a nice UI using bootstrap for the app.
[x] 6. make and use a logo for the app 

### //**********PART 4 PUBLISH
[x] 1. deploy it on a free server                    


###//***Notes:
1. Didn't have time to research more on the open graph protocol and google tags.
2. There were some things on the original promt that I wasn't sure about, namely bullet 3: "run server side binary...".
3. I should refactor the code for more readability
4. I should make it so the first visit to the site renders the url list
5. make it so that unique users only see their respective uploads
6. add a way to delete 
8. figure out if it's possible to completely separate the backend from the frontend for this app
