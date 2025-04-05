//Load Config
require("dotenv").config();

const express = require("express");
const app = express();


const path = require("path");
const morgan = require("morgan");
const passport = require("passport");
const engine = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");


//body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//@Routes
const indexPage = require("./routes/index");
const Auth = require("./routes/auth");
const CreateStory = require("./routes/stories");

//mongoose
const mongoose = require("mongoose");

const URL = process.env.MONGO_URL;
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(URL);
}

//passport config
require("./config/passport")(passport);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//helpers
const { stripTags, truncate, editIcon } = require("./helper/helper");
app.locals.stripTags = stripTags;
app.locals.truncate = truncate;
app.locals.editIcon = editIcon;

//ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", engine);

const store = MongoStore.create({
  mongoUrl: URL,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: "keyboard",
  },
});

store.on("error", function (e) {
  console.log("store error", e);
});

//sessions
app.use(
  session({
    store,
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//set global variable
app.use((req, res, next) => {
  res.locals.loggedInUser = req.user || null;
  next();
});

//static
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride('_method'));

//Routes
app.use("/", indexPage);
app.use("/auth", Auth);
app.use("/stories", CreateStory);


//other route
app.get('/*',(req,res,next) =>{
  next(new expressError('Page Not Found',404));
})

const PORT = process.env.PORT || 3300;

app.listen(PORT, () => {
  console.log(`Server Running in ${process.env.NODE_ENV} on Port ${PORT}`);
});
