/**
 * Module dependencies.
 */
var util = require('util')
    , OAuth2Strategy = require('passport-oauth2')
    , InternalOAuthError = require('passport-oauth2').InternalOAuthError;
    , Profile = require('./profile');


/**
 * `Strategy` constructor.
 *
 * The Ameba authentication strategy authenticates requests by delegating to
 * Ameba using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `channelID`      your Ameba channel's id
 *   - `clientSecret`   your Ameba channel's secret
 *   - `callbackURL`   URL to which Ameba will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new LineStrategy({
 *         channelID: 'XXX',
 *         clientSecret: 'XXXX'
 *         callbackURL: 'https://www.example.net/auth/line/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {

  this._userProfileURL = options.userProfileURL || 'https://api.amebame.com/graph/me';

  options = options || {};

  options.state = options.state || true;

  options.clientID = options.channelID;
  options.clientSecret = options.channelSecret;
  options.authorizationURL = options.authorizationURL || 'https://dauth.user.ameba.jp/authorize?';
  options.tokenURL = options.tokenURL || 'https://dauth.user.ameba.jp/token';

  if (!options.scope) {
    options.scope = 'profile';
  }

  OAuth2Strategy.call(this, options, verify);

  this.name = 'ameba';

  // Use Authorization Header (Bearer with Access Token) for GET requests. Used to get User's profile.
  this._oauth2.useAuthorizationHeaderforGET(true);
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from Ameba.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `line`
 *   - `id`               the user's Ameba ID
 *   - `displayName`      the user's full name
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {

  this._oauth2.get(this._userProfileURL, accessToken, function (err, body, res) {
    var json;

    if (err) {
      return done(new InternalOAuthError('failed to fetch user profile', err));
    }

    try {
      json = JSON.parse(body);
    } catch(e) {
      return done(e);
    }

    var profile = Profile.parse(json);
    profile.provider = 'abema';
    profile._raw = body;
    profile._json = json;

    done(null, profile);

  });
};


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;