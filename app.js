const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
require("dotenv").config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

// Mongoose
const uri = process.env.ATLAS;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.set('useFindAndModify', false);
const itemSchema = new mongoose.Schema({
  item: {
    type: String,
    required: [true, "Please enter your task"],
  },
});


const listSchema = new mongoose.Schema({
  listName: {
    type: String,
    required: [true, "Please enter the list names"],
  },
  listItems: [itemSchema]
});
const ListItem = mongoose.model("lists",listSchema)
const PrimaryItem = mongoose.model("primaryTask", itemSchema);

let taskType = "";
const whichDay = date.currentDate();

app.set("view engine", "ejs");
app.get("/", function (req, res) {
  taskType = "Primary";
  ListItem.findOne({listName:taskType},function(error,result){
        if(!error){
          if(!result){
          const primaryList = new ListItem({
          listName: taskType,
          listItems:[]
      })
      primaryList.save();
      res.redirect("/");
    }else{
      ListItem.find({},"listName",function(err,results){
        res.render("list",{
        task: taskType,
        dayName: whichDay,
        otherLists:results,
        newListItem: result.listItems
      });
        
        });
        }}
        else{
          console.log(error);
        }
      });
});

app.get("/about",function(req,res){
  ListItem.find({},"listName",function(err,results){
    if(!err){
      console.log(results);
      res.render("about",{
        otherLists:results
      });
    }else{
      console.log(err);
    }
  })
});

app.get("/:listName", function (req, res) {
  taskType =_.capitalize(req.params.listName);
  if(taskType === "Primary"){
    res.redirect("/");
  }else{
    ListItem.find({},"listName",function(error,results){
      ListItem.findOne({listName:taskType},function(err,result){
        if(err){
          console.log(err);
        }else{
          if(result){
            //list already exist
            res.render("list", {
              task: taskType,
              dayName: whichDay,
              otherLists:results,
              newListItem: result.listItems
            });
          }else{
            //list does not exist yet
            const list = new ListItem({
              listName: taskType,
              listItems: []
            });
            list.save();
            res.redirect("/" + taskType);
          }
        }
      });
    });
  }
});  
app.post("/newList",function(req,res){
  const newList = req.body.newListName;
  res.redirect("/" + newList);
});

app.post("/", function (req, res,next) {
  const itemReceived = req.body.item;
  taskType = req.body.button;
  const newTask = new PrimaryItem({
    item:itemReceived
  });
  ListItem.findOne({listName:taskType},function(err,result){
    result.listItems.push(newTask);
    result.save();
    if(taskType === "Primary"){
    res.redirect("/");
  }else{
    res.redirect("/" + taskType);
  }
  }); 
  
});

app.post("/delete", function (req, res) {
  const deletedListName = req.body.listName;
  const checkItemID = req.body.checkbox;
  ListItem.findOneAndUpdate({listName:deletedListName},{$pull:{listItems:{_id:checkItemID}}},
  function(err){
    if(!err){
        console.log("Item " + checkItemID + " successfully deleted");
        if(deletedListName === "Primary"){
          res.redirect("/");
    }else{
    res.redirect("/" + deletedListName);
    }
    }else{
      console.log(err);
    }
    
  });
});

app.post("/deleteList",function(req,res){
  const deletedListName = req.body.listName;

    ListItem.deleteOne({listName:deletedListName},function(err){
      if(!err){
        console.log("Documents from the list are deleted");
        res.redirect("/");

      }else{
        console.log(err);
      }
    });
});

app.listen(3000, function(){
  console.log("Server 3000 is running");
})