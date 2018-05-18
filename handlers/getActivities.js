const PG = require("PG");
const client = new PG.Client();
client.connect();

function getActivities(id) {
    return client.query(
    //"select num_user, join_activity_user.num_activity, name_activity from join_activity_user INNER JOIN activity_list ON join_activity_user.num_activity = activity_list.num_activity where num_user = $1 ",
    //"select to_char(date_activity, 'DD-MM-YYYY') as date, num_user, join_activity_user.num_activity, name_activity, SUM(amount) as tot from join_activity_user INNER JOIN activity_list ON join_activity_user.num_activity = activity_list.num_activity INNER JOIN transaction_detail ON join_activity_user.num_activity = transaction_detail.num_activity where num_user = $1 GROUP BY join_activity_user.num_activity, num_user, name_activity, date_activity",
"select to_char(date_activity, 'DD-MM-YYYY') as date, num_user, join_activity_user.num_activity, name_activity from join_activity_user INNER JOIN activity_list ON join_activity_user.num_activity = activity_list.num_activity where num_user = $1 GROUP BY join_activity_user.num_activity, num_user, name_activity, date_activity",
    [id]);
}

module.exports = getActivities;
