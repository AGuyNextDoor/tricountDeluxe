const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const express = require("express");
const PG = require("pg");
const app = express();
const nunjucks = require("nunjucks");
const getActivities = require("./handlers/getActivities.js");
const getClosedActivities = require("./handlers/getClosedActivities.js");
const getActivityBalance = require("./handlers/getActivityBalance.js");

const port = process.env.PORT || 3000;
const client = new PG.Client(process.env.DATABASE_URL);


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
        console.log(request.body);
        const resultquery = client.query(
          "INSERT INTO users (nom_user,pwd_user) VALUES ($1,$2)",
          [userInf.username,userInf.password],
          function(error,resultbla){
            if(error){
              console.warn(error);
            }else{
              console.log("registered success");
              request.logIn(userInf, function(error){
                if (error){
                  return result.redirect("/errorRegister")
                }else{
                  return result.redirect("/homepage");
                }
              });

            }
          }
        );
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

  app.get("/addactivity", function(request, result){
    result.render("addactivity");
  });


  app.post("/addactivity", function(request, result) {
    console.log(request.body);
    const resultquery = client.query(
      "INSERT INTO activity_list (name_activity, date_activity) VALUES ($1,NOW()) returning num_activity",
      [request.body.name_activity])
      .then(num_act => request.body.users.forEach(
        function (name) {
          let act_num=num_act.rows[0].num_activity;
          return client.query(
            "select num_user from users where nom_user=$1",
            [name],function(err,result) {
              if(err) {
                console.log(name + 'KO');
              } else {
                if(result.rows[0]===undefined){
                  client.query(
                    "INSERT INTO users (nom_user,pwd_user) VALUES ($1,'azerty') returning num_user",
                    [name])
                    .then(num_user => client.query(
                      "INSERT INTO join_activity_user (num_activity,num_user) VALUES ($1,$2)",
                      [act_num,num_user.rows[0].num_user],
                    ));
                  } else {

                    return client.query(
                      "INSERT INTO join_activity_user (num_activity,num_user) VALUES ($1,$2)",
                      [act_num,result.rows[0].num_user],
                    );
                  }
                }
              }
            )

          }


        )
      )
      .then(result.redirect("HomePage"));
    });

app.get("/activity/:id/addexpense", function(request, result){
  client.query(
    "select nom_user, users.num_user from join_activity_user INNER JOIN users on join_activity_user.num_user = users.num_user where num_activity=$1",
    [request.params.id],
    function(error, resultfunc) {
        if (error) {
          console.log("nope");
        } else {
          console.log('test' + resultfunc);
          result.render("addexpense", {users: resultfunc.rows, activity: request.params.id});
        };
      });
    }
  );

