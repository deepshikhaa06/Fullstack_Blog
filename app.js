require("dotenv").config()
const express=require("express")
const PORT=process.env.PORT || 3000;
const app=express()
const mongoose=require("mongoose")
const session=require("express-session")
const MongoStore=require("connect-mongo")
const methodOverride=require("method-override")
const passport=require("passport")
const passportConfig = require('./config/passport.js');
const authRoutes=require("./routes/authRouthes")
const postRoute=require("./routes/postRoute");
const userRoutes = require("./routes/userRoute");
const commentRoutes = require("./routes/commentRoute.js");
const errorHandler = require("./middleware/errorHandler.js");
// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine","ejs")
app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl:process.env.MONGODB_URL }),
}))
app.use(methodOverride("_method"))
passportConfig(passport);
app.use(passport.initialize())
app.use(passport.session())


mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Could not connect to MongoDB", err));
app.get("/",(req,res)=>{
    res.render("home",{title: "Home",error: "",user: req.user})
})
app.use("/auth",authRoutes)
app.use("/posts",postRoute)
app.use("/",commentRoutes)
app.use("/user",userRoutes)

//*Error handling middleware
app.use(errorHandler)

    
app.listen(PORT,()=>{
    console.log(`Server is listening on ${PORT}`); 
});
