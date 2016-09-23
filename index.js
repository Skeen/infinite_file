var express = require('express');
var cors = require('cors');

var app = express();
app.use(cors());

app.get('/', function(req, res)
{
    var reply = "Server for loading network connections" + "\n" +
                "Has two endpoints:" + "\n" + 
                "* '/undefined/:num_bytes/:throttle?' : Reply with 'num_bytes' of undefined data (at speed of 'trottle' bps)" + "\n" +
                "* '/random/:num_bytes/:throttle?' : Reply with 'num_bytes' of random data (at speed of 'throttle' bps)";
    res.end(reply);
});

app.get('/undefined/:num_bytes/:throttle?', function(req, res) 
{
    gen_reply(req, res, false);
});

app.get('/random/:num_bytes/:throttle?', function(req, res) 
{
    gen_reply(req, res, true);
});

var gen_reply = function(req, res, random)
{
    var num_bytes_str = req.params.num_bytes;   
    var num_bytes = parseInt(num_bytes_str);

    var throttle_speed_str = req.params.throttle;
    var throttle_speed = parseInt(throttle_speed_str);
    if(num_bytes)
    {
        send_bytes(res, random, num_bytes, throttle_speed);
    }
    else
    {
        res.end("Please provide the number of bytes to return!");
    }
}

var crypto = require('crypto');
var send_bytes = function(res, random, num_bytes, throttle_speed)
{
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader('Content-Length', num_bytes);
    res.status(200);

    var reply = function(res, buffer)
    {
        if(throttle_speed)
        {
            var Throttle = require('throttle');
            var throttle = new Throttle(throttle_speed);

            var stream = require('stream');
            var bufferStream = new stream.PassThrough();
            bufferStream.end(buffer);
            bufferStream.pipe(throttle).pipe(res);
        }
        else
        {
            res.end(buffer);
        }
    }

    if(random)
    {
        res.setHeader('Content-Disposition', 'attachment; filename=' + num_bytes + ".random");
        crypto.randomBytes(num_bytes, function(err, buffer)
        {
            reply(res, buffer);
        });
    }
    else
    {
        res.setHeader('Content-Disposition', 'attachment; filename=' + num_bytes + ".undef");
        reply(res, new Buffer(num_bytes));
    }
}

app.listen(3000, function() 
{
    console.log('Example app listening on port 3000!');
});
