const PG = require("PG");
const client = new PG.Client();
client.connect();

function getActivities(id) {
    return client.query(
    "select num_user, join_activity_user.num_activity, name_activity from join_activity_user INNER JOIN activity_list ON join_activity_user.num_activity = activity_list.num_activity where num_user = $1 ",
    [id]);
}

module.exports = getActivities;
