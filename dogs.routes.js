const {
  models: { Dog, Type },
} = require("./db");

const router = require("express").Router();

// Routes

router.delete("/:id", async (req, res, next) => {
  try {
    const dog = await Dog.findByPk(req.params.id);
    await dog.destroy();
    res.redirect(`/dogs/${dog.typeId}`);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    if (!req.body.name) {
      res.send(`<html><h1>Please provide a name!<h1></html>`);
    }
    const nameExists = await Dog.findAll({
      where: {
        name: req.body.name,
      },
    });
    const dog =
      nameExists.length > 0 ? nameExists[0] : await Dog.create(req.body);
    res.redirect(`/dogs/${dog.typeId}`);
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const dogs = await Dog.findAll({
      include: [Type],
    });
    const types = await Type.findAll();
    const options = types.map(
      (type) => `
        <option value=${type.id}>
            ${type.name}
        </option>
    `
    );
    const htmlForm = `
        <form method="POST">
            <input name="name" placeholder="dog's name"/>
            <select name="typeId"/>
                ${options}
            </select>
            <button>Add</button>
        </form>
    `;
    res.send(`
            <html>
                <head>
                    <link rel='stylesheet' href="/styles.css" />
                    <title>Doodle Dogs</title>
                </head>
                <body>
                    <h1>Eros And Doodle Friends!<h2>
                    ${htmlForm}
                    <ul>
                        ${dogs
                          .map(
                            (dog) =>
                              `<li>${dog.name} <a href="/dogs/${
                                dog.typeId ? dog.typeId : "otherBreed"
                              }">${
                                dog.type ? dog.type.name : "Not a doodle!"
                              }</a></li>`
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

router.get("/otherBreed", (req, res) => {
  try {
    res.send(`
        <div>
            <h1>Rooster is an Australian Shepherd</h1>
        </div>
        `);
  } catch (err) {
    console.log(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const type = await Type.findByPk(req.params.id, {
      include: [Dog],
    });

    const html = `
            <html>
                <head>
                    <title>Doodle Type</title>
                </head>
                <body>
                    <h1>${type.name} type:</h1>
                    <a href='/dogs'>Back</a>
                    <ul>
                    ${type.dogs
                      .map(
                        (dog) => `
                        <li><span><h2>${dog.name}</h2>
                            <form method="POST" action='/dogs/${dog.id}?_method=DELETE'>
                                <button>X</button>
                            </form></span>
                        </li>
                    `
                      )
                      .join("")}
                    </ul>
                </body>
            </html>
        `;
    res.send(html);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
