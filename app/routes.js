var Subjects = require('./models/SubjectViews');
var Weight = require('./models/WeightsSchema');
var Stations = require("./models/StationsSchema");
var Status = require("./models/StatusSchema");

module.exports = function (app) {

    // server routes ===========================================================
    // handle things like api calls
    // authentication routes
    // sample api route
    app.get('/api/data', function (req, res) {
        // use mongoose to get all nerds in the database
        Subjects.find({}, {
            '_id': 0,
            'school_state': 1,
            'resource_type': 1,
            'poverty_level': 1,
            'date_posted': 1,
            'total_donations': 1,
            'funding_status': 1,
            'grade_level': 1
        }, function (err, subjectDetails) {
            // if there is an error retrieving, send the error.
            // nothing after res.send(err) will execute
            if (err)
                res.send(err);
            res.json(subjectDetails); // return all nerds in JSON format
        });
    });


    app.get('/api/weights', function (req, res) {
        Weight.find({}, {_id: 0, __v: 0}).sort({ts: 'asc'}).exec(function (err, weights) {
            // console.log(weights);
            res.json(weights)
        });
    });

    app.get('/api/stations', function (req, res) {
        Stations.find({}, {_id: 0, __v: 0}).exec(function (err, stations) {
            // console.log(weights);
            res.json(stations)
        });
    });

    app.get('/api/status', function (req, res) {
        Status.find({}, {_id: 0, __v: 0}).exec(function (err, stations) {
            // console.log(weights);
            res.json(stations)
        });
    });

    app.get('/api/status/station/:station', function (req, res) {
        Status.find({}, {_id: 0, __v: 0})
            .where({
                "tag_id":req.params['station'],
                "message_type":"STATUS",
                "message":"PERIODIC"
            })
            .sort({"ts":"desc"})
            .limit(10)
            .exec(
                function (err, stations) {
                    res.json({"millis":new Date().getTime() -  (stations[0]['ts'] * 1000),
                    "station":req.params['station']})
                }
            );
    });

    // frontend routes =========================================================
    app.get('*', function (req, res) {
        res.sendfile('./public/index.html');
    });
};
