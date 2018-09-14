'use strict';
require('dotenv').config();
const chai = require('chai');
/*jshint -W079 */
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const nock = require('nock');
const qs = require('querystring');
const url = require('url');
let UntappdClient = require('../lib/client');

const baseAuthUrl = 'https://untappd.com/oauth';
const mockLocalServerUrl = 'http://localhost/callback';
const mockAccessCode = 'mOCKaCCESScODE';
const mockAccessToken = 'mOCKaCCESStOKEN';

before((done) => {
  nock(baseAuthUrl + '/authenticate')
    .filteringPath(/.+client_id=+\w+&response_type=code&.+/)
    .get()
    .times(2)
    .reply(function (uri, requestBody) {
      return [
        301,
        null,
        {
          location: qs.parse(this.req.path).redirect_url + `?code=${mockAccessCode}`
        }
      ];
    });

  nock(baseAuthUrl + '/authorize')
    .filteringPath(/.+client_secret=+\w+&response_type=code&.+/)
    .get()
    .reply(200, {
      meta: {
        http_code: 200
      },
      response: {
        access_token: mockAccessToken
      }
    });

  done();
});


after(function (done) {
  nock.cleanAll();
  done();
});


describe('constructer tests', () => {
  it('will create an instance of the client', () => {
    var client = new UntappdClient({
      clientId: 'dummyClientId',
      clientSecret: 'dummyClientSecret'
    });
    expect(client).to.exist.and.to.be.instanceOf(UntappdClient);
  });

});

describe('oauth tests', () => {
  it('will get an authorization code', () => {
    var client = new UntappdClient({
      clientId: process.env.UNTAPPD_CLIENT_ID,
      clientSecret: process.env.UNTAPPD_CLIENT_SECRET
    });

    const authUrl = client.getAuthenticationCodeUrl(mockLocalServerUrl);
    chai.request(authUrl)
      .get('')
      .redirects(0)
      .end((err, res) => {
        expect(res).to.have.header('location');
        expect(res.header.location).to.include(mockLocalServerUrl);
        const redirParams = qs.parse(url.parse(res.header.location).query);
        expect(redirParams).to.have.property('code')
          .that.equals(mockAccessCode);
      });

  });

  it('will acquire an access token', () => {
    var client = new UntappdClient({
      clientId: process.env.UNTAPPD_CLIENT_ID,
      clientSecret: process.env.UNTAPPD_CLIENT_SECRET
    });

    const authUrl = client.getAuthenticationCodeUrl(mockLocalServerUrl);
    chai.request(authUrl)
      .get('')
      .redirects(0)
      .end((err, res) => {
        const redirParams = qs.parse(url.parse(res.header.location).query);
        client.acquireAccessToken(mockLocalServerUrl, redirParams.code, (err, accessToken) => {
          expect(err).to.be.null;
          expect(accessToken).to.equal(mockAccessToken);
        });

      });

  });

});

