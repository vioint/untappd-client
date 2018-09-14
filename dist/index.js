'use strict';
const request = require('request');
const util = require('util');
const apiVer = 'v4';
const baseApiUrl = 'https://api.untappd.com';
const baseAuthUrl = 'https://untappd.com/oauth/';
var ApiMethod;
(function (ApiMethod) {
    ApiMethod[ApiMethod["GET"] = 0] = "GET";
    ApiMethod[ApiMethod["POST"] = 1] = "POST";
})(ApiMethod || (ApiMethod = {}));
var UntappdAPI;
(function (UntappdAPI) {
    class UntappdClient {
        /**
         * @param opts {
         * 	@param clientId The API client ID
         * 	@param clientSecret The API client secret
         * 	@param clientToken An API user token
         * 	@param debug Either true or false to enable debug messages
         * }
         */
        constructor(opts) {
            this.debug = false;
            this.makeRequest = function (reqMethod, path, params, callback) {
                return new Promise((resolve, reject) => {
                    var reqUrl = `${baseApiUrl}/${apiVer}/${path}`;
                    var oauthInfo = this.token ?
                        { access_token: this.token } :
                        { client_id: this.clientId, client_secret: this.clientSecret };
                    var resHandler = function (err, res, body) {
                        if (callback) {
                            callback(err, body);
                        }
                        else {
                            if (this.debug) {
                                console.log(`A ${reqMethod} request to '${path}' with the parameters \n ${util.inspect(arguments)} returned \n ${util.inspect(body)}`);
                            }
                            if (err) {
                                if (this.debug) {
                                    console.error(err);
                                }
                                else {
                                    reject(err);
                                }
                            }
                            else {
                                resolve(body);
                            }
                        }
                    };
                    var reqOpts = {
                        method: reqMethod,
                        url: reqUrl,
                        oauth: { transport_method: 'query' },
                        qs: oauthInfo,
                        json: true,
                        form: null
                    };
                    if (reqMethod === ApiMethod.GET) {
                        reqOpts.qs = Object.assign(reqOpts.qs, params);
                    }
                    else if (reqMethod === ApiMethod.POST) {
                        reqOpts.form = params;
                    }
                    request(reqOpts, resHandler);
                });
            };
            opts = opts || {};
            this.clientId = opts.clientId;
            this.clientSecret = opts.clientSecret;
            this.token = opts.clientToken;
            this.debug = opts.debug;
            if (!this.token && !(this.clientId && this.clientSecret)) {
                throw new Error('Missing required client id and/or client secret.');
            }
        }
        setClientId(newClientId) {
            this.clientId = newClientId;
            return this;
        }
        getClientId() {
            return this.clientId;
        }
        setClientSecret(newClientSecret) {
            this.clientSecret = newClientSecret;
            return this;
        }
        getClientSecret() {
            return this.clientSecret;
        }
        setAccessToken(newAccessToken) {
            this.token = newAccessToken;
            return this;
        }
        getAccessToken() {
            return this.token;
        }
        hasToken() {
            return !!this.token;
        }
        hasId() {
            return !!this.clientId;
        }
        hasSecret() {
            return !!this.clientSecret;
        }
        validateParam(param, key) {
            if (param === null) {
                throw new Error(`'${key}' is a required parameter`);
            }
        }
        validateToken() {
            if (!this.hasToken())
                throw new Error('An access token is required but it was not specified');
        }
        /**
         * Generates a url that will return an access token via client-side authentication
         * @param {string} redirectUrl the callback url that will get the access token
         */
        getAuthenticationTokenUrl(redirectUrl) {
            if (!this.hasId())
                throw new Error('OAuth authentication requires a client id');
            const authUrl = baseAuthUrl +
                'authenticate/?client_id=' + this.clientId +
                '&response_type=token' +
                '&redirect_url=' + redirectUrl;
            return authUrl;
        }
        /**
         * Generates a url for server-side OAuth first phase - getting the OAuth 2.0 code
         * @param {string} redirectUrl the callback url that will get the code
         * @param {string} state Optional: A state object (to be returned to the server for CSRF protection)
         */
        getAuthenticationCodeUrl(redirectUrl, state) {
            if (!this.hasId())
                throw new Error('OAuth authentication requires a client id (and a client secret for phase 2)');
            let authUrl = baseAuthUrl +
                'authenticate/?client_id=' + this.clientId +
                '&response_type=code' +
                '&redirect_url=' + redirectUrl;
            if (state) {
                authUrl += '&state=' + state;
            }
            return authUrl;
        }
        /**
         * Generates a url for server-side OAuth second phase - the url for acquiring the OAuth 2.0 access token
         * @param {string} redirectUrl the callback url that will get the access token
         * @param {string} code the code received in the initial authentication step
         */
        getAuthorizationUrl(redirectUrl, code) {
            if (!(this.hasId() && this.hasSecret()))
                throw new Error('OAuth authentication requires a client id and a client secret');
            const authUrl = baseAuthUrl +
                'authorize/?client_id=' + this.clientId +
                '&client_secret=' + this.clientSecret +
                '&response_type=code' +
                '&redirect_url=' + redirectUrl +
                '&code=' + code;
            return authUrl;
        }
        /**
         * Returns the access token for the code obtained in the initial server-side based OAuth authentication
         * @param {string} redirectUrl the original callback url that was used to obtain the code
         * @param {string} code the code received in the initial authentication step
         * @param {Function} callback a callback to recieve the access token or error
         */
        acquireAccessToken(redirectUrl, code, callback) {
            return new Promise((resolve, reject) => {
                var reqUrl = this.getAuthorizationUrl(redirectUrl, code);
                var reqOpts = {
                    method: ApiMethod.GET,
                    url: reqUrl,
                    json: true
                };
                request(reqOpts, (err, res, body) => {
                    if (callback) {
                        callback(err, err ? body : body.response.access_token);
                    }
                    else {
                        if (this.debug) {
                            console.log(`Authorization returned \n ${util.inspect(body)}`);
                        }
                        if (err) {
                            if (this.debug) {
                                console.error(err);
                            }
                            else {
                                reject(err);
                            }
                        }
                        else {
                            resolve(body);
                        }
                    }
                });
            });
        }
        /* Feeds */
        /**
         * This method allows you the obtain all the friend check-in feed of the authenticated user.
         * This includes only beer checkin-ins from Friends. By default it will return at max 25 records.
         *
          @param {Object}	opts where :
          -	access_token 	(string, required)	- The access token of the authenicated user.
          -	max_id				(int, optional) 		- The checkin ID that you want the results to start with.
          -	min_id				(int, optional) - Returns only checkins that are newer than this value.
          -	limit					(int, optional)			- The number of results to return, max of 50, default is 25.
    
          @param {Function} callback The function to receive the response or the error
    
          https://untappd.com/api/docs#activityfeed
        */
        activityFeed(opts, callback) {
            this.validateToken();
            opts = Object.assign({}, opts);
            return this.makeRequest(ApiMethod.GET, 'checkin/recent', opts, callback);
        }
        /**
          USERNAME (string, optional) - The username that you wish to call the request upon. If you do not provide a username - the feed will return results from the authenticated user (if the access_token is provided).
          max_id (int, optional) - The checkin ID that you want the results to start with.
          min_id (int, optional) - Returns only checkins that are newer than this value.
          limit (int, optional) - The number of results to return, max of 25, default is 25
    
          https://untappd.com/api/docs#useractivityfeed
        */
        userActivityFeed(opts, callback) {
            if (!this.hasToken())
                this.validateParam(opts.username, 'username');
            return this.makeRequest(ApiMethod.GET, 'user/checkins/' + (opts.username || ''), opts, callback);
        }
        /**
          lat (float, required) - The latitude of the query
          lng (float, required) - The longitude of the query
          max_id (int, optional) - The checkin ID that you want the results to start with
          min_id (int, optional) - Returns only checkins that are newer than this value
          limit (int, optional) - The number of results to return, max of 25, default is 25
          radius (int, optional) - The max radius you would like the check-ins to start within, max of 25, default is 25
          dist_pref (string, optional) - If you want the results returned in miles or km. Available options: 'm', or 'km'. Default is 'm'
    
          https://untappd.com/api/docs#theppublocal
        */
        pubFeed(latitude, longitude, opts, callback) {
            var reqBody = Object.assign({ lat: latitude, lng: longitude }, opts);
            return this.makeRequest(ApiMethod.GET, 'thepub/local', reqBody, callback);
        }
        /**
          VENUE_ID (int, required) - The Venue ID that you want to display checkins
          max_id (int, optional) - The checkin ID that you want the results to start with
          min_id (int, optional) - Returns only checkins that are newer than this value
          limit (int, optional) - The number of results to return, max of 25, default is 25
    
          https://untappd.com/api/docs#venueactivityfeed
        */
        venueActivityFeed(venueId, opts, callback) {
            return this.makeRequest(ApiMethod.GET, 'venue/checkins/' + venueId, opts, callback);
        }
        /**
          BID (int, required) - The beer ID that you want to display checkins
          access_token or client_id and client_secret (string, required) - Either pass the access_token for authorized calls OR the client_id and client_secret for unauthorized calls
          max_id (int, optional) - The checkin ID that you want the results to start with
          min_id (int, optional) - Returns only checkins that are newer than this value
          limit (int, optional) - The number of results to return, max of 25, default is 25
    
          https://untappd.com/api/docs#beeractivityfeed
        */
        beerActivityFeed(beerId, opts, callback) {
            return this.makeRequest(ApiMethod.GET, 'beer/checkins/' + beerId, opts, callback);
        }
        /**
          BREWERY_ID (int, required) - The Brewery ID that you want to display checkins
          max_id (int, optional) - The checkin ID that you want the results to start with
          min_id (int, optional) - Returns only checkins that are newer than this value
          limit (int, optional) - The number of results to return, max of 25, default is 25
    
          https://untappd.com/api/docs#breweryactivityfeed
        */
        breweryActivityFeed(breweryId, opts, callback) {
            return this.makeRequest(ApiMethod.GET, 'brewery/checkins/' + breweryId, opts, callback);
        }
        /**
          offset (int, optional) - The numeric offset that you what results to start
          limit (int, optional) - The number of records that you will return (max 25, default 25)
    
          https://untappd.com/api/docs#notifications
        */
        notifications(opts, callback) {
            this.validateToken();
            return this.makeRequest(ApiMethod.GET, 'notifications', opts, callback);
        }
        /*** Info / Search **/
        /**
          USERNAME (string, optional) - The username that you wish to call the request upon. If you do not provide a username - the feed will return results from the authenticated user (if the access_token is provided)
          compact (string, optional) - You can pass 'true' here only show the user infomation, and remove the 'checkins', 'media', 'recent_brews', etc attributes
    
          Note: If you use a user's access token, the 'settings' attribute for the user will be
          included in the response, otherwise you will get an empty settings block.
    
          https://untappd.com/api/docs#userinfo
        */
        userInfo(opts, callback) {
            if (!this.hasToken())
                this.validateParam(opts.username, 'username');
            return this.makeRequest(ApiMethod.GET, 'user/info/' + (opts.username || ''), opts, callback);
        }
        /**
          USERNAME (string, optional) - The username that you wish to call the request upon. If you do not provide a username - the feed will return results from the authenticated user (if the access_token is provided)
          offset (int, optional) - The numeric offset that you what results to start
          limit (int, optional) - The number of results to return, max of 50, default is 25
          sort (string, optional) - You can sort the results using these values:
            date - sorts by date (default),
            checkin - sorted by highest checkin,
            highest_rated - sorts by global rating descending order,
            lowest_rated - sorts by global rating ascending order,
            highest_abv - highest ABV from the wishlist,
            lowest_abv - lowest ABV from the wishlist
    
         https://untappd.com/api/docs#userwishlist
        */
        userWishList(opts, callback) {
            if (!this.hasToken())
                this.validateParam(opts.username, 'username');
            return this.makeRequest(ApiMethod.GET, 'user/wishlist/' + (opts.username || ''), opts, callback);
        }
        /**
          USERNAME (string, optional) - The username that you wish to call the request upon. If you do not provide a username - the feed will return results from the authenticated user (if the access_token is provided)
          access_token or client_id and client_secret (string, required) - Either pass the access_token for authorized calls OR the client_id and client_secret for unauthorized calls
          offset (int, optional) - The numeric offset that you what results to start
          limit (int, optional) - The number of records that you will return (max 25, default 25)
    
         https://untappd.com/api/docs#userfriends
        */
        userFriends(opts, callback) {
            if (!this.hasToken())
                this.validateParam(opts.username, 'username');
            return this.makeRequest(ApiMethod.GET, 'user/friends/' + (opts.username || ''), opts, callback);
        }
        /**
          USERNAME (string, optional) - The username that you wish to call the request upon. If you do not provide a username - the feed will return results from the authenticated user (if the access_token is provided)
          access_token or client_id and client_secret (string, required) - Either pass the access_token for authorized calls OR the client_id and client_secret for unauthorized calls
          offset (int, optional) - The numeric offset that you what results to start
          limit (int, optional) - The number of badges to return in your result set
    
          https://untappd.com/api/docs#userbadges
        */
        userBadges(opts, callback) {
            if (!this.hasToken())
                this.validateParam(opts.username, 'username');
            return this.makeRequest(ApiMethod.GET, 'user/badges/' + (opts.username || ''), opts, callback);
        }
        /**
          USERNAME (string, optional) - The username that you wish to call the request upon. If you do not provide a username - the feed will return results from the authenticated user (if the access_token is provided)
          access_token or client_id and client_secret (string, required) - Either pass the access_token for authorized calls OR the client_id and client_secret for unauthorized calls
          offset (int, optional) - The numeric offset that you what results to start
          limit (int, optional) - The number of results to return, max of 50, default is 25
          sort (string, optional) - Your can sort the results using these values:
            date - sorts by date (default),
            checkin - sorted by highest checkin,
            highest_rated - sorts by global rating descending order,
            lowest_rated - sorts by global rating ascending order,
            highest_rated_you - the user's highest rated beer,
            lowest_rated_you - the user's lowest rated beer
    
          https://untappd.com/api/docs#userbeers
        */
        userDistinctBeers(opts, callback) {
            if (!this.hasToken())
                this.validateParam(opts.username, 'username');
            return this.makeRequest(ApiMethod.GET, 'user/beers/' + (opts.username || ''), opts, callback);
        }
        /**
          BREWERY_ID (int, required) - The Brewery ID that you want to display checkins
          access_token or client_id and client_secret (string, required) - Either pass the access_token for authorized calls OR the client_id and client_secret for unauthorized calls
          compact (string, optional) - You can pass 'true' here only show the brewery infomation, and remove the 'checkins', 'media', 'beer_list', etc attributes
    
          https://untappd.com/api/docs#breweryinfo
        */
        breweryInfo(breweryId, opts, callback) {
            return this.makeRequest(ApiMethod.GET, 'brewery/info/' + breweryId, opts, callback);
        }
        /**
          BID (int, required) - The Beer ID that you want to display checkins
          access_token or client_id and client_secret (string, required) - Either pass the access_token for authorized calls OR the client_id and client_secret for unauthorized calls
          compact (string, optional) - You can pass 'true' here only show the beer infomation, and remove the 'checkins', 'media', 'variants', etc attributes
    
          https://untappd.com/api/docs#beerinfo
        */
        beerInfo(beerId, opts, callback) {
            return this.makeRequest(ApiMethod.GET, 'beer/info/' + beerId, opts, callback);
        }
        /**
          VENUE_ID (int, required) - The Venue ID that you want to display checkins
          access_token or client_id and client_secret (string, required) - Either pass the access_token for authorized calls OR the client_id and client_secret for unauthorized calls
          compact (string, optional) - You can pass 'true' here only show the venue infomation, and remove the 'checkins', 'media', 'top_beers', etc attributes
    
          https://untappd.com/api/docs#venueinfo
        */
        venueInfo(venueId, opts, callback) {
            return this.makeRequest(ApiMethod.GET, 'venue/info/' + venueId, opts, callback);
        }
        /**
          access_token or client_id and client_secret (string, required) - Either pass the access_token for authorized calls OR the client_id and client_secret for unauthorized calls
          q (string, required) - The search term that you want to search.
          offset (int, optional) - The numeric offset that you what results to start
          limit (int, optional) - The number of results to return, max of 50, default is 25
          sort (string, optional) - Your can sort the results using these values: checkin - sorts by checkin count (default), name - sorted by alphabetic beer name
    
            https://untappd.com/api/docs#beersearch
        */
        beerSearch(q, opts, callback) {
            var params = Object.assign({}, { 'q': q }, opts);
            return this.makeRequest(ApiMethod.GET, 'search/beer', params, callback);
        }
        /**
          access_token or client_id and client_secret (string, required) - Either pass the access_token for authorized calls OR the client_id and client_secret for unauthorized calls
          q (string, required) - The search term that you want to search.
          offset (int, optional) - The numeric offset that you what results to start
          limit (int, optional) - The number of results to return, max of 50, default is 25
    
          https://untappd.com/api/docs#brewerysearch
         */
        brewerySearch(q, opts, callback) {
            var params = Object.assign({}, { 'q': q }, opts);
            return this.makeRequest(ApiMethod.GET, 'search/brewery', params, callback);
        }
        /**
          access_token (string, required) - The access token for the acting user
          VENUE_ID (string, required) - The foursquare venue v2 ID that you wish to translate into a Untappd venue ID.
    
            https://untappd.com/api/docs#foursquarelookup
        */
        foursquareVenueLookup(venueId, callback) {
            return this.makeRequest(ApiMethod.GET, 'venue/foursquare_lookup/' + venueId, null, callback);
        }
        /**
         *
          access_token (string, required) - The access token for the acting user
          gmt_offset (string, required) - The numeric value of hours the user is away from the GMT (Greenwich Mean Time), such as -5.
          timezone (string, required) - The timezone of the user, such as EST or PST./li>
          bid (int, required) - The numeric Beer ID you want to check into.
          foursquare_id (string, optional) - The MD5 hash ID of the Venue you want to attach the beer checkin. This HAS TO BE the MD5 non-numeric hash from the foursquare v2.
          geolat (int, optional) - The numeric Latitude of the user. This is required if you add a location.
          geolng (int, optional) - The numeric Longitude of the user. This is required if you add a location.
          shout (string, optional) - The text you would like to include as a comment of the checkin. Max of 140 characters.
          rating (int, optional) - The rating score you would like to add for the beer. This can only be 1 to 5 (half ratings are included). You can't rate a beer a 0.
          facebook (string, optional) - If you want to push this check-in to the users' Facebook account, pass this value as 'on', default is 'off'
          twitter (string, optional) - If you want to push this check-in to the users' Twitter account, pass this value as 'on', default is 'off'
          foursquare (string, optional) - If you want to push this check-in to the users' Foursquare account, pass this value as 'on', default is 'off'. You must include a location for this to enabled.
    
          https://untappd.com/api/docs#checkin
         */
        checkin(bid, timezone, gmt_offset, opts, callback) {
            this.validateToken();
            opts = Object.assign({
                'bid': bid,
                'timezone': timezone,
                'gmt_offset': gmt_offset
            }, opts);
            return this.makeRequest(ApiMethod.POST, 'checkin/add', opts, callback);
        }
        /**
         *
          This method will allow you to toast a checkin. Please note, if the user has already toasted this check-in, it will delete the toast.
    
          access_token (string, required) - The access token for the acting user
          CHECKIN_ID (int, required) - The checkin ID of checkin you want to toast
    
          https://untappd.com/api/docs#toast
         */
        toast(checkinId, callback) {
            this.validateToken();
            return this.makeRequest(ApiMethod.POST, 'checkin/toast/' + checkinId, null, callback);
        }
        /**
          access_token (string, required) - The access token for the acting user
          offset (int, optional) - The numeric offset that you what results to start
          limit (int, optional) - The number of results to return. (default is all)
    
          https://untappd.com/api/docs#pendingfriends
         */
        pendingFriends(opts, callback) {
            this.validateToken();
            opts = Object.assign({}, opts);
            return this.makeRequest(ApiMethod.GET, 'user/pending', opts, callback);
        }
        /**
         * This will allow you to request a person to be your friend.
    
          access_token (string, required) - The access token for the acting user
          TARGET_ID (int, required) - The target user id that you wish to accept.
    
            https://untappd.com/api/docs#addfriend
         */
        addFriend(targetId, callback) {
            this.validateToken();
            return this.makeRequest(ApiMethod.GET, 'friend/request/' + targetId, null, callback);
        }
        /**
         * This will allow you to remove a current friend
          access_token (string, required) - The access token for the acting user
          TARGET_ID (int, required) - The target user id that you wish to remove.
    
            https://untappd.com/api/docs#removefriend
         */
        removeFriend(targetId, callback) {
            this.validateToken();
            return this.makeRequest(ApiMethod.GET, 'friend/remove/' + targetId, null, callback);
        }
        /**
         * This will allow you to accept a pending friend request
          access_token (string, required) - The access token for the acting user
          TARGET_ID (int, required) - The target user id that you wish to accept.
    
            https://untappd.com/api/docs#acceptfriend
         */
        acceptFriend(targetId, callback) {
            this.validateToken();
            return this.makeRequest(ApiMethod.GET, 'friend/accept/' + targetId, null, callback);
        }
        /**
         *
          access_token (string, required) - The access token for the acting user
          TARGET_ID (int, required) - The target user id that you wish to reject.
    
            https://untappd.com/api/docs#rejectfriend
         */
        rejectFriend(targetId, callback) {
            this.validateToken();
            return this.makeRequest(ApiMethod.POST, 'friend/reject/' + targetId, null, callback);
        }
        /**
         * This method will allow you comment on a checkin.
          access_token (string, required) - The access token for the acting user
          CHECKIN_ID (int, required) - The checkin ID of the check-in you want ot add the comment.
          comment (string, required) - The text of the comment you want to add. Max of 140 characters.
    
            https://untappd.com/api/docs#addcomment
         */
        addComment(checkinId, comment, callback) {
            this.validateToken();
            const opts = Object.assign({
                'comment': comment
            });
            return this.makeRequest(ApiMethod.POST, 'checkin/addcomment/' + checkinId, opts, callback);
        }
        /**
         * This method will allow you to delete your comment on a checkin.
          access_token (string, required) - The access token for the acting user
          COMMENT_ID (int, required) - The comment ID of comment you want to delete
    
            https://untappd.com/api/docs#removecommment
         */
        removeComment(commentId, callback) {
            this.validateToken();
            return this.makeRequest(ApiMethod.POST, 'checkin/deletecomment/' + commentId, null, callback);
        }
        /**
         * This method will allow you to add a beer to your wish list.
          access_token (string, required) - The access token for the acting user
          bid (int, required) - The numeric BID of the beer you want to add your list.
    
            https://untappd.com/api/docs#addwish
         */
        addToWishList(beerId, callback) {
            this.validateToken();
            const opts = {
                bid: beerId
            };
            return this.makeRequest(ApiMethod.GET, 'user/wishlist/add', opts, callback);
        }
        /**
         * This method will allow you to remove a beer from your wish list.
          access_token (string, required) - The access token for the acting user
          bid (int, required) - The numeric BID of the beer you want to remove from your list.
    
          https://untappd.com/api/docs#removewish
         */
        removeFromWishList(beerId, callback) {
            this.validateToken();
            const opts = {
                bid: beerId
            };
            return this.makeRequest(ApiMethod.GET, 'user/wishlist/remove', opts, callback);
        }
    }
    UntappdAPI.UntappdClient = UntappdClient;
})(UntappdAPI || (UntappdAPI = {}));
module.exports = UntappdAPI;
