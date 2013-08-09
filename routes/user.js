
/*
 * GET users listing.
 */

var User = function(fname, lname, phone) {
    this.FirstName = fname;
    this.LastName = lname;
    this.Phone = phone;
}

var users = [];

exports.init = function() {
    users.push(new User('Matt', 'Palmerlee', '818-123-4567'));
    users.push(new User('Joe', 'Plumber', '310-012-9876'));
    users.push(new User('Tom', 'Smith', '415-567-2345'));
}

exports.list = function(req, res){
  res.render('users', {'users':users, 'title':'Users'});
};