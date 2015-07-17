var express = require('express');
var int_encoder = require('int-encoder');
var crypto = require('crypto');
var bodyParser = require('body-parser');

var ENCRYPTION_KEY = "xyz123";
var CLIENT_ID = "1f7a151f3b694598bc1e9d5662390454";
var CLIENT_SECRET = "77b835535aea4deea24812ff3e5565e2";

int_encoder.alphabet();

function encrypt_string(string) {
    var cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
    var crypted = cipher.update(string, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return int_encoder.encode(crypted, 16);
}

function decrypt_string(string) {
    key = int_encoder.decode(string, 16);
    var decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    var dec = decipher.update(key, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

function random(max)
{
    return Math.floor((Math.random() * max) + 1);
}

function generate_randomized_user_code(username)
{
    return encrypt_string(username + ":" + random(100));
}

function decrypt_randomized_user_code(user_code)
{
    var user_random = decrypt_string(user_code);

    return user_random.split(":")[0];
}

function generate_auth_code_for_user(username)
{
    return generate_randomized_user_code(username);
}

var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// ****************** START MOBILE APP API ******************
app.get("/login", function(req, res){

    if(!req.query.username)
    {
        return res.json(400, {error:"Missing 'username' query parameter"});
    }

    // Just encrypt our username as the app OAuth access token
    res.json({ access_token : generate_randomized_user_code(req.query.username) });
});

app.get("/generate_oauth_code", function(req, res){

    if(!req.query.access_token)
    {
        return res.json(400, {error:"Missing 'access_token' query parameter"});
    }

    try
    {
        var username = decrypt_randomized_user_code(req.query.code); // Decrypt the username from the access_token
    }
    catch(e)
    {
        return res.json(401, {error:"Invalid access_token"});
    }

    res.json({ auth_code : generate_auth_code_for_user(username) });
});
// ****************** END MOBILE APP API ******************

// ****************** START OAUTH SERVER ******************
app.get("/oauth/authorize", function(req, res){
    // Just generate a sample username and redirect
    var code = generate_auth_code_for_user("user@test.com");

    res.redirect(req.query.redirect_uri + "?code=" + encodeURIComponent(code) + "&state=" + req.query.state);
});

// Our standard OAuth token exchange endpoint. We'll take a code that was generated previously in the /generate_oauth_code endpoint
app.post("/oauth/token", function(req, res){

    try
    {
        var username = decrypt_randomized_user_code(req.body.code); // Decrypt the username from the code
    }
    catch(e)
    {
        return res.json(401, {error:"Invalid code"});
    }

    // Re-encrypt our username as the app OAuth access token
    res.json({
        token_type : "bearer",
        access_token : generate_randomized_user_code(username)
    });
});
// ****************** END OAUTH SERVER ******************

// ****************** START IFTTT API ******************

app.get("/ifttt/v1/user/info", function(req, res){

    var bearer_token = req.header("Authorization").split(" ")[1];

    try
    {
        var username = decrypt_randomized_user_code(bearer_token); // Decrypt the username from the code
    }
    catch(e)
    {
        return res.json(401, {error:"Invalid access token"});
    }

    res.json({
        "data": {
            "name" : username,
            "id" : username
        }
    });
});

// ****************** END IFTTT API ******************

var server = app.listen(process.env.PORT | 3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Connect with IFTTT Auth Test App listening at http://%s:%s', host, port);
});