app.post("/activity/:id/addexpense", function(request, result){
  console.log(request.params);
  console.log(request.body);
  let users=request.body.users;
  const nbUser = request.body.users.length;
  let amount = request.body.amount*100;
  let amountrest = amount;
  let amounttab = [];
  var split=Math.round(amount / nbUser);
  console.log(split);



    //console.log('rest :' + amountrest);
    client.query(
      "INSERT INTO transaction_list (name_transaction, montant_transaction, date_transaction) VALUES ($1,$2,NOW()) returning num_transaction",
      [request.body.name_expense,request.body.amount],function(error, resultfunc) {
        console.log(resultfunc);
        for(let i=0;i<nbUser;i++){
          if (amountrest - split > 2) {
            client.query(
              "INSERT INTO transaction_detail (num_transaction,num_activity,num_sender,num_receiver,part,amount) VALUES ($1,$2,$3,$4,'1',$5)",
              [resultfunc.rows[0].num_transaction,request.params.id,request.body.sender,users[i],split],
              );
            //console.log(users[i],split,request.body.sender,resultfunc.rows[0].lasttrans + 1);
            amountrest -= split;
          } else {
            //console.log(users[i],amountrest,request.body.sender,resultfunc.rows[0].lasttrans + 1);
            client.query(
              "INSERT INTO transaction_detail (num_transaction,num_activity,num_sender,num_receiver,part,amount) VALUES ($1,$2,$3,$4,'1',$5)",
              [resultfunc.rows[0].num_transaction,request.params.id,request.body.sender,users[i],amountrest],
              );
          }
        }
        result.redirect("/activity/"+request.params.id+"/expenses");
      }

      )
  }

  //console.log(split);
);

    app.get("/StillNotLogged", function(request, result){
      let text = "You are not yet logged in!";
      result.render("homepageNotLogged", {error: text})
    });

    app.get("/", function(request, result){
      // console.log(app.session.passport.user);
      result.render("homepageNotLogged");
    });

    app.get("/activity/:id/expenses", function(request, result){
      client.query(
        "SELECT to_char(date_transaction, 'DD-MM-YYYY') as date,nom_user, name_transaction, transaction_list.num_transaction, SUM(amount), num_sender FROM transaction_detail INNER JOIN transaction_list ON transaction_detail.num_transaction=transaction_list.num_transaction INNER JOIN users ON users.num_user = num_sender WHERE num_activity=$1 GROUP BY num_sender,name_transaction,nom_user,date_transaction,transaction_list.num_transaction;",
        [request.params.id],
        function(error, resultfunc) {
          if (error) {
            console.log("nope");
          } else {
            let myGraph_data=[];
            let myGraph_labels=[];
            console.log(resultfunc.rows);
            console.log("name transaction" + resultfunc.rows.name_transaction);

            resultfunc.rows.forEach(function buildArray(element){
              myGraph_data.push(element.sum/100);
              myGraph_labels.push(element.name_transaction);
            });
          let thereIsData = (resultfunc.rows!==undefined);

            result.render("expenses", {user:request.user,tid:thereIsData,test:resultfunc.rows, graph_data:myGraph_data,graph_labels:myGraph_labels, activityId: request.params.id});
          }
        }
      );
    });


    app.get("/activity/delete/:id", function(request,result){
      client.query(
        "DELETE FROM activity_list WHERE num_activity = $1 ;",
        [request.params.id],
        function(error,resultfunc){
          if (error) {
            console.warn(error);
          } else {

            client.query(
              "DELETE FROM join_activity_user WHERE num_activity = $1 ;",
              [request.params.id],
              function(error,resultfunc){
                if(error){
                  console.warn(error);
                }else{

                  client.query(
                    "DELETE FROM transaction_detail WHERE num_activity = $1 ;",
                    [request.params.id],
                    function(error,resultfunc){
                      if(error){
                        console.warn(error);
                      }else{
                        result.redirect("/homepage");

                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    });

app.get("/balance/:actId", function(request,result){
  getActivityBalance(request.params.actId).then(response => {
    console.log("result in get is : ", response);
    result.render("accounts", {variable: response})
  });
});

    app.get("/expense/delete/:id/:numActivity", function(request,result){
      client.query(
        "DELETE FROM transaction_detail WHERE num_transaction = $1 ;",
        [request.params.id],
        function(error,resultfunc){
          if (error) {
            console.warn(error);
          } else {

            client.query(
              "DELETE FROM transaction_list WHERE num_transaction = $1 ;",
              [request.params.id],
              function(error,resultfunc){
                if(error){
                  console.warn(error);
                }else{

                result.redirect("/activity/"+request.params.numActivity+"/expenses");

                }
              }
            );
          }
        }
      );
    });





    app.get("/history", function(request, result){
      // console.log(app.session.passport.user);
      if(request.user === undefined){
        // let text = "You are not yet logged in!"
        // result.redirect(text,"/NotLogged");
        result.redirect("/StillNotLogged");
      }
      else {

        getClosedActivities(request.user.num).then(value => result.render("history", {
          activities : value.rows,

        }))
      }
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
