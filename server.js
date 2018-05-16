const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const express = require("express");
const PG = require("PG");
const app = express();
const nunjucks = require("nunjucks");
const getActivities = require("./handlers/getActivities.js");

const port = process.env.PORT || 3000;
const client = new PG.Client();
client.connect();

// Initialize Passport and restore authentication state,
// if any, from the session.


passport.use(
  new LocalStrategy(function(email, password, callback) {
    // Here we need to ask the database if a user match with these email and password.
    // If there is, we can call the callback function with our user object and no errors:
    //   `callback(null, userObject)`
    // Or, if we don't find any matching user, call the callback function with just an error:
    //   `callback(new Error("no user found"))`
    // User.findOne({ user: username }, function (err, user) {
      // if (err) { return callback(err); }
      // if (!user) { return callback(null, false); }
      // if (!user.verifyPassword(password)) { return callback(null, false); }
      client.query(
        "select * from users where nom_user = $1 and pwd_user = $2",
        [email,password],
        function(error, resultfunc) {
          if (error) {
            console.log("nope");
          } else {
            console.log(resultfunc.rows.length);
            if(resultfunc.rows.length === 0){
              console.log("nope nope");
              return callback(null, false);
            }
          }
        }
      );

      console.log("third line "+ email +" "+ password);

      let user = {
        "email":`${email}`,
        "password":`${password}`
      };
      callback(null,user);
    // });
  })
);

passport.serializeUser(function(user, callback) {
  //ici on créé le cookie avec les informations : le username;
  callback(null, user.email);
});

passport.deserializeUser(function(email, callback) {
    // Depuis le "username" present dans le cookie, on l'utilise pour recuperer dans la database toutes les informations
    // du compte pour l'utiliser sur la page internet.
  //   User.findByEmail(email, function (err, user) {
  //     callback(err, user);
  // });
  user = {
    "email":email,
    "num":"3",
    "password":"pass"
  };
  callback(null, user)
})


nunjucks.configure("views", {
  autoescape: true,
  express: app
});

app.set("views", __dirname + "/views");
app.set("view engine", "njk");

app.use(require("body-parser").urlencoded({ extended: true }));
app.use(require("cookie-parser")());
app.use(
  require("express-session")({
    secret: "i4ms3cre7",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));

app.get("/register", function(request, result) {
  result.render("register");
});

app.post("/register", passport.authenticate('local', {failureRedirect: '/register' }),function(request, result) {
                                     const user = request.body;
  //console.log(`the entered mail is ${user.username} & the password is ${user.password}`);
  result.redirect("/homepage");
});

// passport.serializeUser(function(user, callback) {
//   //ici on créé le cookie avec les informations : le username;
//   return callback(null, user.email);
// });

// passport.deserializeUser(function(email, callback) {
//   // Depuis le "username" present dans le cookie, on l'utilise pour recuperer dans la database toutes les informations
//   // du compte pour l'utiliser sur la page internet.
// });

app.get("/login", function(request, result) {
  result.render("login");
});
//
// app.post("/login", passport.authenticate('local', function(request, result) {
//   const user = request.body;
//   client.query(
//     "select * from users where nom_user = $1 and pwd_user = $2",
//     [user.username,user.password],
//     function(error, resultfunc) {
//       if (error) {
//         console.log(error);
//       } else {
//         console.log(resultfunc.rows.length);
//       }
//     });
//   //console.log(`the entered mail is ${user.username} & the password is ${user.password}`);
//   //result.redirect("/");
// });

app.get("/logout", function(request, result) {
  request.logout();
  result.redirect("/");
});

app.get("/homepage", function(request, result){
  console.log("last log is :" + request.user.email + " " + request.user + " " + request.user.password);
  getActivities(request.user.num).then(value => result.render("homepage", {
     activities : value.rows,
     user: request.user
   }))
});

app.get("/", function(request, result){
  // console.log(app.session.passport.user);
  result.render("homepageNotLogged");
});

// app.get(
//   "/profile",
//   require("connect-ensure-login").ensureLoggedIn("/login"),
//   function(request, result) {
//     result.render("profile", {
//       id: request.user.id,
//       name: request.user.displayName,
//       email: request.user.email
//     });
// });

app.listen(port, function () {
  console.log("Server listening on port:" + port);
});
