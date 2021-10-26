const mongoose = require("mongoose")

module.exports = mongoose.model(
    'Engine',
    new mongoose.Schema({
            etat: String,
            disponible: Boolean,
            annee: Number,
            puissance: String,
            reservoirCarburant: String,
            marque: String,
            modele: String,
            prix: String,
            images: [String]
        }
    )
)