describe('info tests', () => {

  it('will return the user info', (done) => {
    var client = new UntappdClient({
      clientId: process.env.UNTAPPD_CLIENT_ID,
      clientSecret: process.env.UNTAPPD_CLIENT_SECRET
    });
    client.userInfo({
      username: 'gregavola'
    }, (err, data) => {
      expect(err).to.be.null;
      expect(data.meta.code).to.equal(200);
      expect(data).to.be.an('object').that.has.property('response');
      done();
    });
  });

  it('will return the user wish list', (done) => {
    var client = new UntappdClient({
      clientId: process.env.UNTAPPD_CLIENT_ID,
      clientSecret: process.env.UNTAPPD_CLIENT_SECRET
    });
    client.userWishList({
      username: 'gregavola'
    }, (err, data) => {
      expect(err).to.be.null;
      expect(data.meta.code).to.equal(200);
      expect(data).to.be.an('object').that.has.property('response');
      done();
    });
  });

  it('will return the user friends list', (done) => {
    var client = new UntappdClient({
      clientId: process.env.UNTAPPD_CLIENT_ID,
      clientSecret: process.env.UNTAPPD_CLIENT_SECRET
    });
    client.userFriends({
      username: 'gregavola'
    }, (err, data) => {
      expect(err).to.be.null;
      expect(data.meta.code).to.equal(200);
      expect(data).to.be.an('object').that.has.property('response');
      done();
    });
  });

  it('will return the user badges list', (done) => {
    var client = new UntappdClient({
      clientId: process.env.UNTAPPD_CLIENT_ID,
      clientSecret: process.env.UNTAPPD_CLIENT_SECRET
    });
    client.userBadges({
      username: 'gregavola'
    }, (err, data) => {
      expect(err).to.be.null;
      expect(data.meta.code).to.equal(200);
      expect(data).to.be.an('object').that.has.property('response');
      done();
    });
  });

  it('will return the user distinct beers list', (done) => {
    var client = new UntappdClient({
      clientId: process.env.UNTAPPD_CLIENT_ID,
      clientSecret: process.env.UNTAPPD_CLIENT_SECRET
    });
    client.userDistinctBeers({
      username: 'gregavola'
    }, (err, data) => {
      expect(err).to.be.null;
      expect(data.meta.code).to.equal(200);
      expect(data).to.be.an('object').that.has.property('response');
      done();
    });
  });

  it('will return the brewery information', (done) => {
    var client = new UntappdClient({
      clientId: process.env.UNTAPPD_CLIENT_ID,
      clientSecret: process.env.UNTAPPD_CLIENT_SECRET
    });
    client.breweryInfo(459, null, (err, data) => {
      expect(err).to.be.null;
      expect(data.meta.code).to.equal(200);
      expect(data).to.be.an('object').that.has.property('response');
      done();
    });
  });

  it('will return the beer information', (done) => {
    var client = new UntappdClient({
      clientId: process.env.UNTAPPD_CLIENT_ID,
      clientSecret: process.env.UNTAPPD_CLIENT_SECRET
    });
    client.beerInfo(3839, null, (err, data) => {
      expect(err).to.be.null;
      expect(data.meta.code).to.equal(200);
      expect(data).to.be.an('object').that.has.property('response');
      done();
    });
  });

  it('will return the venue information', (done) => {
    var client = new UntappdClient({
      clientId: process.env.UNTAPPD_CLIENT_ID,
      clientSecret: process.env.UNTAPPD_CLIENT_SECRET
    });
    client.venueInfo(284867, null, (err, data) => {
      expect(err).to.be.null;
      expect(data.meta.code).to.equal(200);
      expect(data).to.be.an('object').that.has.property('response');
      done();
    });
  });

  it('will return the beer search results', (done) => {
    var client = new UntappdClient({
      clientId: process.env.UNTAPPD_CLIENT_ID,
      clientSecret: process.env.UNTAPPD_CLIENT_SECRET
    });
    client.beerSearch('Pliny', null, (err, data) => {
      expect(err).to.be.null;
      expect(data.meta.code).to.equal(200);
      expect(data).to.be.an('object').that.has.property('response');
      done();
    });
  });

  it('will return the beer search results', (done) => {
    var client = new UntappdClient({
      clientId: process.env.UNTAPPD_CLIENT_ID,
      clientSecret: process.env.UNTAPPD_CLIENT_SECRET
    });
    client.brewerySearch('Brewdog', null, (err, data) => {
      expect(err).to.be.null;
      expect(data.meta.code).to.equal(200);
      expect(data).to.be.an('object').that.has.property('response');
      done();
    });
  });

  it('will return an Untappd venue object', (done) => {
    var client = new UntappdClient({
      clientId: process.env.UNTAPPD_CLIENT_ID,
      clientSecret: process.env.UNTAPPD_CLIENT_SECRET
    });
    client.foursquareVenueLookup('4ccf5fec1ac7a1cd6a5c1392', (err, data) => {
      expect(err).to.be.null;
      expect(data.meta.code).to.equal(200);
      expect(data).to.be.an('object').that.has.property('response').that.has.property('venue');
      done();
    });
  });

});

