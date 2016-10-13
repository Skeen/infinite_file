var express = require('express');
var cors = require('cors');

var app = express();
app.use(cors());

app.get('/', function(req, res)
{
    var reply = "Server for loading network connections" + "\n" +
                "Has two endpoints:" + "\n" + 
                "* '/undefined/:num_bytes/:throttle?' : Reply with 'num_bytes' of undefined data (at speed of 'trottle' bps)" + "\n" +
                "* '/random/:num_bytes/:throttle?' : Reply with 'num_bytes' of random data (at speed of 'throttle' bps)" + "\n" + 
                "* '/hang/:timeout' : Reply after 'timeout' milliseconds";
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

app.get('/hang/:timeout', function(req, res)
{
    var timeout_str = req.params.timeout;
    var timeout = parseInt(timeout_str);

    if(timeout_str === undefined)
    {
        res.status(400);
        res.end("Please provide an timeout value!");
    }
    else if(isNaN(timeout))
    {
        res.status(400);
        res.end("Please provide an integer timeout value!");
    }
    else if(timeout < 0)
    {
        res.status(400);
        res.end("Please provide a non-negative timeout value!");
    }
    else
    {
        setTimeout(function()
        {
            res.status(200);
            res.end("Timeout (" + timeout + ") done!");
        }, timeout);
    }
});

var gen_reply = function(req, res, random)
{
    var num_bytes_str = req.params.num_bytes;   
    var num_bytes = parseInt(num_bytes_str);

    var throttle_speed_str = req.params.throttle;
    var throttle_speed = parseInt(throttle_speed_str);
    if(isNaN(num_bytes))
    {
        res.status(400);
        res.end("Please provide an integer byte value!");
    }
    else if(num_bytes < 0)
    {
        res.status(400);
        res.end("Please provide a non-negative byte value!");
    }
    else 
    {
        send_bytes(res, random, num_bytes, throttle_speed);
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

var port = 3000;
app.listen(port, function() 
{
    console.log('Network load server on port: ' + port);
});
