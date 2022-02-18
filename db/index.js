const Sequelize = require("sequelize");
const { STRING } = Sequelize;
const sequelize = new Sequelize(
  process.env.DATABASR_URL || "postgres://localhost/doodles_db"
);

// Setting up the models

const Dog = sequelize.define("dog", {
  name: {
    type: STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      len: [1, 20],
    },
  },
});

const Type = sequelize.define("type", {
  name: {
    type: STRING(20),
    unique: true,
  },
});

Dog.belongsTo(Type);
Type.hasMany(Dog);

const syncAndSeed = async () => {
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
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  sequelize,
  syncAndSeed,
  models: {
    Dog,
    Type,
  },
};
