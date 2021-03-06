/**
 * Created by solomon on 14-8-21.
 */
var getAllUserIds = function (dataManager, callback) {
    dataManager.cache.getHashFields('origin@user', function (err, data) {
        callback(err, data);
    })
};

var getAllTracks = function (dataManager, callback) {

    getAllUserIds(dataManager, function (err, userIdsArray) {

        var prefix = 'origin@track@';
        var url = dataManager.config.mothership_url + '/tracks?$and=[{"data.event":"$event_key"},{"data.properties.distinct_id":"$username"},{"$or":[{"data.properties.usergroup":"student"},{"data.properties.roles":"student"}]}]';

        dataManager.getCache('basic@track', function (err, trackEventNamesArray) {
            if (err) {
                console.error(err);
                callback(err)
            } else {
                var taskGroups = [];
                _.each(trackEventNamesArray, function (trackEventName) {
                    taskGroups.push(function (cb) {
                        var userTasks = [];
                        _.each(userIdsArray, function (userId) {
                            userTasks.push(function (callback) {
                                dataManager.cache.getHash("origin@user", userId, function (err, user) {
                                    var username = JSON.parse(user).username;
                                    dataManager.request({"url": url.replace('$event_key', trackEventName).replace('$username', username)}, function (err, data) {
                                        if (err) {
                                            console.error(err);
                                            callback(err, '404');
                                        } else {
                                            var trackSet = {};
                                            _.each(JSON.parse(data), function (track) {
                                                trackSet[track._id] = track;
                                            });

                                            dataManager.cache.setHash(prefix + userId + '@' + trackEventName, trackSet, function (err, results) {
                                                callback(null, "200");
                                            });
                                        }
                                    });
                                })

                            })
                        });
                        async.parallelLimit(userTasks, 100, function (err, results) {
                            cb(err, results);
                        })
                    });
                });

                async.series(taskGroups, function (err, results) {
                    if (err) {
                        console.error(err);
                    } else {
                        //console.log(results);
                    }
                    callback(err);
                });
            }
        });

    });
};

exports.create = function (mDataManager, callback) {
    getAllTracks(mDataManager, function (err, data) {
        var ret = 'OK';
        if (err) {
            console.error(err);
            ret = 'Error';
        }
        callback(err, ret);
    });
};

exports.restore = function () {

};