describe('feed tests', () => {
  it('will return the user activity feed', (done) => {
    var client = new UntappdClient({
      clientId: process.env.UNTAPPD_CLIENT_ID,
      clientSecret: process.env.UNTAPPD_CLIENT_SECRET
    });
    client.userActivityFeed({
      username: 'gregavola'
    }, (err, data) => {
      expect(err).to.be.null;
      expect(data.meta.code).to.equal(200);
      expect(data).to.be.an('object').that.has.property('response');
      done();
    });
  });

  it('will return the global feed', (done) => {
    var client = new UntappdClient({
      clientId: process.env.UNTAPPD_CLIENT_ID,
      clientSecret: process.env.UNTAPPD_CLIENT_SECRET
    });
    client.pubFeed(35.6754208, 139.7451528, null, (err, data) => {
      expect(err).to.be.null;
      expect(data.meta.code).to.equal(200);
      expect(data).to.be.an('object').that.has.property('response');
      done();
    });
  });

  it('will return a venue feed', (done) => {
    var client = new UntappdClient({
      clientId: process.env.UNTAPPD_CLIENT_ID,
      clientSecret: process.env.UNTAPPD_CLIENT_SECRET
    });
    client.venueActivityFeed(284867, null, (err, data) => {
      expect(err).to.be.null;
      expect(data.meta.code).to.equal(200);
      expect(data).to.be.an('object').that.has.property('response');
      done();
    });
  });

  it('will return a beer activity feed', (done) => {
    var client = new UntappdClient({
      clientId: process.env.UNTAPPD_CLIENT_ID,
      clientSecret: process.env.UNTAPPD_CLIENT_SECRET
    });
    client.beerActivityFeed(3839, null, (err, data) => {
      expect(err).to.be.null;
      expect(data.meta.code).to.equal(200);
      expect(data).to.be.an('object').that.has.property('response');
      done();
    });
  });

  it('will return a brewery activity feed', (done) => {
    var client = new UntappdClient({
      clientId: process.env.UNTAPPD_CLIENT_ID,
      clientSecret: process.env.UNTAPPD_CLIENT_SECRET
    });
    client.breweryActivityFeed(459, null, (err, data) => {
      expect(err).to.be.null;
      expect(data.meta.code).to.equal(200);
      expect(data).to.be.an('object').that.has.property('response');
      done();
    });
  });

});


