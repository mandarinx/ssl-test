var express         = require('express'),
    http            = require('http'),
    path            = require('path');

var port = process.env.PORT || 5000;
var app = express().set('port', port);
var prod = process.env.NODE_ENV === 'production';

app.get('*',function(req,res,next) {
    if (req.headers['x-forwarded-proto'] !== 'https' &&
        prod) {
        res.redirect('https://' + req.headers.host + req.url);
    } else {
        next();
    }
});

app.get('/.well-known/acme-challenge/:acmeToken', function(req, res, next) {
    var acmeToken = req.params.acmeToken;
    var acmeKey;

    if (process.env.ACME_KEY && process.env.ACME_TOKEN) {
        if (acmeToken === process.env.ACME_TOKEN) {
            acmeKey = process.env.ACME_KEY;
        }
    }

    for (var key in process.env) {
        if (key.startsWith('ACME_TOKEN_')) {
            var num = key.split('ACME_TOKEN_')[1];
            if (acmeToken === process.env['ACME_TOKEN_' + num]) {
                acmeKey = process.env['ACME_KEY_' + num];
            }
        }
    }

    if (acmeKey) {
        res.send(acmeKey);
    } else {
        res.status(404).send();
    }
});

app.get('/', function(req, res, next) {
    res.send('Index');
});

process.on('SIGTERM', function() {
    app.close(function() {
        console.log('app closed');
        process.exit();
    });
});

app.listen(port, function() {
    console.log('server listening on '+port);
});
