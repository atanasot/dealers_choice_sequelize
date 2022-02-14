const Sequelize = require("sequelize");
const { STRING } = Sequelize;
const sequelize = new Sequelize(
  process.env.DATABASR_URL || "postgres://localhost/doodles_db"
);
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({extended: false})) // need this middleware when setting up post route to see the data from input -- gives us JSON output

app.use(require('method-override')('_method')) // this middleware we need for PUT and DELETE routes

// Routes

app.get("/", (req, res) => res.redirect("/dogs")); // why do we need to redirect from /??

app.delete('/dogs/:id', async(req, res, next) => {
    try {
        const dog = await Dog.findByPk(req.params.id)
        await dog.destroy()
        res.redirect(`/dogs/${dog.typeId}`)
    } catch (err) {
        next(err)
    }
})

app.post('/dogs', async(req, res, next) => {
    try {
        const dog = await Dog.create(req.body)
        res.redirect(`/dogs/${dog.typeId}`)
    } catch (err) {
        next(err)
    }
})

app.get("/dogs", async (req, res, next) => {
  try {
    const dogs = await Dog.findAll({
      include: [Type],
    });
    const types = await Type.findAll()
    const options = types.map( type => `
        <option value=${type.id}>
            ${type.name}
        </option>
    `)
    const htmlForm = `
        <form method="POST">
            <input name="name" placeholder="dog's name"/>
            <select name="typeId"/>
                ${options}
            </select>
            <button>Add</button>
        </form>
    `
    res.send( `
            <html>
                <head>
                    <title>Doodle Dogs</title>
                </head>
                <body>
                    <h1>Eros And Doodle Friends!<h2>
                    ${htmlForm}
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
        `);

  } catch (err) {
    next(err);
  }
});

app.get('/dogs/otherBreed', (req, res, next) => {
    try {
        res.send(`
        <div>
            <h1>Rooster is an Australian Shepherd</h1>
        </div>
        `)
    } catch (err){
        next(err)
    }
})

app.get('/dogs/:id', async(req, res, next) => {
    try {
        const type = await Type.findByPk(req.params.id, {
            include: [Dog]
        })
        
        const html = `
            <html>
                <head>
                    <title>Doodle Type</title>
                </head>
                <body>
                    <h1>${type.name} type:</h1>
                    <a href='/dogs'>Back</a>
                    <ul>
                    ${type.dogs.map( dog => `
                        <li><span><h2>${dog.name}</h2>
                            <form method="POST" action='/dogs/${dog.id}?_method=DELETE'>
                                <button>X</button>
                            </form></span>
                        </li>
                    `).join('')}
                    </ul>
                </body>
            </html>
        `
        res.send(html)
    } catch (err){
        next(err)
    }
})


// Setting up the data

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
