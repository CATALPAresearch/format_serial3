/* eslint-disable capitalized-comments */
/* eslint-disable no-labels */
/* eslint-disable no-console */
var lanes = [[], [], [], [],[]];
var ms = [
    { id: 1, start: '2019-12-19T11:00:00.000Z', end: '2019-12-20T11:00:00.000Z' },
    { id: 2, start: '2019-12-21T11:00:00.000Z', end: '2019-12-24T11:00:00.000Z' },
    { id: 3, start: '2019-01-21T11:00:00.000Z', end: '2019-12-31T11:00:00.000Z' },
    { id: 4, start: '2019-12-21T11:00:00.000Z', end: '2019-12-24T11:00:00.000Z' },
    { id: 5, start: '2019-10-21T11:00:00.000Z', end: '2019-10-24T11:00:00.000Z' },
    { id: 6, start: '2019-10-20T11:00:00.000Z', end: '2019-10-24T11:00:00.000Z' }
];
var moment = require('./lib/moment.min');

var milestones = ms.map(function (e) {
    return { id: e.id, start: e.start, end: e.end };
});

msLoop:
for (var i = 0; i < milestones.length; i++) {
    lanesLoop:
    for (var lane = 0; lane < lanes.length; lane++) {
        if (lanes[lane].length === 0) {
            lanes[lane].push(milestones[i]);
            break lanesLoop;
        }
        var geht = true;
        // eslint-disable-next-line no-unused-labels
        insideLaneLoop:
        for (var j = 0; j < lanes[lane].length; j++) {
            if (moment(milestones[i].end).diff(moment(lanes[lane][j].start)) < 0) {
                // ms liegt davor
                //break insideLaneLoop;
            } else if (moment(milestones[i].start).diff(moment(lanes[lane][j].end)) > 0) {
                // ms liegt dahinter
                //break insideLaneLoop;
            } else {
                geht = false;
                //break lanesLoop;
            }
        }
        if (geht) {
            lanes[lane].push(milestones[i]);
            break lanesLoop;
        }
    }
}

console.log(lanes)