const Redis = require("redis")
const _ = require("lodash")
const redisClient = Redis.createClient()
const EXPIRE_DATE = 3600

const setOrGetData = (key, cb) => {
    return new Promise((resolve, reject) => {
        redisClient.get(key, async (err, cashedData) => {
            if (err) console.error(err)
            if (cashedData != null) return resolve(JSON.parse(cashedData))
            try {
                const data = await cb();
                redisClient.setex(key, EXPIRE_DATE, JSON.stringify(data));
                return resolve(data);
            } catch (err) {
                return reject(err);
            }
        })
    })
}

const addData = (key, cb) => {
    return new Promise((resolve, reject) => {
        redisClient.get(key, async (err, cashedData) => {
            if (err) console.error(err)
            try {
                const data = await cb();
                if (cashedData != null) {
                    cashedData = JSON.parse(cashedData);
                } else {
                    cashedData = [];
                }
                cashedData.push(data);
                redisClient.setex(key, EXPIRE_DATE, JSON.stringify(cashedData));
                return resolve(cashedData);
            } catch (err) {
                return reject(err);
            }
        })
    })
}

const editData = (key, cb) => {
    return new Promise((resolve, reject) => {
        redisClient.get(key, async (err, cashedData) => {
            if (err) console.error(err)
            try {
                const data = await cb();
                if (cashedData != null) {
                    cashedData = JSON.parse(cashedData);
                    const engineToEditIndex = cashedData.findIndex(e => e._id.toString() === data._id.toString());
                    if (engineToEditIndex !== -1) {
                        cashedData[engineToEditIndex] = data;
                    }
                    console.log(cashedData);
                } else {
                    cashedData = [];
                    cashedData.push(data);
                }
                redisClient.setex(key, EXPIRE_DATE, JSON.stringify(cashedData));
                return resolve(cashedData);
            } catch (err) {
                return reject(err);
            }
        })
    })
}

const deleteData = (key, cb) => {
    return new Promise((resolve, reject) => {
        redisClient.get(key, async (err, cashedData) => {
            if (err) console.error(err)
            try {
                const data = await cb();
                if (cashedData != null) {
                    cashedData = JSON.parse(cashedData);
                    const engineToDeleteIndex = cashedData.findIndex(e => e._id.toString() === data._id.toString());
                    if (engineToDeleteIndex !== -1) {
                        cashedData.splice(engineToDeleteIndex, 1);
                    }
                    console.log(cashedData);
                }
                redisClient.setex(key, EXPIRE_DATE, JSON.stringify(cashedData));
                return resolve(cashedData);
            } catch (err) {
                return reject(err);
            }
        })
    })
}

const searchData = (key, query, searchBy) => {
    return new Promise(((resolve, reject) => {
        redisClient.get(key, async (err, cashedData) => {
            try {
                if (err) console.error(err);
                if (cashedData != null) {
                    cashedData = JSON.parse(cashedData);
                    if (query === 'null') return resolve(cashedData);
                    return resolve(cashedData.filter(e => _.startsWith(e[searchBy].toUpperCase(), query.toUpperCase())));
                }
                return resolve([])
            } catch (err) {
                reject(err)
            }
        })
    }))
}

module.exports.setOrGetData = setOrGetData
module.exports.addData = addData
module.exports.editData = editData
module.exports.deleteData = deleteData
module.exports.searchData = searchData
