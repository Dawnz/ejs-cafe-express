var express = require("express");
const mysql = require("mysql");
const path = require("path");
var session = require("express-session");
var cookieParser = require("cookie-parser");
var flash = require("express-flash");
var app = express();
app.set("view engine", "ejs");
// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));

// app.use(express.json);

app.use(
   express.urlencoded({
      extended: true,
   })
);
app.use(flash());
//Session Settings
app.use(cookieParser());
app.use(cookieParser());
app.use(
   session({
      secret: "secret code 3245",
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 120000 },
   })
);
const conn = mysql.createConnection({
   host: "localhost",
   user: "root",
   password: "",
   database: "amberorder",
   dateStrings: true,
});

conn.connect((err) => {
   if (!err) console.log("Connected to database Successfully");
   else console.log("Connection Failed!" + JSON.stringify(err, undefined, 2));
});

app.get("/", function (req, res) {
   res.render(`pages/home.ejs`);
});
app.get("/login", function (req, res) {
   res.render(`pages/login.ejs`, {
      email: "",
      password: "",
   });
});
app.get("/register", function (req, res) {
   res.render(`pages/register.ejs`);
});

app.get("/orders", function (req, res) {
   console.log(req.session.username);
   let mySql = "SELECT * FROM amberorder.orders";
   conn.query(mySql, (err, results) => {
      if (err) throw err;

      res.render(`pages/orders.ejs`, {
         orders: results,
      });
   });
});

app.get("/menu", function (req, res) {
   let mySql = "SELECT * FROM amberorder.menuitem";
   conn.query(mySql, (err, results) => {
      if (err) throw err;

      res.render("pages/menu.ejs", {
         menuItems: results,
      });
   });
});

app.post("/authlogin", function (req, res, next) {
   var email = req.body.email;
   var password = req.body.password;
   console.log(req.body);

   // connection.query("SELECT * FROM login WHERE  email = '"+ email  +"' AND BINARY password = '"+ password +"'", function(err, rows, fields) {
   conn.query(
      "SELECT * FROM amberorder.users WHERE email = ? AND password = ?",
      // "SELECT * FROM amberorder.users",
      [email, password],
      function (err, results) {
         //if(err) throw err

         // if login is incorrect or not found
         // console.log(results);
         if (results.length <= 0) {
            if (err) throw err;
            req.flash("error", "Invalid credentials Please try again!");
            res.redirect("/login");
         } else {
            // if login found
            //Assign session variables based on login credentials
            req.session.loggedin = true;
            req.session.username = results[0].username;
            req.session.email = results[0].email;
            req.session.role = results[0].role;
            console.log(req.session);
            res.redirect("/orders");
         }
      }
   );
});

app.get("/logout", function (req, res) {
   req.session.destroy();
   req.flash("success", "Enter Your Login Credentials");
   res.redirect("/login");
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}..`));
