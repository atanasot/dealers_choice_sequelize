const Sequelize = require("sequelize");
const { STRING } = Sequelize;
const sequelize = new Sequelize(
  process.env.DATABASR_URL || "postgres://localhost/doodles_db"
);
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => res.redirect("/dogs")); // why do we need to redirect from /??

app.get("/dogs", async (req, res, next) => {
  try {
    const dogs = await Dog.findAll({
      include: [Type],
    });
    const html = `
            <html>
                <head>
                    <title>Doodle Dogs</title>
                </head>
                <body>
                    <h1>Eros And Doodle Friends<h2>
                    <ul>
                        ${dogs
                          .map(
                            (dog) =>
                              `<li>${dog.name} <a href="/dogs/${(dog.typeId) ? dog.typeId : 'otherBreed'}">${(dog.type) ? dog.type.name : 'Not a doodle!'}</a></li>`
                          )
                          .join("")}
                    </ul>
                </body>
            </html>
        `;

    res.send(html);
  } catch (err) {
    console.log(err);
  }
});

const Dog = sequelize.define("dog", {
  name: {
    type: STRING,
    allowNull: false,
    unique: true,
  },
});

const Type = sequelize.define("type", {
  name: {
    type: STRING,
    unique: true,
  },
});

Dog.belongsTo(Type);
Type.hasMany(Dog);

const start = async () => {
  try {
    await sequelize.sync({ force: true });
    // seeding the breed table
    const goldenDoodle = await Type.create({ name: "goldendoodle" });
    const doubleDoodle = await Type.create({ name: "doubledoodle" });
    const berneDoodle = await Type.create({ name: "bernedoodle" });
    const labraDoodle = await Type.create({ name: "labradoodle" });
    const teddyBearDoodle = await Type.create({ name: "teddybeardoodle" });

    //seeding the dogs table
    const [
      eros,
      milli,
      chance,
      fiona,
      skipper,
      rooster,
      ollie,
      cooper,
      monroe,
    ] = await Promise.all(
      [
        "eros",
        "milli",
        "chance",
        "fiona",
        "skipper",
        "rooster",
        "ollie",
        "cooper",
        "monroe",
      ].map((name) => Dog.create({ name }))
    );

    //setting up the associations manually
    eros.typeId = goldenDoodle.id;
    milli.typeId = doubleDoodle.id;
    chance.typeId = labraDoodle.id;
    fiona.typeId = goldenDoodle.id;
    skipper.typeId = teddyBearDoodle.id;
    ollie.typeId = goldenDoodle.id;
    cooper.typeId = berneDoodle.id;
    monroe.typeId = berneDoodle.id;
    //rooster.typeId = berneDoodle.id;

    // save the typeId from up above 
    await Promise.all([
      eros.save(),
      milli.save(),
      chance.save(),
      fiona.save(),
      skipper.save(),
      ollie.save(),
      cooper.save(),
      monroe.save(),
    ]);
    console.log("connected to db");

    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  } catch (err) {
    console.log(err);
  }
};

start();
