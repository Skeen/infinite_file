var express = require('express');
var app = express();

app.get('/', function(req, res)
{
    var reply = "Server for loading network connections" + "\n" +
                "Has two endpoints:" + "\n" + 
                "* '/undefined/:num_bytes' : Reply with 'num_bytes' of undefined data" + "\n" +
                "* '/random/:num_bytes' : Reply with 'num_bytes' of random data";
    res.end(reply);
});

app.get('/undefined/:num_bytes', function(req, res) 
{
    gen_reply(req, res, false);
});

app.get('/random/:num_bytes', function(req, res) 
{
    gen_reply(req, res, true);
});

var gen_reply = function(req, res, random)
{
    var num_bytes_str = req.params.num_bytes;   
    var num_bytes = parseInt(num_bytes_str);
    if(num_bytes)
    {
        send_bytes(res, random, num_bytes);
    }
    else
    {
        res.end("Please provide the number of bytes to return!");
    }
}

var crypto = require('crypto');
var send_bytes = function(res, random, num_bytes)
{
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader('Content-Length', num_bytes);
    res.status(200);
    if(random)
    {
        res.setHeader('Content-Disposition', 'attachment; filename=' + num_bytes + ".random");
        crypto.randomBytes(num_bytes, function(err, buffer)
        {
            res.end(buffer);
        });
    }
    else
    {
        res.setHeader('Content-Disposition', 'attachment; filename=' + num_bytes + ".undef");
        res.end(new Buffer(num_bytes));
    }
}

app.listen(3000, function() 
{
    console.log('Example app listening on port 3000!');
});
