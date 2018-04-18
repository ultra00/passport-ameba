/**
 * Parse profile.
 *
 * @param {object|string} json
 * @return {object}
 * @access public
 */
exports.parse = function(json) {
  if ('string' == typeof json) {
    json = JSON.parse(json);
  }

  var profile = {};
  profile.id = json.id;
  profile.description = json.description;
  profile.displayName = json.name;
  profile.name = { familyName: json.last_name,
    givenName: json.first_name,
    middleName: json.middle_name };

  profile.gender = json.gender;
  profile.birthday = json.birthday;

  if (json.email) {
    profile.emails = [{ value: json.email }];
  }

  if (json.picture) {
      profile.photos = [{ value: json.picture }];
  }

  return profile;
};