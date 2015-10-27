var express = require('express');
var router = express.Router();
var formidable = require('formidable');

var client = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var dbUrl = 'mongodb://localhost:27017/local';


router.get('/', function(req, res) {
    res.render('index.html', {
        imgUrl: ''
    });
});

router.get('/with/:imgUrl', function(req, res) {

    // res.render('index.html');
    res.render('index.html', {
        imgUrl: req.params.imgUrl
    });

    // if(req.params.imgUrl != 'favicon.ico'){
    //     res.render(req.params.page + '.html');
    // }
});

router.post('/save', function(req, res, next) {

    var fileSize = parseInt(req.headers['content-length']);
    if (fileSize > 1600000) {
        res.status(200).send('최대 1.5M 업로드 가능합니다');
    } else {

        var form = new formidable.IncomingForm();
        form.keepExtensions = true;
        form.uploadDir = __dirname + '/../public/img/upload';
        form.parse(req, function(err, fields, files) {
            if (err) {
                throw err;
            }

            if (fields.inputText.indexOf('@reply:') == 0) {
                var reply = {};
                reply.msg = fields.inputText.replace('@reply:', '');
                reply.date = getCurrentDate();
                insertReply(reply, fields.inputId);

            } else {
                var data = {};
                data.msg = fields.inputText;

                var imgUrl = '';
                if (files.inputImage) {
                    var path = files.inputImage.path;
                    path = path.replace('/\\/g', '/');
                    var fileName = path.substr(path.lastIndexOf('/'), path.length);
                    imgUrl = '/img/upload' + fileName;
                }
                data.image = imgUrl;
                data.date = getCurrentDate();
                data.like = 0;
                data.dislike = 0;

                insertTalk(data);
            }
            res.redirect('/');
        });
    }
});

router.post('/getTalks', function(req, res) {
    findAll(res);
});

router.post('/like', function(req, res) {
    like(res, req.body.id);
});

router.post('/dislike', function(req, res) {
    dislike(res, req.body.id);
});

function like(res, id) {
    client.connect(dbUrl, function(err, db) {
        if (err) {
            throw err;
        } else {
            db.collection('talks').update({
                    _id: new ObjectID(id)
                }, {
                    $inc: {
                        like: 1
                    }
                },
                function(err, result) {
                    db.collection('talks').find({
                        _id: new ObjectID(id)
                    }).toArray(function(err, docs) {
                        res.status(200).send({
                            like: docs[0].like
                        });
                        db.close();
                    });
                }
            );
        }

    })
}

function dislike(res, id) {
    client.connect(dbUrl, function(err, db) {
        if (err) {
            throw err;
        } else {
            db.collection('talks').update({
                    _id: new ObjectID(id)
                }, {
                    $inc: {
                        dislike: 1
                    }
                },
                function(err, result) {
                    db.collection('talks').find({
                        _id: new ObjectID(id)
                    }).toArray(function(err, docs) {
                        res.status(200).send({
                            dislike: docs[0].dislike
                        });
                        db.close();
                    });
                }
            );
        }
    })
}

function findAll(res) {

    var today = new Date();
    today.setDate(today.getDate() - 14);
    var searchYear = today.getFullYear();
    var searchMonth = today.getMonth() + 1;
    var searchDate = today.getDate();

    client.connect(dbUrl, function(err, db) {
        if (err) {
            throw err;
        } else {
            db.collection('talks')
            .find({
                'date.year':{$gte:searchYear},
                'date.month':{$gte:searchMonth},
                'date.day':{$gte:searchDate}
            })
            .sort({
                'mdate.year': -1,
                'mdate.month': -1,
                'mdate.day': -1,
                'mdate.hour': -1,
                'mdate.min': -1,
                'mdate.sec': -1
            })
            .limit(50)
            .toArray(function(err, docs) {
                if (err) {
                    throw err;
                } else {
                    db.collection('talks').find({
                            $and :[
                                {like: {
                                    $gt: 0
                                }},
                                {dislike: {
                                    $ne: -1
                                }},
                                {
                                    'date.year':{$gte:searchYear},
                                    'date.month':{$gte:searchMonth},
                                    'date.day':{$gte:searchDate}
                                }
                            ]
                        })
                        .sort({
                            'like': -1
                        })
                        .limit(3)
                        .toArray(function(err, docsTop3) {
                            var result = {
                                top3: docsTop3,
                                all: docs
                            };
                            res.status(200).send(result);
                            db.close();
                        });

                }

            })
        }

    });
}

function insertTalk(data) {
    client.connect(dbUrl, function(err, db) {
        if (err) {
            throw err;
        } else {
            data.mdate = data.date;
            db.collection('talks').insert(data);
        }
        db.close();
    })
}

function insertReply(data, talkId) {
    client.connect(dbUrl, function(err, db) {
        if (err) {
            throw err;
        } else {
            db.collection('talks').update({
                _id: new ObjectID(talkId)
            }, {
                $push: {
                    replies: {
                        msg: data.msg,
                        date: data.date
                    }
                }
            }, {
                upsert: true
            });
            db.collection('talks').update({
                _id: new ObjectID(talkId)
            }, {
                $set: {mdate: data.date}
            })
        }
        db.close();
    })
}

function getCurrentDate() {
    var date = new Date();
    var result = {};
    result.year = date.getFullYear();
    result.month = date.getMonth() + 1;
    result.day = date.getDate();
    result.hour = date.getHours();
    result.min = date.getMinutes();
    result.sec = date.getSeconds();
    return result;

}

module.exports = router;
