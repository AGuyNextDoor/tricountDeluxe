const PG = require("PG");
const client = new PG.Client();
client.connect();

function getDebts(numActivity) {
    return client.query(
    //"select num_user, join_activity_user.num_activity, name_activity from join_activity_user INNER JOIN activity_list ON join_activity_user.num_activity = activity_list.num_activity where num_user = $1 ",
    "select num_sender, SUM(amount) as tot from transaction_detail where num_activity = $1 GROUP BY num_activity, num_sender",
    [numActivity]).then(result => result.rows);
}

function getAdvances(numActivity){
  return client.query(
    "select num_receiver, SUM(amount) as tot from transaction_detail where num_activity = $1 GROUP BY num_activity, num_receiver",
    [numActivity]).then(result => result.rows);
}

function getUsers(numActivity){
  return client.query(
    "select j.num_user, u.nom_user from join_activity_user as j inner join users as u on j.num_user = u.num_user where num_activity = $1",
    [numActivity]).then(result => result.rows);
}

function getActivityBalance(activityNum){
  Promise.all([getDebts(activityNum), getAdvances(activityNum), getUsers(activityNum)]).then(result => {
      let balance = [];
      console.log("getDebts : ", result[0], "\n");
      console.log("getAdvances : ", result[1], "\n");
      console.log("getUsers : ", result[2], "\n");
      result[2].forEach(element => balance.push(
        {
          num: element.num_user,
          balance: 0,
          nom: element.nom_user
        }
      ));
      for (let i = 0; i < result[0].length; i++) {
        for(let j = 0; j < balance.length; j++){
          if(result[0][i].num_sender === balance[j].num){
            parseInt(balance[j].balance = (balance[j].balance - result[0][i].tot));
          }
        }
      }
      for (let i = 0; i < result[1].length; i++) {
        for(let j = 0; j < balance.length; j++){
          if(result[1][i].num_receiver === balance[j].num){
            balance[j].balance = (parseInt(balance[j].balance) + parseInt(result[1][i].tot));
          }
        }
      }
      console.log("balance is : ",balance);
      return balance;
    }
  )
  .then(result => {
    console.log("result is : ", result);
    let finalResult = [];
    let balance = [];
    for (let i = 0; i < result.length; i++) {
      balance.push({num: result[i].num, account: result[i].balance});
      console.log(`the current balance for ${balance[i].num} is ${balance[i].account}$\n`);
    }

    for (let i = 0; i < balance.length; i++) {
      let max = 0;
      let min = 0;
      let indexMax;
      let indexMin;
      let indexNumMax;
      let indexNumMin;
      for (let i = 0; i < balance.length; i++) {
        if(!(balance[i].account === 0)){
          if((balance[i].account > 0)&(balance[i].account > max)){
            max = balance[i].account;
            indexNumMax = balance[i].num;
            indexMax = i;
          }
          if((balance[i].account < 0)&(balance[i].account < min)){
            min = balance[i].account;
            indexNumMin = balance[i].num;
            indexMin = i;
          }
        }
      }

      if(max != min){
        if(max>(min*(-1))){
          balance[indexMax].account += min;
          balance[indexMin].account = 0;
          finalResult.push({
            "sender": result[indexMax].nom,
            "amount": -min,
            "receiver": result[indexMin].nom
          });
          console.log(`${indexNumMax} gives ${min}$ to ${indexNumMin} \n${balance[indexMax].num} still owes ${balance[indexMax].account}$\n`);
        }
        else if(max<(min*(-1))){
          balance[indexMin].account += max;
          balance[indexMax].account = 0;
          finalResult.push({
            "sender": result[indexMax].nom,
            "amount": -min,
            "receiver": result[indexMin].nom
          });
          console.log(`Min: ${indexNumMax} receive ${max}$ from ${indexNumMin} \n${balance[indexMin].num} still needs ${balance[indexMin].account}$\n`);
        }
        else{
          balance[indexMax].account = 0;
          balance[indexMin].account = 0;
          finalResult.push({
            "sender": result[indexMax].nom,
            "amount": -min,
            "receiver": result[indexMin].nom
          });
          console.log(`Equality : ${indexNumMax} gives ${max}$ to ${indexNumMin} \n${balance[indexMin].num} and ${balance[indexMax].num} now are clean\n`);
        }
      }
    }
    console.log("tadaaa",finalResult);

    console.log("final result is: ");
    for (let i = 0; i < balance.length; i++) {
      console.log(balance[i].num, " has ", balance[i].account,"$");
    }
    return finalResult;
  })
}

module.exports = getActivityBalance;
