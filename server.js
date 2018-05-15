const express = require("express");
const PG = require("PG");

const client = new PG.Client();

const app = express();

const port = process.env.PORT || 3000;
client.connect();


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

app.listen(port, function () {
  console.log("Server listening on port:" + port);
});
