var express = require("express")
var app = express()
const path = require("path")
app.set("view engine", "ejs")
app.set("views", "./views")
app.use(express.static("public"))
app.listen(3000, () => {
    console.log("Dang lang nghe cong 3000");

})

//connect mongoDB atlas
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://anhpv:<password>@cluster0.et3z1.mongodb.net/Magics?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true}, function(err){
    if(err){
        console.log("Mongo connect erro: ", err)
    }else{
        console.log("Mongo connected successfully")
    }
});

var bodyParser = require("body-parser")
//Using body-parser
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())

//Using multer
var multer = require("multer")
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.resolve("public", "upload"))
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname)
    }
})
var upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        console.log(file);
        if (file.mimetype == "image/bmp" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
            cb(null, true)
        } else {
            return cb(new Error('Only image are allow'))
        }
    }
}).single("magicImage")

var Magic = require("./models/magic")
const Cha = require("./models/cha")
const Con = require("./models/con")






app.get("/add", function(req, res) {
    res.render("add")
})

app.post("/add", function(req, res) {
    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            res.json({"result": 0 ,"err":"A Multer error occurred when uploading"})
        } else if (err){
            res.json({"result": 0 ,"err":" An unknow error occurred when uploading." + err})
        }else{
            var magic = Magic ({
                name: req.body.txtName,
                image: req.file.filename,
                level: req.body.txtLevel
            })
            magic.save(function(err){
                if(err){
                    res.json({"result":0, "errMsg":err})
                }else{
                    res.json({"result":1})
                }
            })

        }
    })
})

//list magics
app.get("/list", function(req,res){
    Magic.find(function(err,data){
        if(err){
            res.json({"result":0, "errMsh":err})
        }else{
            res.render("list",{magics:data})
        }
    })
})

//edit magic

app.get("/edit/:id", function(req,res){
    Magic.findById(req.params.id, function(err,data){
        if(err){
            res.json({"result":0, "errMsh":err})
        }else{
            console.log(data)
            res.render("edit",{magic:data})
        }
    })
})

app.post("/edit", function(req,res){
    upload(req, res, function(err) {

        if(!req.file){
            const magicUpdate = {
                name: req.body.txtName,
                level:req.body.txtLevel
            }
            Magic.updateOne({_id:req.body.IDCard},{
                $set: magicUpdate
            }, function(err){
                if (err) {
                    res.json({"result": 0 ,"errMsg":err})
                } else {
                    res.redirect("/list")
                }
            })
        }else{
            if (err instanceof multer.MulterError) {
                res.json({"result": 0 ,"err":"A Multer error occurred when uploading"})
            } else if (err){
                res.json({"result": 0 ,"err":" An unknow error occurred when uploading." + err})
            }else{
                //res.json({"result":1})
                const magicUpdate = {
                    name: req.body.txtName,
                    image: req.file.filename,
                    level:req.body.txtLevel
                }
                Magic.updateOne({_id:req.body.IDCard},{
                    $set: magicUpdate
                }, function(err){
                    if (err) {
                        res.json({"result": 0 ,"errMsg":err})
                    } else {
                        res.redirect("/list")
                    }
                })
    
            }
        }
    })
    
})

app.get("/delete/:id", function(err){
    Magic.deleteOne({_id:req.params.id}, function(err){
        if(err){
            res.json({"result": 0 ,"errMsg":err})
        }else{
            res.redirect("/list")
        }
    })
})


//CHA-CON
app.get("/", function(req,res){
    const cha = Cha.aggregate([{
        /*
        lookup di kem voi aggregate([])
        lookup la mot toan tu cho phep lay data tu collection khac
        Dung tu mang cha vao mang con theo from, mang bung bau di so sanh voi id con
        as chinh la gia tri cua thang con trong cha 
        */
        $lookup:{
            from : "cons",
            localField : "BungBau",
            foreignField : "_id",
            as : "DSCon"
        }
    }], function(err,data){
        if(err){
            res.json({"result":0, "errMsh":err})
        }else{
            //res.json(data)
            res.render("list-cha-con",{Chas:data})
        }
    })
})

app.get("/add-cha", function(req,res){
    res.render("home",{trang:"add-cha",ds:""})
})

app.post("/add-cha", function(req,res){
   // res.send(req.body.txtChaTitle)
    var newCha = Cha ({
       Title : req.body.txtChaTitle,
       BungBau : []
    })
    newCha.save(function(err){
        if(err){
           res.json({"result":0, "errMsg":err})
        }else{
           res.redirect("/list-cha")
        }
    })
})

app.get("/list-cha", function(req,res){
    Cha.find(function(err,data){
        if(err){
            res.json({"result":0, "errMsg":err})
        }else{
            res.render("home",{trang:"list-cha",ds:data})
        }
    })

})

app.get("/edit-cha/:id", function(req,res){
    Cha.findById(req.params.id, function(err,data){
        if(err){
            res.json({"result":0, "errMsg":err})
        }else{
            res.render("home",{trang:"edit-cha",ds:data})
        }
    })
})

app.post("/edit-cha", function(req,res){
    //res.send(req.body.IDCha)
    const ChaUpdate = {
        Title : req.body.txtChaTitle,
    }
    Cha.updateOne({_id:req.body.IDCha},{$set:ChaUpdate},function(err){
        if(err){
            res.json({"result":0, "errMsg":err})
        }else{
            res.redirect("/list-cha")
        }
    })
})

app.get("/delete-cha/:id", function(req,res){
    Cha.deleteOne({_id:req.params.id}, function(err){
        if(err){
            res.json({"result":0, "errMsg":err})
        }else{
            res.redirect("/list-cha")
        }
    })
})

//Con

app.get("/add-con", function(req,res){
    Cha.find(function(err,data){
        if(err){
            res.json({"result":0, "errMsg":err})
        }else{
            res.render("home2",{trang:"add-con",ds:data})
        }
    })
})


app.post("/add-con", function(req,res){
    const newCon = Con({
        Title:req.body.txtConTitle
    })
    newCon.save(function(err){
        if(err){
            res.json({"result":0,"errMsg":err})
        }else{
            const updateBungBau = {
                BungBau : newCon._id
            }
            Cha.findOneAndUpdate({_id:req.body.slCha},{$push:updateBungBau},function(err){
                if(err){
                    res.json({"result":0, "errMsg":err})
                }else{
                    res.json({"result":1})
                }
            })
        }
    })
})
