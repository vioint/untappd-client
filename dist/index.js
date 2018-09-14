"use strict";
// 'use strict'
// let qs = require('querystring');
// let request = require('request');
// let util = require('util');
// const apiVer = 'v4';
// const baseApiUrl = 'https://api.untappd.com';
// class UntappdClient {
// 	constructor(clientId, clientSecret, clientToken, debug = false) {
// 		this.debug = debug;
// 		this.token = clientToken;
// 		this.secret = clientSecret;
// 		this.id = clientId;
// 		this.req2 = function (reqMethod, path, params, data, callback) {
// 			var reqUrl = `${baseApiUrl}/${apiVer}/${path}`;
// 			var oauthInfo = this.token ?
// 				{ access_token: this.token } :
// 				{ client_id: this.id, client_secret: this.secret };
// 			var resHandler = function (err, res, body) {
// 				if (callback) {
// 					callback(err, body);
// 				}
// 				else {
// 					if (err) {
// 						if (debug) {
// 							console.error(err);
// 						}
// 						else {
// 							throw err;
// 						}
// 					}
// 					else if (debug) {
// 						console.log(util.inspect(arguments));
// 					}
// 				}
// 			};
// 			var reqOpts = {
// 				method: reqMethod,
// 				url: reqUrl,
// 				oauth: { transport_method: 'query' },
// 				qs: oauthInfo,
// 				json: true
// 			};
// 			if (reqMethod === 'GET') {
// 				reqOpts.qs = Object.assign(reqOpts.qs, params, data);
// 			}
// 			else if (reqMethod === 'POST') {
// 				reqOpts.form = data;
// 			}
// 			request(reqOpts, resHandler);
// 		};
// 		// this.post = function (path, params, data, callback) {
// 		// 	return this.req2("POST", path, params, data, callback);
// 		// };
// 		// this.get = function (path, params, callback) {
// 		// 	return this.req2("GET", path, params, null, callback);
// 		// };
// 		this.setClientId = function (clientId) {
// 			this.id = clientId;
// 			return this;
// 		};
// 		this.getClientId = function () {
// 			return this.id;
// 		};
// 		this.setClientSecret = function (clientSecret) {
// 			this.secret = clientSecret;
// 			return this;
// 		};
// 		this.getClientSecret = function () {
// 			return this.secret;
// 		};
// 		this.setAccessToken = function (accessToken) {
// 			this.token = accessToken;
// 			return this;
// 		};
// 		this.getAccessToken = function () {
// 			return this.token;
// 		};
// 		this.hasToken = function () {
// 			return !!this.token;
// 		};
// 		this.hasId = function () {
// 			return !!this.id;
// 		};
// 		this.hasSecret = function () {
// 			return !!this.secret;
// 		};
// 	}
// 	// OAUTH Stuff
// 	// We use the basic oauth redirect method from untappd.
// 	// this url can be used in the browser to get the access token
// 	getUserAuthenticationURL(returnRedirectionURL) {
// 		this.validateRequest(returnRedirectionURL, "returnRedirectionURL");
// 		if (!this.hasId())
// 			throw new Error("UntappdClient.getUserAuthenticationURL requires a ClientId");
// 		return "https://untappd.com/oauth/authenticate/?client_id=" + this.id + "&response_type=token&redirect_url=" + returnRedirectionURL;
// 	}
// 	//this is for server-side, Step 1 - OAUTH Authentication
// 	getAuthenticationURL(returnRedirectionURL) {
// 		this.validateRequest(returnRedirectionURL, "returnRedirectionURL");
// 		if (!this.hasId())
// 			throw new Error("UntappdClient.getUserAuthenticationURL requires a ClientId");
// 		return "https://untappd.com/oauth/authenticate/?client_id=" + this.id + "&response_type=code&redirect_url=" + returnRedirectionURL + "&code=COD";
// 	}
// 	// Step 2 - OATUH Authorization
// 	getAuthorizationURL(returnRedirectionURL, code) {
// 		this.validateRequest(returnRedirectionURL, "returnRedirectionURL");
// 		if (!this.hasId() || !this.hasSecret())
// 			throw new Error("UntappdClient.getUserAuthenticationURL requires a ClientId/ClientSecret pair.");
// 		return "https://untappd.com/oauth/authorize/?client_id=" + this.id + "&client_secret=" + this.secret + "&response_type=code&redirect_url=" + returnRedirectionURL + "&code=" + code;
// 	}
// 	// The FEEDS
// 	// https://untappd.com/api/docs#activityfeed
// 	activityFeed(callback, data) {
// 		data = data || {};
// 		this.validateRequest(callback, "callback");
// 		this.authorized(true);
// 		return this.get("checkin/recent", data, callback);
// 	}
// 	// https://untappd.com/api/docs#useractivityfeed
// 	userActivityFeed(callback, data) {
// 		data = data || {};
// 		this.validateRequest(callback, "callback");
// 		// username or token
// 		if (!hasToken())
// 			validate(data.USERNAME, "USERNAME");
// 		this.authorized();
// 		return this.get("user/checkins/" + (data.USERNAME || ''), data, callback);
// 	}
// 	// https://untappd.com/api/docs#theppublocal
// 	pubFeed(callback, data) {
// 		data = data || {};
// 		this.validateRequest(callback, "callback");
// 		this.authorized();
// 		return this.get("thepub/local", data, callback);
// 	}
// 	// https://untappd.com/api/docs#venueactivityfeed
// 	venueActivityFeed(callback, data) {
// 		data = data || {};
// 		this.validateRequest(callback, "callback");
// 		this.validateRequest(data.VENUE_ID, "VENUE_ID");
// 		this.authorized();
// 		return this.get("venue/checkins/" + data.VENUE_ID, data, callback);
// 	}
// 	// https://untappd.com/api/docs#beeractivityfeed
// 	beerActivityFeed(callback, data) {
// 		data = data || {};
// 		this.validateRequest(callback, "callback");
// 		this.validateRequest(data.BID, "BID");
// 		this.authorized();
// 		return this.get("beer/checkins/" + data.BID, data, callback);
// 	}
// 	// https://untappd.com/api/docs#breweryactivityfeed
// 	breweryActivityFeed(callback, data) {
// 		data = data || {};
// 		this.validateRequest(callback, "callback");
// 		this.validateRequest(data.BREWERY_ID, "BREWERY_ID");
// 		this.authorized();
// 		return this.get("brewery/checkins/" + data.BREWERY_ID, data, callback);
// 	}
// 	// https://untappd.com/api/docs#notifications
// 	notifications(callback) {
// 		data = data || {};
// 		this.validateRequest(callback, "callback");
// 		this.authorized(true);
// 		return this.get("notifications", null, callback);
// 	}
// 	// The INFO / SEARCH
// 	// https://untappd.com/api/docs#userinfo
// 	userInfo(callback, data) {
// 		data = data || {};
// 		if (!hasToken())
// 			validate(data.USERNAME, "USERNAME");
// 		this.validateRequest(callback, "callback");
// 		this.authorized();
// 		return this.get("user/info/" + (data.USERNAME || ''), data, callback);
// 	}
// 	// https://untappd.com/api/docs#userwishlist
// 	userWishList(callback, data) {
// 		data = data || {};
// 		if (!hasToken())
// 			validate(data.USERNAME, "USERNAME");
// 		this.validateRequest(callback, "callback");
// 		this.authorized();
// 		return this.get("user/wishlist/" + (data.USERNAME || ''), data, callback);
// 	}
// 	// https://untappd.com/api/docs#userfriends
// 	userFriends(callback, data) {
// 		data = data || {};
// 		if (!hasToken())
// 			validate(data.USERNAME, "USERNAME");
// 		this.validateRequest(callback, "callback");
// 		this.authorized();
// 		return this.get("user/friends/" + (data.USERNAME || ''), data, callback);
// 	}
// 	// https://untappd.com/api/docs#userbadges
// 	userBadges(callback, data) {
// 		data = data || {};
// 		if (!hasToken())
// 			validate(data.USERNAME, "USERNAME");
// 		this.validateRequest(callback, "callback");
// 		this.authorized();
// 		return this.get("user/badges/" + (data.USERNAME || ''), data, callback);
// 	}
// 	// https://untappd.com/api/docs#userbeers
// 	userDistinctBeers(callback, data) {
// 		data = data || {};
// 		if (!hasToken())
// 			validate(data.USERNAME, "USERNAME");
// 		this.validateRequest(callback, "callback");
// 		this.authorized();
// 		return this.get("user/beers/" + (data.USERNAME || ''), data, callback);
// 	}
// 	// https://untappd.com/api/docs#breweryinfo
// 	breweryInfo(callback, data) {
// 		data = data || {};
// 		this.validateRequest(data.BREWERY_ID, "BREWERY_ID");
// 		this.validateRequest(callback, "callback");
// 		this.authorized();
// 		return this.get("brewery/info/" + data.BREWERY_ID, data, callback);
// 	}
// 	// https://untappd.com/api/docs#beerinfo
// 	beerInfo(callback, data) {
// 		data = data || {};
// 		this.validateRequest(data.BID, "BID");
// 		this.validateRequest(callback, "callback");
// 		this.authorized();
// 		return this.get("beer/info/" + data.BID, data, callback);
// 	}
// 	// https://untappd.com/api/docs#beersearch
// 	beerSearch(callback, data) {
// 		data = data || {};
// 		this.validateRequest(data.q, "q");
// 		this.validateRequest(callback, "callback");
// 		this.authorized();
// 		return this.get("search/beer", data, callback);
// 	}
// 	// https://untappd.com/api/docs#brewerysearch
// 	brewerySearch(callback, data) {
// 		data = data || {};
// 		this.validateRequest(data.q, "searchTerms");
// 		this.validateRequest(callback, "callback");
// 		this.authorized();
// 		return this.get("search/brewery", data, callback);
// 	}
// 	// CHECKIN calls
// 	// https://untappd.com/api/docs#checkin
// 	checkin(callback, data) {
// 		data = data || {};
// 		this.validateRequest(data.gmt_offset, "gmt_offset");
// 		this.validateRequest(data.timezone, "timezone");
// 		this.validateRequest(data.bid, "bid");
// 		this.validateRequest(callback, "callback");
// 		this.authorized(true);
// 		return this.post("/v4/checkin/add", {}, data, callback);
// 	}
// 	// https://untappd.com/api/docs#toast
// 	// If already toasted, this will untoast, otherwise it toasts.
// 	toast(callback, data) {
// 		data = data || {};
// 		this.validateRequest(data.CHECKIN_ID, "CHECKIN_ID");
// 		this.validateRequest(callback, "callback");
// 		this.authorized(true);
// 		return this.get("checkin/toast" + data.CHECKIN_ID, data, callback);
// 	}
// 	// https://untappd.com/api/docs#pendingfriends
// 	pendingFriends(callback) {
// 		data = data || {};
// 		this.validateRequest(callback, "callback");
// 		this.authorized(true);
// 		return this.get("user/pending", data, callback);
// 	}
// 	// https://untappd.com/api/docs#addfriend
// 	requestFriends(callback, data) {
// 		data = data || {};
// 		this.validateRequest(data.TARGET_ID, "TARGET_ID");
// 		this.validateRequest(callback, "callback");
// 		this.authorized(true);
// 		return this.get("friend/request/" + data.TARGET_ID, data, callback);
// 	}
// 	// https://untappd.com/api/docs#removefriend
// 	removeFriends(callback, data) {
// 		data = data || {};
// 		this.validateRequest(data.TARGET_ID, "TARGET_ID");
// 		this.validateRequest(callback, "callback");
// 		this.authorized(true);
// 		return this.get("friend/remove/" + data.TARGET_ID, data, callback);
// 	}
// 	// https://untappd.com/api/docs#acceptfriend
// 	acceptFriends(callback, data) {
// 		data = data || {};
// 		this.validateRequest(data.TARGET_ID, "TARGET_ID");
// 		this.validateRequest(callback, "callback");
// 		this.authorized(true);
// 		return this.post("/v4/friend/accept/" + data.TARGET_ID, {}, data, callback);
// 	}
// 	// https://untappd.com/api/docs#rejectfriend
// 	rejectFriends(callback, data) {
// 		data = data || {};
// 		this.validateRequest(data.TARGET_ID, "TARGET_ID");
// 		this.validateRequest(callback, "callback");
// 		this.authorized(true);
// 		return this.post("/v4/friend/reject/" + data.TARGET_ID, {}, data, callback);
// 	}
// 	// https://untappd.com/api/docs#addcomment
// 	addComment(callback, data) {
// 		data = data || {};
// 		this.validateRequest(data.CHECKIN_ID, "CHECKIN_ID");
// 		this.validateRequest(data.shout, "shout");
// 		this.validateRequest(callback, "callback");
// 		this.authorized(true);
// 		return this.post("/v4/checkin/addcomment/" + data.CHECKIN_ID, {}, data, callback);
// 	}
// 	// https://untappd.com/api/docs#removecommment
// 	removeComment(callback, data) {
// 		data = data || {};
// 		this.validateRequest(data.COMMENT_ID, "COMMENT_ID");
// 		this.validateRequest(callback, "callback");
// 		this.authorized(true);
// 		return this.post("/v4/checkin/deletecomment/" + data.COMMENT_ID, {}, data, callback);
// 	}
// 	// https://untappd.com/api/docs#addwish
// 	addToWishList(callback, data) {
// 		data = data || {};
// 		this.validateRequest(data.bid, "bid");
// 		this.validateRequest(callback, "callback");
// 		this.authorized(true);
// 		return this.get("user/wishlist/add", data, callback);
// 	}
// 	// https://untappd.com/api/docs#removewish
// 	removeFromWishList(callback, data) {
// 		data = data || {};
// 		this.validateRequest(data.bid, "bid");
// 		this.validateRequest(callback, "callback");
// 		this.authorized(true);
// 		return this.get("user/wishlist/remove", data, callback);
// 	}
// 	// https://untappd.com/api/docs#foursquarelookup
// 	foursquareVenueLookup(callback, data) {
// 		data = data || {};
// 		this.validateRequest(data.VENUE_ID, "VENUE_ID");
// 		this.validateRequest(callback, "callback");
// 		this.authorized();
// 		return this.get("venue/foursquare_lookup/" + data.VENUE_ID, data, callback);
// 	}
// 	// https://untappd.com/api/docs#venueinfo
// 	venueInfo(callback, data) {
// 		data = data || {};
// 		this.validateRequest(data.VENUE_ID, "VENUE_ID");
// 		this.validateRequest(callback, "callback");
// 		this.authorized();
// 		return this.get("venue/info/" + data.VENUE_ID, data, callback);
// 	}
// 	validateRequest(param, key) {
// 		var message = key + " cannot be undefined or null.";
// 		return (param) ? null : new Error(message);
// 	}
// 	authorized(tokenOnly) {
// 		if (this.debug) {
// 			console.log(this.getClientId(), this.getClientSecret(), this.getAccessToken());
// 		}
// 		tokenOnly = (tokenOnly === undefined) ? false : tokenOnly;
// 		var caller = arguments.callee.caller.name;
// 		if (tokenOnly && !this.hasToken())
// 			throw new Error("UntappdClient." + caller + " requires an AccessToken.");
// 		if (!this.hasToken() && !(this.hasId() && this.hasSecret()))
// 			throw new Error("UntappdClient." + caller + " requires an AccessToken or a ClientId/ClientSecret pair.");
// 	}
// }
// module.exports = UntappdClient;