if (process.env.UNTAPPD_TEST_USER_ACCESS_TOKEN1) {
  describe('tokenized access/actions tests', () => {

    const sampleBeerId = 1046090;
    let lastCheckinId;
    let lastCommentId;
    let firstUserId, secondUserId;

    it('will return the user activity feed', (done) => {
      var client = new UntappdClient({
        clientToken: process.env.UNTAPPD_TEST_USER_ACCESS_TOKEN1
      });
      client.activityFeed(null, (err, data) => {
        expect(err).to.be.null;
        expect(data.meta.code).to.equal(200);
        expect(data).to.have.property('response').and.have.a.property('checkins').that.is.an('object');
        done();
      });

    });

    it('will return the user info', (done) => {
      var client = new UntappdClient({
        clientToken: process.env.UNTAPPD_TEST_USER_ACCESS_TOKEN1
      });
      client.userInfo({}, (err, data) => {
        expect(err).to.be.null;
        expect(data.meta.code).to.equal(200);
        expect(data).to.have.property('response').and.have.a.property('user').that.is.an('object');
        firstUserId = data.response.user.id;

        // get the other user
        client.setAccessToken(process.env.UNTAPPD_TEST_USER_ACCESS_TOKEN2);
        client.userInfo({}, (err, data) => {
          expect(err).to.be.null;
          expect(data.meta.code).to.equal(200);
          expect(data).to.have.property('response').and.have.a.property('user').that.is.an('object');
          secondUserId = data.response.user.id;
          done();
        });

      });

    });

    it('will checkin in a beer', (done) => {
      var client = new UntappdClient({
        clientId: process.env.UNTAPPD_CLIENT_ID,
        clientSecret: process.env.UNTAPPD_CLIENT_SECRET,
        clientToken: process.env.UNTAPPD_TEST_USER_ACCESS_TOKEN1
      });
      client.checkin(sampleBeerId, 'JST', '+9', {}, (err, data) => {
        expect(err).to.be.null;
        expect(data.meta.code).to.equal(200);
        expect(data).to.have.property('response').and.have.a.property('result').that.eql('success');
        lastCheckinId = data.response.checkin_id;
        done();
      });
    });

    it('will toast the last checked-in beer', (done) => {
      var client = new UntappdClient({
        clientId: process.env.UNTAPPD_CLIENT_ID,
        clientSecret: process.env.UNTAPPD_CLIENT_SECRET,
        clientToken: process.env.UNTAPPD_TEST_USER_ACCESS_TOKEN1
      });
      expect(lastCheckinId).to.not.be.null;

      client.toast(lastCheckinId, (err, data) => {
        expect(err).to.be.null;
        expect(data.meta.code).to.equal(200);
        expect(data).to.have.property('response').and.have.a.property('result').that.eql('success');
        done();
      });
    });

    it('will make a friend requst', (done) => {
      var client = new UntappdClient({
        clientToken: process.env.UNTAPPD_TEST_USER_ACCESS_TOKEN1
      });

      client.addFriend(secondUserId, (err, data) => {
        expect(err).to.be.null;
        expect(data.meta).to.be.an('object')
          .and.to.satisfy((meta) =>
            (meta.code === 200) || (meta.code === 500 && meta.error_detail.indexOf('request is pending') > -1));
        expect(data).to.have.property('response');
        done();
      });
    });

    it('will get the list of pending friend requests', (done) => {
      var client = new UntappdClient({
        clientToken: process.env.UNTAPPD_TEST_USER_ACCESS_TOKEN2
      });

      client.pendingFriends(null, (err, data) => {
        expect(err).to.be.null;
        expect(data.meta.code).to.equal(200);
        expect(data).to.have.property('response').and.have.a.property('count');
        done();
      });
    });

    it('will reject the friend request', (done) => {
      var client = new UntappdClient({
        clientToken: process.env.UNTAPPD_TEST_USER_ACCESS_TOKEN2
      });

      client.rejectFriend(firstUserId, (err, data) => {
        expect(err).to.be.null;
        expect(data).to.have.property('response').and.have.a.property('result').that.eql('success');
        done();
      });
    });

    it('will be able to make the friend requst again', (done) => {
      var client = new UntappdClient({
        clientToken: process.env.UNTAPPD_TEST_USER_ACCESS_TOKEN1
      });

      client.addFriend(secondUserId, (err, data) => {
        expect(err).to.be.null;
        expect(data.meta).to.be.an('object')
          .and.to.satisfy((meta) =>
            (meta.code === 200) || (meta.code === 500 && meta.error_detail.indexOf('request is pending') > -1));
        expect(data).to.have.property('response');
        done();
      });
    });

    it('will accept the friend request', (done) => {
      var client = new UntappdClient({
        clientToken: process.env.UNTAPPD_TEST_USER_ACCESS_TOKEN2
      });

      client.acceptFriend(firstUserId, (err, data) => {
        expect(err).to.be.null;
        expect(data).to.have.property('response').and.have.a.property('result').that.eql('success');
        done();
      });
    });

    it('will remove the friend', (done) => {
      var client = new UntappdClient({
        clientToken: process.env.UNTAPPD_TEST_USER_ACCESS_TOKEN2
      });

      client.removeFriend(firstUserId, (err, data) => {
        expect(err).to.be.null;
        expect(data.meta).to.be.an('object')
          .and.to.satisfy((meta) =>
            (meta.code === 200) || (meta.code === 500 && meta.error_detail.indexOf('You are not friends') > -1));
        expect(data).to.have.property('response').and.have.a.property('result').that.eql('success');
        done();
      });
    });

    it('will add a comment to a checkin', (done) => {
      var client = new UntappdClient({
        clientToken: process.env.UNTAPPD_TEST_USER_ACCESS_TOKEN1
      });

      client.addComment(lastCheckinId, 'Have a great day out there!', (err, data) => {
        expect(err).to.be.null;
        expect(data.meta.code).to.equal(200);
        expect(data).to.have.property('response').and.have.a.property('result').that.eql('success');
        lastCommentId = data.response.comments.items[data.response.comments.items.length - 1].comment_id;
        done();
      });
    });

    it('will remove a comment from the former checkin', (done) => {
      var client = new UntappdClient({
        clientToken: process.env.UNTAPPD_TEST_USER_ACCESS_TOKEN1
      });

      client.removeComment(lastCommentId, (err, data) => {
        expect(err).to.be.null;
        expect(data.meta.code).to.equal(200);
        expect(data).to.have.property('response').and.have.a.property('result').that.eql('success');
        done();
      });
    });

    it('will add a beer to the wishlist', (done) => {
      var client = new UntappdClient({
        clientToken: process.env.UNTAPPD_TEST_USER_ACCESS_TOKEN1
      });

      client.addToWishList(sampleBeerId, (err, data) => {
        expect(err).to.be.null;
        expect(data.meta.code).to.equal(200);
        expect(data).to.have.property('response').and.have.a.property('result').that.eql('success');
        done();
      });
    });

    it('will remove a beer from the wishlist', (done) => {
      var client = new UntappdClient({
        clientToken: process.env.UNTAPPD_TEST_USER_ACCESS_TOKEN1
      });

      client.removeFromWishList(sampleBeerId, (err, data) => {
        expect(err).to.be.null;
        expect(data.meta.code).to.equal(200);
        expect(data).to.have.property('response').and.have.a.property('result').that.eql('success');
        done();
      });
    });


  });
}