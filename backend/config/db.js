const mongoose = require("mongoose");

const connectdb = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URL.replace(
        "<PASSWORD>",
        process.env.MONGODB_PASSWORD
      ),
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("DB Connected using MongoDB");
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectdb;
