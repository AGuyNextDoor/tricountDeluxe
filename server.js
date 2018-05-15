const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const express = require("express");
const PG = require("PG");
const app = express();
const nunjucks = require("nunjucks");

const port = process.env.PORT || 3000;
const client = new PG.Client();

client.connect();

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

// Initialize Passport and restore authentication state,
// if any, from the session.
app.use(passport.initialize());
app.use(passport.session());

app.get("/register", function(request, result) {
  result.render("register");
});


app.get("/user/:username", function (request, result) {

  client.query(
    "select * from users where nom_user = $1",
    [request.params.username],
    function(error, resultfunc) {
      if (error) {
        console.log(error);
      } else {
        //console.log(resultfunc.rows);
        result.json(resultfunc.rows);
      }
    });
});

app.post("/register", function(request, result) {
  const user = request.body;
  passport.serializeUser(function(user, callback) {
    //ici on créé le cookie avec les informations : le username;
    return callback(null, user.email);
  });
  // db.query("INSERT INTO users (email, password) VALUES ($1, $2)", [user.email, user.password])
  // // .then(dbResult => {
  // //   request.logIn(dbResult[0], function(error) {
  // //     if (error) {
  // //       console.log(error);
  // //       return result.redirect("/register");
  // //     }
  // //     return result.redirect("/");
  // //   });
  // // })
  //
  // .catch(error => {
  //   console.warn(error);
  // });
  console.log(`the entered mail is ${user.username} & the password is ${user.password}`);
  result.redirect("/");

});

// passport.serializeUser(function(user, callback) {
//   //ici on créé le cookie avec les informations : le username;
//   return callback(null, user.email);
// });

// passport.deserializeUser(function(email, callback) {
//   // Depuis le "username" present dans le cookie, on l'utilise pour recuperer dans la database toutes les informations
//   // du compte pour l'utiliser sur la page internet.
// });

passport.use(
  new LocalStrategy(function(email, password, callback) {
    // Here we need to ask the database if a user match with these email and password.
    // If there is, we can call the callback function with our user object and no errors:
    //   `callback(null, userObject)`
    // Or, if we don't find any matching user, call the callback function with just an error:
    //   `callback(new Error("no user found"))`
  })
);

app.get("/login", function(request, result) {
  result.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  function(request, result) {
    result.redirect("/profile");
  }
);

app.get("/logout", function(request, result) {
  request.logout();
  result.redirect("/");
});

app.get("/", function(request, result){
  console.log("last log is :", passport.deserializeUser(function(email, callback) {
      // Depuis le "username" present dans le cookie, on l'utilise pour recuperer dans la database toutes les informations
      // du compte pour l'utiliser sur la page internet.
      return email;
    })
  );
  console.log(app.session.passport.user);
  result.render("homepage");
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
