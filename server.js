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

passport.use(
  new LocalStrategy(function(email, password, callback) {
    client.query(
      "select * from users where nom_user = $1 and pwd_user = $2",
      [email, password],
      function(error, resultfunc) {
        if (error) {
          console.log("nope");
        } else {
          console.log(resultfunc.rows.length);
          if(resultfunc.rows.length === 0){
            callback(null, false);
          }
          else if((password === resultfunc.rows[0].pwd_user) & ( email === resultfunc.rows[0].nom_user)){
            console.log("great sucess")
            let user = {
              "username":`${email}`,
              "password":`${password}`
            };
            callback(null,user);
          }

        }
      }
    );
    console.log("third line "+ email +" "+ password);
  })
);


passport.serializeUser(function(user, callback) {
  //ici on créé le cookie avec les informations : le username;
  callback(null, user.username);
});

passport.deserializeUser(function(email, callback) {
  client.query(
    "select * from users where nom_user = $1",
    [email],
    function(error, resultfunc) {
      user = {
        "username": email,
        "num": resultfunc.rows[0].num_user,
        "password": resultfunc.rows[0].pwd_user
      };
      callback(null, user)
    }
  );

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

app.get("/login", function(request, result) {
  result.render("login");
});
app.post("/login", passport.authenticate('local', {failureRedirect: '/errorLogin' }),function(request, result) {
  const user = request.body;
  result.redirect("/homepage");
});


app.get("/register", function(request, result) {
  result.render("register");
});
app.post("/register", function(request, result) {
  // passport.authenticate('local', {failureRedirect: '/register' })
  // return callback("Username already exists", false);
  console.log(request.body);
  const userInf = request.body;
  client.query(
    "select * from users where nom_user = $1",
    [userInf.username])
  .then((resultfunc) => {
    if(resultfunc.rows.length > 0){
      console.log("error, username already exists");
      result.redirect("/errorRegister");
    }
    else {
      console.log("registered success");
      result.redirect("/homepage");
    }
  });
});

app.get("/logout", function(request, result) {
  request.logout();
  result.redirect("/");
});

app.get("/homepage", function(request, result){
  // console.log(app.session.passport.user);

  if(request.user === undefined){
    // let text = "You are not yet logged in!"
    // result.redirect(text,"/NotLogged");
    result.redirect("/StillNotLogged");
  }
  else {
    getActivities(request.user.num).then(value => result.render("homepage", {
       activities : value.rows,
       user: request.user
    }))
  }
});

app.get("/StillNotLogged", function(request, result){
  let text = "You are not yet logged in!";
  result.render("homepageNotLogged", {error: text})
});

app.get("/activity/:id/expenses", function(request, result){
  let res;
  client.query(
    "SELECT date_transaction,nom_user, name_transaction, SUM(amount), num_sender FROM transaction_detail INNER JOIN transaction_list ON transaction_detail.num_transaction=transaction_list.num_transaction INNER JOIN users ON users.num_user = num_sender WHERE num_activity=$1 GROUP BY num_sender,name_transaction,nom_user,date_transaction;",
    [request.params.id],
    function(error, resultfunc) {
      if (error) {
        console.log("nope");
      } else {
        console.log("ça marche");
        res=(resultfunc.rows);
      }
    }
  );
  result.render("expenses", { Username: request.user.email,id:request.params.id,test:res });
});

app.get("/", function(request, result){
  // console.log(app.session.passport.user);
  result.render("homepageNotLogged");
}

app.get("/activity/:id/expenses", function(request, result){
  let res;
  client.query(
    "SELECT date_transaction,nom_user, name_transaction, SUM(amount), num_sender FROM transaction_detail INNER JOIN transaction_list ON transaction_detail.num_transaction=transaction_list.num_transaction INNER JOIN users ON users.num_user = num_sender WHERE num_activity=$1 GROUP BY num_sender,name_transaction,nom_user,date_transaction;",
    [request.params.id],
    function(error, resultfunc) {
      if (error) {
        console.log("nope");
      } else {
        console.log("ça marche");
        console.log(resultfunc.rows);
        result.render("expenses", { Username: request.user.email,id:request.params.id,test:resultfunc.rows });
      }
    }
  );

});

app.get("/errorLogin", function(request, result){
  let text = "Error with login information entered";
  result.render("login", {error: text})
});

app.get("/errorRegister", function(request, result){
  let text = "Failed with registration ! Username already exists";
  result.render("register", {error : text});
});

app.listen(port, function () {
  console.log("Server listening on port:" + port);
});
