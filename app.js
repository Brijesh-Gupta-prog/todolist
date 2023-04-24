const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


 //mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
mongoose.connect("mongodb+srv://brijesh:brijesh2@project.dykzcnp.mongodb.net/todolistDB?retryWrites=true&w=majority");


const itemsSchema =new mongoose.Schema({
    name :String
});

const Item  = new mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name : "Brijesh"
});
const item2 = new Item({
    name : "sandeep"
});
const item3 = new Item({
    name : "sateesh"
});
const item4 = new Item({
    name : "kartikay"
});
const defaultitems = [item1,item2,item3,item4];

const ListSchema = {
    name : String,
    items : [itemsSchema]
}
const List = mongoose.model("List",ListSchema);

app.get("/",function(req,res){
Item.find()
.then((foundItems)=>{
    if(foundItems.length == 0){
        Item.insertMany(defaultitems)
        .then(()=>{
            console.log("Succesfully inserted !");
        })
        .catch((error)=>{
        console.log(error.message);
        });
        res.redirect("/");
    }
    else{
        res.render("list",{listTitle :"Today" , newnames : foundItems});
    } 
})
 .catch((error)=>{
console.log(error.message);
 })
});

app.get("/:customListName",function(req,res){
    const customlistname = _.capitalize(req.params.customListName);
    List.findOne({name :customlistname})
    .then((foundLists)=>{
        if(!foundLists){
            const list = new List({
                name : customlistname,
                items : defaultitems
             })
             List.insertMany(list)
                 .then(()=>{
                     console.log("Succesfully inserted !");
                 })
                 .catch((error)=>{ 
                 console.log(error.message);
                 });
                res.redirect("/" + customlistname )  ;
        }
        else{
            res.render("list",{listTitle : foundLists.name , newnames : foundLists.items});
        }
    })
    
});



app.post("/",function(req,res){
    const Newitem = req.body.name;
    const listName = req.body.list;
    const item = new Item({
        name : Newitem
    });
    
    if(listName === "Today"){
        Item.insertMany(item)
        .then(()=>{
            console.log("Succesfully inserted !");
        })
        .catch((error)=>{
        console.log(error.message);
        });
        res.redirect("/");
    }
    else{
       List.findOne({name : listName})
       .then((foundLists)=>{
           foundLists.items.push(item);
           foundLists.save();
           res.redirect("/"+ listName);
       })
       .catch((error)=>{
          console.log(error.message);
       });
    }
    
}); 

app.post("/delete",function(req,res){
const checkeditemId =  req.body.checkbox;
const listName = req.body.listName;
if(listName === "Today"){
    Item.findByIdAndRemove(checkeditemId)
    .then(()=>{
    console.log("successfully Deleted the ckecked item");
    res.redirect("/");
    })
    .catch((error)=>{
        console.log(error.message);
    });
}
else{
    List.findOneAndUpdate({name : listName},{$pull : {items : {_id : checkeditemId}}})
    .then((foundLists)=>{
        console.log("successfully deleted");
    })
    .catch((error)=>{
        console.log(error.message);
    });
    res.redirect("/" + listName);
}



});


app.listen(3000,function(){
    console.log("Server running on port 3000");
})