declare enum ApiMethod {
    GET = 0,
    POST = 1
}
declare module UntappdAPI {
    class UntappdClient {
        clientId: String;
        clientSecret: String;
        token: String;
        debug: Boolean;
        /**
         * @param opts {
         * 	@param clientId The API client ID
         * 	@param clientSecret The API client secret
         * 	@param clientToken An API user token
         * 	@param debug Either true or false to enable debug messages
         * }
         */
        constructor(opts: any);
        makeRequest: (reqMethod: ApiMethod, path: String, params: any, callback: Function) => Promise<any>;
        setClientId(newClientId: String): this;
        getClientId(): String;
        setClientSecret(newClientSecret: String): this;
        getClientSecret(): String;
        setAccessToken(newAccessToken: String): this;
        getAccessToken(): String;
        hasToken(): boolean;
        hasId(): boolean;
        hasSecret(): boolean;
        validateParam(param: any, key: string): void;
        validateToken(): void;
        /**
         * Generates a url that will return an access token via client-side authentication
         * @param {string} redirectUrl the callback url that will get the access token
         */
        getAuthenticationTokenUrl(redirectUrl: string): string;
        /**
         * Generates a url for server-side OAuth first phase - getting the OAuth 2.0 code
         * @param {string} redirectUrl the callback url that will get the code
         * @param {string} state Optional: A state object (to be returned to the server for CSRF protection)
         */
        getAuthenticationCodeUrl(redirectUrl: string, state: string): string;
        /**
         * Generates a url for server-side OAuth second phase - the url for acquiring the OAuth 2.0 access token
         * @param {string} redirectUrl the callback url that will get the access token
         * @param {string} code the code received in the initial authentication step
         */
        getAuthorizationUrl(redirectUrl: string, code: string): string;
        /**
         * Returns the access token for the code obtained in the initial server-side based OAuth authentication
         * @param {string} redirectUrl the original callback url that was used to obtain the code
         * @param {string} code the code received in the initial authentication step
         * @param {Function} callback a callback to recieve the access token or error
         */
        acquireAccessToken(redirectUrl: string, code: string, callback: Function): Promise<any>;
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
        activityFeed(opts: any, callback: Function): Promise<any>;
        /**
          USERNAME (string, optional) - The username that you wish to call the request upon. If you do not provide a username - the feed will return results from the authenticated user (if the access_token is provided).
          max_id (int, optional) - The checkin ID that you want the results to start with.
          min_id (int, optional) - Returns only checkins that are newer than this value.
          limit (int, optional) - The number of results to return, max of 25, default is 25

          https://untappd.com/api/docs#useractivityfeed
        */
        userActivityFeed(opts: {
            username: any;
        }, callback: Function): Promise<any>;
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
        pubFeed(latitude: Number, longitude: Number, opts: any, callback: Function): Promise<any>;
        /**
          VENUE_ID (int, required) - The Venue ID that you want to display checkins
          max_id (int, optional) - The checkin ID that you want the results to start with
          min_id (int, optional) - Returns only checkins that are newer than this value
          limit (int, optional) - The number of results to return, max of 25, default is 25

          https://untappd.com/api/docs#venueactivityfeed
        */
        venueActivityFeed(venueId: string, opts: any, callback: Function): Promise<any>;
        /**
          BID (int, required) - The beer ID that you want to display checkins
          access_token or client_id and client_secret (string, required) - Either pass the access_token for authorized calls OR the client_id and client_secret for unauthorized calls
          max_id (int, optional) - The checkin ID that you want the results to start with
          min_id (int, optional) - Returns only checkins that are newer than this value
          limit (int, optional) - The number of results to return, max of 25, default is 25

          https://untappd.com/api/docs#beeractivityfeed
        */
        beerActivityFeed(beerId: string, opts: any, callback: Function): Promise<any>;
        /**
          BREWERY_ID (int, required) - The Brewery ID that you want to display checkins
          max_id (int, optional) - The checkin ID that you want the results to start with
          min_id (int, optional) - Returns only checkins that are newer than this value
          limit (int, optional) - The number of results to return, max of 25, default is 25

          https://untappd.com/api/docs#breweryactivityfeed
        */
        breweryActivityFeed(breweryId: string, opts: any, callback: Function): Promise<any>;
        /**
          offset (int, optional) - The numeric offset that you what results to start
          limit (int, optional) - The number of records that you will return (max 25, default 25)

          https://untappd.com/api/docs#notifications
        */
        notifications(opts: any, callback: Function): Promise<any>;
        /*** Info / Search **/
        /**
          USERNAME (string, optional) - The username that you wish to call the request upon. If you do not provide a username - the feed will return results from the authenticated user (if the access_token is provided)
          compact (string, optional) - You can pass 'true' here only show the user infomation, and remove the 'checkins', 'media', 'recent_brews', etc attributes

          Note: If you use a user's access token, the 'settings' attribute for the user will be
          included in the response, otherwise you will get an empty settings block.

          https://untappd.com/api/docs#userinfo
        */
        userInfo(opts: {
            username: any;
        }, callback: Function): Promise<any>;
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
        userWishList(opts: {
            username: any;
        }, callback: Function): Promise<any>;
        /**
          USERNAME (string, optional) - The username that you wish to call the request upon. If you do not provide a username - the feed will return results from the authenticated user (if the access_token is provided)
          access_token or client_id and client_secret (string, required) - Either pass the access_token for authorized calls OR the client_id and client_secret for unauthorized calls
          offset (int, optional) - The numeric offset that you what results to start
          limit (int, optional) - The number of records that you will return (max 25, default 25)

         https://untappd.com/api/docs#userfriends
        */
        userFriends(opts: {
            username: any;
        }, callback: Function): Promise<any>;
        /**
          USERNAME (string, optional) - The username that you wish to call the request upon. If you do not provide a username - the feed will return results from the authenticated user (if the access_token is provided)
          access_token or client_id and client_secret (string, required) - Either pass the access_token for authorized calls OR the client_id and client_secret for unauthorized calls
          offset (int, optional) - The numeric offset that you what results to start
          limit (int, optional) - The number of badges to return in your result set

          https://untappd.com/api/docs#userbadges
        */
        userBadges(opts: {
            username: any;
        }, callback: Function): Promise<any>;
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
        userDistinctBeers(opts: {
            username: any;
        }, callback: Function): Promise<any>;
        /**
          BREWERY_ID (int, required) - The Brewery ID that you want to display checkins
          access_token or client_id and client_secret (string, required) - Either pass the access_token for authorized calls OR the client_id and client_secret for unauthorized calls
          compact (string, optional) - You can pass 'true' here only show the brewery infomation, and remove the 'checkins', 'media', 'beer_list', etc attributes

          https://untappd.com/api/docs#breweryinfo
        */
        breweryInfo(breweryId: string, opts: any, callback: Function): Promise<any>;
        /**
          BID (int, required) - The Beer ID that you want to display checkins
          access_token or client_id and client_secret (string, required) - Either pass the access_token for authorized calls OR the client_id and client_secret for unauthorized calls
          compact (string, optional) - You can pass 'true' here only show the beer infomation, and remove the 'checkins', 'media', 'variants', etc attributes

          https://untappd.com/api/docs#beerinfo
        */
        beerInfo(beerId: string, opts: any, callback: Function): Promise<any>;
        /**
          VENUE_ID (int, required) - The Venue ID that you want to display checkins
          access_token or client_id and client_secret (string, required) - Either pass the access_token for authorized calls OR the client_id and client_secret for unauthorized calls
          compact (string, optional) - You can pass 'true' here only show the venue infomation, and remove the 'checkins', 'media', 'top_beers', etc attributes

          https://untappd.com/api/docs#venueinfo
        */
        venueInfo(venueId: string, opts: any, callback: Function): Promise<any>;
        /**
          access_token or client_id and client_secret (string, required) - Either pass the access_token for authorized calls OR the client_id and client_secret for unauthorized calls
          q (string, required) - The search term that you want to search.
          offset (int, optional) - The numeric offset that you what results to start
          limit (int, optional) - The number of results to return, max of 50, default is 25
          sort (string, optional) - Your can sort the results using these values: checkin - sorts by checkin count (default), name - sorted by alphabetic beer name

            https://untappd.com/api/docs#beersearch
        */
        beerSearch(q: string, opts: any, callback: Function): Promise<any>;
        /**
          access_token or client_id and client_secret (string, required) - Either pass the access_token for authorized calls OR the client_id and client_secret for unauthorized calls
          q (string, required) - The search term that you want to search.
          offset (int, optional) - The numeric offset that you what results to start
          limit (int, optional) - The number of results to return, max of 50, default is 25

          https://untappd.com/api/docs#brewerysearch
         */
        brewerySearch(q: string, opts: any, callback: Function): Promise<any>;
        /**
          access_token (string, required) - The access token for the acting user
          VENUE_ID (string, required) - The foursquare venue v2 ID that you wish to translate into a Untappd venue ID.

            https://untappd.com/api/docs#foursquarelookup
        */
        foursquareVenueLookup(venueId: string, callback: Function): Promise<any>;
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
        checkin(bid: string, timezone: string, gmt_offset: string, opts: any, callback: Function): Promise<any>;
        /**
         *
          This method will allow you to toast a checkin. Please note, if the user has already toasted this check-in, it will delete the toast.

          access_token (string, required) - The access token for the acting user
          CHECKIN_ID (int, required) - The checkin ID of checkin you want to toast

          https://untappd.com/api/docs#toast
         */
        toast(checkinId: string, callback: Function): Promise<any>;
        /**
          access_token (string, required) - The access token for the acting user
          offset (int, optional) - The numeric offset that you what results to start
          limit (int, optional) - The number of results to return. (default is all)

          https://untappd.com/api/docs#pendingfriends
         */
        pendingFriends(opts: any, callback: Function): Promise<any>;
        /**
         * This will allow you to request a person to be your friend.

          access_token (string, required) - The access token for the acting user
          TARGET_ID (int, required) - The target user id that you wish to accept.

            https://untappd.com/api/docs#addfriend
         */
        addFriend(targetId: string, callback: Function): Promise<any>;
        /**
         * This will allow you to remove a current friend
          access_token (string, required) - The access token for the acting user
          TARGET_ID (int, required) - The target user id that you wish to remove.

            https://untappd.com/api/docs#removefriend
         */
        removeFriend(targetId: string, callback: Function): Promise<any>;
        /**
         * This will allow you to accept a pending friend request
          access_token (string, required) - The access token for the acting user
          TARGET_ID (int, required) - The target user id that you wish to accept.

            https://untappd.com/api/docs#acceptfriend
         */
        acceptFriend(targetId: string, callback: Function): Promise<any>;
        /**
         *
          access_token (string, required) - The access token for the acting user
          TARGET_ID (int, required) - The target user id that you wish to reject.

            https://untappd.com/api/docs#rejectfriend
         */
        rejectFriend(targetId: string, callback: Function): Promise<any>;
        /**
         * This method will allow you comment on a checkin.
          access_token (string, required) - The access token for the acting user
          CHECKIN_ID (int, required) - The checkin ID of the check-in you want ot add the comment.
          comment (string, required) - The text of the comment you want to add. Max of 140 characters.

            https://untappd.com/api/docs#addcomment
         */
        addComment(checkinId: string, comment: string, callback: Function): Promise<any>;
        /**
         * This method will allow you to delete your comment on a checkin.
          access_token (string, required) - The access token for the acting user
          COMMENT_ID (int, required) - The comment ID of comment you want to delete

            https://untappd.com/api/docs#removecommment
         */
        removeComment(commentId: string, callback: Function): Promise<any>;
        /**
         * This method will allow you to add a beer to your wish list.
          access_token (string, required) - The access token for the acting user
          bid (int, required) - The numeric BID of the beer you want to add your list.

            https://untappd.com/api/docs#addwish
         */
        addToWishList(beerId: string, callback: Function): Promise<any>;
        /**
         * This method will allow you to remove a beer from your wish list.
          access_token (string, required) - The access token for the acting user
          bid (int, required) - The numeric BID of the beer you want to remove from your list.

          https://untappd.com/api/docs#removewish
         */
        removeFromWishList(beerId: string, callback: Function): Promise<any>;
    }
}
export = UntappdAPI;
