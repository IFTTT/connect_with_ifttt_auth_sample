# Connect with IFTTT Auth Server Sample

A **fake** OAuth2 server, mobile API and IFTTT Channel to demonstrate how to implement the server side portion of the Connect with IFTTT SDK.

### To Run

`> node app`

### Endpoints

`app.get("/login", function(req, res)` - This should be considered something that most apps would already have implemented in a private API to authenticate users of an existing mobile application.
This function essentially simulates generating some sort of token that is used for private API access. It might be OAuth based, but it might not be.

`app.get("/generate_oauth_code", function(req, res)` - This is a new function that will need to be implemented on your private API. This will be used to generate a valid OAuth2 Authorization code (as per https://tools.ietf.org/html/rfc6749#section-4.1) that
you will hand off to the Connect with IFTTT SDK and will be used later by the IFTTT server to exchange for an OAuth bearer token. Since this is a private authenticated API call, it will most likely use the token generated for private API access for your app.
**In most cases this should be the only new thing you need to implement on your server to support the Connect with IFTTT SDK.**

`app.get("/ifttt/v1/user/info", function(req, res)` - This is an API endpoint that you'll need to implement for your IFTTT Channel. If you have an IFTTT Channel, you've built this already.

All of the remaining functions are simulations of standard OAuth endpoints that would already be implemented by your OAuth server.
