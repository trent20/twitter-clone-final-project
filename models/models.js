const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db.js')

class User extends Model {}

User.init({
  username: DataTypes.STRING,
  password: DataTypes.STRING
}, { sequelize });

class Tweet extends Model {}

Tweet.init({
  content: DataTypes.STRING,
  timeCreated: DataTypes.DATE
}, { sequelize });

(async () => {
  await sequelize.sync()
})()

let models = {
  User: User,
  Tweet: Tweet
}

User.hasMany(Tweet);
Tweet.belongsTo(User);

module.exports = models