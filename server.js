const express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    app = express(),
    path = require('path'),
    multer = require('multer')

var ext;
var filaeName;

app.use(bodyParser.json())
app.use(bodyParser())
app.use(express.static(__dirname + '/Images/'))

mongoose.connect('mongodb://localhost:27017/users',(err,res) => {
    if(!err){
        return console.log("database connection successfully")
    }
    else{
        return console.log(err)
    }
})

let userSchema = mongoose.Schema({
    email : String,
    password : String,
    name : String,
    mobilenumber : String,
    profilepic : String
})

let User = mongoose.model('User', userSchema)

//Simple get request
app.get('/',(req,res) => {
    User.find({},(err,ress) => {
        if(!err){
            res.json({"msg" : ress})
        }
        else
        {
            res.json({"error" : err})
        }

    })
})

//insert data into database
app.post('/register',(req,res) => {

    User.findOne({'email' : req.body.email},(err,user) => {

        if(user){
            return res.json({"error" : "Email address already exists"})
        }
        else{
            let newUser = User()
            newUser.email = req.body.email
            newUser.password = req.body.password
            newUser.name = req.body.name
            newUser.mobilenumber = req.body.mobilenumber
            newUser.profilepic = req.body.profilepic

            newUser.save((err,ress) => {
                if(!err)
                {
                    return res.json({"msg" : ress})
                }
                else
                {
                    return res.json({"error" : err})
                }
            })
        }
    })
})

//searching data in mongodb
app.post('/search',(req,res) => {
   let searchStr = req.body.email;
   console.log({'email' : {$regex : searchStr}})
    User.find({'email' : {$regex : req.body.email}},(err,ress) => {
        if(!err)
        {
            console.log(ress)
            return res.json({"msg" : ress})
        }
        else{
            return res.json({"error" : err})

        }

    })
})

//select data from database
app.post('/login',(req,res) => {
    console.log("Hello")
    User.findOne({'email' : req.body.email, 'password' : req.body.password},(err,ress) => {
        if(!err && ress != "null"){
            if(ress != null)
            {
                console.log(ress.email)
                return res.json({"msg" : ress})
            }else{
                return res.json({"error" : "Please register first"})
            }

        }
        else{
            //if user not found it will send the response 'null'
            return res.json({"error" : "Please register first"})
        }
    })
})

//update data in database
var email = ""
app.post('/update',(req,res) => {
    email = req.body.email
    var myquery = {'email' : req.body.email};

    var newvalues = {$set : {'password' : req.body.password, 'name' : req.body.name, 'mobilenumber' : req.body.mobilenumber, 'profilepic' : req.body.profilepic}};

    User.updateOne(myquery, newvalues, (err,ress) => {
        if(!err) {
            return res.json({"msg" : ress})
        }
        else{
            return res.json({"error" : "could not update"})
        }
    })
})

//delete data from database
app.post('/delete',(req,res) => {
    User.deleteOne({'email' : req.body.email, 'password' : req.body.password}, (err,ress) => {
        if(!err){
            return res.json({"msg" : ress})
        }else{
            return res.json({"error" : "Could not delete"})
        }
    })
})


//photo upload
var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null,'./Images');
    },
    filename: function (req, file, callback) {

        switch (file.mimetype) {
            case 'image/png':
                ext = 'png';
                break;
            case 'image/jpeg' || 'image/jpg':
                ext = 'jpg';
                break;
        }
    fileName = `${file.originalname}_${Date.now()}.${ext}`
        callback(null, fileName);
    }
});
var upload = multer({ storage : storage});

//Image save here in database
app.post('/api/photo',upload.single('userPhoto'),function(req,res){

    var myquery = {'email' : email};
    var newvalues = {$set : {'profilepic' : fileName}};

    User.updateOne(myquery, newvalues, (err,ress) => {
        if(!err) {
            return res.json({"msg" : ress})
        }
        else{
            return res.json({"error" : "could not update"})
        }
    })
});


var port = process.env.PORT || 8552
app.listen(port,() => {
    console.log('server started')
})

module.exports = {
    app
}