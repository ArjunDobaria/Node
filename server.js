const express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    app = express()

app.use(bodyParser.json())
app.use(bodyParser())
app.use(express.static('Images'))

mongoose.connect('mongodb://admin:admin@cluster0-shard-00-00-gvabo.mongodb.net:27017,cluster0-shard-00-01-gvabo.mongodb.net:27017,cluster0-shard-00-02-gvabo.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin',(err,res) => {
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
    return res.json({"msg" : "Success"})
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

//select data from database
app.post('/login',(req,res) => {
    User.findOne({'email' : req.body.email, 'password' : req.body.password},(err,ress) => {
        if(!err && ress != "null"){
            if(ress != null)
            {
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

var multer = require('multer')

//photo upload
var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './Images');
    },
    filename: function (req, file, callback) {
        var ext;
        switch (file.mimetype) {
            case 'image/png':
                ext = 'png';
                break;
            case 'image/jpeg' || 'image/jpg':
                ext = 'jpg';
                break;
        }

        callback(null, `${file.originalname}_${Date.now()}.${ext}`);
    }
});
var upload = multer({ storage : storage});

app.post('/api/photo',upload.single('userPhoto'),function(req,res){

    console.log(req.file.path)

    var myquery = {'email' : email};
    var newvalues = {$set : {'profilepic' : req.file.path}};

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