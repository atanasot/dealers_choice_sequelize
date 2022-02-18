const Sequelize = require('sequelize')
const db = new Sequelize("postgres://localhost/avengers_db")
const promises = await Promise.all([
    Movie.findByPk(req.params.id),
    Movie.findByPk(req.params.id, {
        include: [Star]
    })
])

const movie = await Movie.findByPk(req.params.id, {
    include: [Star]
})