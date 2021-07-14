const https=require("https");
const express=require("express");
const request=require("request");
const bodyParser=require("body-parser");
const axios=require("axios");
const ejs=require("ejs");
const _=require("lodash");

let wrngans=0;
let crctans=0;
let tle=0;
let userName="";

let contribution=0;
let friendOfCount=0;
let titlePhoto="";
let handle="";

let newRating=0;
let numberOfContest=0;
let contestDetails=null;

let maxRatedQues=0;
let minRatedQues=0;
let ratingQues=[];
let countRating=[];
let tagNames=[];
let countTags=[];

const app=express();

app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.get("/",(req,res)=>{
    res.render("main",{userName,wrngans,crctans,tle,friendOfCount,titlePhoto,handle,contribution,newRating,numberOfContest,ratingQues,tagNames,countTags});
});
app.get("/contests",(req,res)=>{
    res.render("contests",{contestDetails});
});
app.get("/contact",(req,res)=>{
    res.render("contact");
});

app.post("/",async(req,res)=>{ // async defines that the function is asynchronous

    userName=req.body.userName;
    const methods={
        userInfo: "user.info",
        userRating: "user.rating",
        userStatus: "user.status"
    }
    const url="https://codeforces.com/api/";
    const data1=await axios.get(url+methods.userStatus+"?handle="+userName); // await is a property of async function whicch gives time so that the api can be fetched first before moving forward
    // console.log(data1);
    // console.log(data1.data);
    const useData1=data1.data.result;
    wrngans=0;
    crctans=0;
    tle=0;
    ratingQues.length=0;
    countRating.length=0;
    minRatedQues=1e9;
    maxRatedQues=-1e9;
    countTags.length=0;
    for(let i=0;i<useData1.length;i++)
    {
        countRating[useData1[i].problem.rating]=0;
    }
    for(let i=0;i<useData1.length;i++)
    {
        if(useData1[i].verdict==='WRONG_ANSWER')
            wrngans++;
        else if(useData1[i].verdict==='OK')
        {
            crctans++;
            if(minRatedQues>useData1[i].problem.rating)
                minRatedQues=useData1[i].problem.rating;
            if(maxRatedQues<useData1[i].problem.rating)
                maxRatedQues=useData1[i].problem.rating;
            countRating[useData1[i].problem.rating]++;

            for(let j=0;j<useData1[i].problem.tags.length;j++)
                countTags[useData1[i].problem.tags[j].toString()]=0;
        }
        else
            tle++;
    }
    for(let i=minRatedQues;i<=maxRatedQues;i+=100)
    {
        if(countRating[i]!=null)
            ratingQues.push([i,countRating[i]]);
    }
    console.log(ratingQues);
    for(let i=0;i<useData1.length;i++)
    {
        if(useData1[i].verdict==='OK')
        {
            for(let j=0;j<useData1[i].problem.tags.length;j++)
            {
                countTags[useData1[i].problem.tags[j].toString()]++;
                if(tagNames.indexOf(useData1[i].problem.tags[j])==-1)
                    tagNames.push(useData1[i].problem.tags[j]);
            }
        }
    }
    
    tagNames.forEach((i)=>{
        console.log(i,countTags[i]);
    });

    const data2=await axios.get(url+methods.userInfo+"?handles="+userName);  // "https://codeforces.com/api/user.info?handles=ADI_CODES"
    // console.log(data2.data);
    const useData2=data2.data.result[0];
    // console.log(useData2);
    contribution=0;
    friendOfCount=0;
    titlePhoto="";
    handle="";
    newRating=0;
    numberOfContest=0;
    contestDetails=null;

    contribution=useData2.contribution;
    friendOfCount=useData2.friendOfCount;
    titlePhoto=useData2.titlePhoto;
    handle=useData2.handle;

    const data3=await axios.get(url+methods.userRating+"?handle="+userName);
    const useData3=data3.data.result;
    contestDetails=useData3;
    if(useData3.length!==0)
        newRating=useData3[useData3.length-1].newRating;
    numberOfContest=useData3.length;
    
    res.redirect("/");
});

app.listen(process.env.PORT||7000 ,()=>{
    console.log("Server is running on port 7000");
});


// to apply validation to a req use joi

/*   
    joi can be used like when you want to add a new member you need his details and you need to handle this using app.put() (ie, update) request then you need to check whether
    the data is valid or not .. 

    const Joi=require("joi"); // Joi because it's a class
    const schema={ // schema is an object which will define which property to check
    eg-     name: Joi.string().min(3).required()    // this implies that the name property must be a string and it must be of min len 3 and is required
    };
    const result=Joi.validate(req.body,schema); // it will take two props that is prop to validate and schema
    if(result.error)
    {
        res.status(400).send("result.error.details[0].message");
        return;
    }
    course.name=req.body.name;
    res.send(course); // updating the property

*/



/*
    MIDDLEWARE FUNCTION -
    while using body parser we write app.use(bodyParser.urlencoded({extended:true})); or app.use(express.json()); or app.use(express.static("public")); (public folder)
    this is a middle ware and we can create our own custom middleware func as well

    func(req,res,next)=>{ // a middleware func takes 3 parameters request,respose,next where next tells to go to the next middleware 

        some code...
        next();
    }
    we can export this middleware and use in our file by using app.use()

*/