const router = require("express").Router();
const Engine = require("../models/engine");
const _ = require("lodash");
const {setOrGetData} = require("../redis")
const {addData} = require("../redis")
const {editData} = require("../redis")
const {deleteData} = require("../redis")
const {searchData} = require("../redis")
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mv = require('mv');

const upload = multer({dest: 'public/'}).array("newImages");

const moveFiles = (req, engine) => {
    const rootPath = path.join(path.dirname(require.main.filename), 'public');
    const dirPath = path.join(rootPath, engine._id.toString());
    if (!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath);
    }
    for (let i = 0; i < req.files.length; i++) {
        const oldFilePath = path.join(rootPath, req.files[i].filename);
        const newFilePath = path.join(dirPath, req.files[i].filename);
        mv(oldFilePath, newFilePath, err => {
            return err;
        });
    }
}

router.post("", (req, res) => {
    upload(req, res, async (err) => {
        if (err) res.status(400).send({error: err});
        let engine = new Engine(_.pick(req.body, "etat", "disponible", "annee", "puissance", "reservoirCarburant", "marque", "modele", "prix", "images"));
        let imgs = [];
        for (let i = 0; i < req.files.length; i++) {
            imgs.push(`http://localhost:3000/${engine._id.toString()}/${req.files[i].filename}`);
        }
        engine.images = imgs;
        let engines;
        try {
            engines = await addData("engines", async () => {
                try {
                    const newEngine = await engine.save();
                    moveFiles(req, newEngine);
                    return newEngine;
                } catch (err) {
                    console.log('err is here: ' + err);
                    return err
                }
            })
        } catch (e) {
            console.log('the error is: ' + e)
        }
        return res.send(engines)
    });
});

router.get("", async (req, res) => {
    const engines = await setOrGetData("engines", async () => {
        try {
            return await Engine.find()
        } catch (err) {
            return err
        }
    })
    res.send(engines)
});

router.get("/:id", async (req, res) => {
    const engine = await setOrGetData(`engineID=${req.params.id}`, async () => {
        try {
            return await Engine.findById(req.params.id)
        } catch (err) {
            return err
        }
    })
    res.send(engine)
});

router.put("/:id", async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            res.status(400).send({error: err});
        }
        try {
            let allImgs = [];
            if (req.body.images) {
                allImgs = JSON.parse(req.body.images);
            }
            if (req.files) {
                for (let i = 0; i < req.files.length; i++) {
                    allImgs.push(`http://localhost:3000/${req.params.id}/${req.files[i].filename}`);
                }
            }
            let engine = await Engine.findById(req.params.id);
            if (req.body.imgToDelete) {
                req.body.imgToDelete = JSON.parse(req.body.imgToDelete);
                for (let imgID of req.body.imgToDelete) {
                    const imageID = imgID.split("/").pop();
                    try {
                        fs.unlinkSync(path.join(path.dirname(require.main.filename), 'public', engine._id.toString(), imageID));
                    } catch (err) {
                        console.error(err)
                    }
                }
                delete req.body.imgToDelete;
            }

            engine = _.merge(engine, req.body);
            if (req.body.images) {
                engine.images = allImgs;
            }
            let engines;
            try {
                engines = await editData("engines", async () => {
                    try {
                        const updatedEngine = await engine.save();
                        moveFiles(req, updatedEngine);
                        return updatedEngine;
                    } catch (err) {
                        return err
                    }
                })
            } catch (e) {
                console.log('the error is: ' + e)
            }
            return res.send(engines)
        } catch (err) {
            return res.send(err);
        }
    });
});

router.delete('/:id', async (req, res) => {
    let engines;
    try {
        engines = await deleteData("engines", async () => {
            try {
                const engine = await Engine.findByIdAndDelete(req.params.id);
                if (engine.images) {
                    for (let imgUrl of engine.images) {
                        const imageID = imgUrl.split("/").pop();
                        try {
                            fs.unlinkSync(path.join(path.dirname(require.main.filename), 'public', imageID));
                        } catch (err) {
                            console.error(err)
                        }
                    }
                }
                return engine;
            } catch (err) {
                return err;
            }
        })
    } catch (e) {
        console.log('the error is: ' + e)
    }
    return res.send(engines)
});

router.get('/search/:query/:searchBy', async (req, res) => {
    try {
        const engines = await searchData("engines", req.params.query, req.params.searchBy);
        return res.send(engines);
    } catch (err) {
        return res.status(500).send(err);
    }
})

module.exports = router;
