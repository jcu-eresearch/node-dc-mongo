var binstruct = require('binstruct');
var Decimal = require('decimal.js');
var mongoose = require('mongoose');
var moment = require("moment");
var Weight = require("./models/WeightsSchema");

require('buffertools').extend();




Decimal.config({precision: 64, rounding: 4});
// var url = 'mongodb://localhost:27017/digitalhomestead';

function unpack(message) {
    buffer = new Buffer(message, 'hex');
    unpacker = binstruct.def({int64mode: binstruct.int64modes.lossy, littleEndian: true})
        .uint64('id', {int64mode: binstruct.int64modes.copy})
        .int32('weight')
        .wrap(buffer);
    var id = Decimal('0x' + unpacker.id.reverse().toString('hex')).toString();
    return {
        'id': id == "18446744073709551615" ? "-1" : id,
        'weight': unpacker.weight / 100
    }
}

function insert_weight(connectionsubject, message, unpacked_data) {
    // var Weight = connectionsubject.model('Weight', weightSchema);
    var ins = Weight({
        id: unpacked_data.id,
        weight: unpacked_data.weight,
        rssi: message.rssi,
        tag_id: message.tag_id,
        sequence: message.sequence,
        receiver: message.receiver,
        date: moment(message.time * 1000),
        ts: message.time
    });

    ins.save(function (err, data) {
        if (err) console.log(err);
        else console.log('Saved : ', data );
    });
}

function taggle(connectionsubject) {
    return function _taggle(message) {
        console.log(message);
        if ('data' in message) {
            if ('user_payload' in message['data']) {
                // console.log("===============");
                // console.log(message);
                var unpacked_data = unpack(message['data']['user_payload']);
                // console.log(unpacked_data);
                insert_weight(connectionsubject, message, unpacked_data);
            } else if ('alt_data' in message['data']) {
                //Status Messages
            }
        }
    }
}

function init(connectionsubject) {
    // console.log(connectionsubject);
    var pubnub = require("pubnub")({
        ssl: true,  // <- enable TLS Tunneling over TCP
        publish_key: "demo",
        subscribe_key: "sub-c-3d7ba416-92ba-11e3-b2cd-02ee2ddab7fe"
    });

    var t = taggle(connectionsubject);
    // pubnub.history({
    //     channel : 'jcu.180181',
    //     callback : function(m){
    //         for(message in m[0])
    //         {
    //             t(m[0][message]);
    //             // console.log("==========================");
    //         }
    //
    //     },
    //     count : 100000, // 100 is the default
    //     reverse : false // false is the default
    // });

    pubnub.subscribe({
        channel: "jcu.180181",
        callback: t
    });
}

module.exports = init;