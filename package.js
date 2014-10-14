Package.describe({
  summary: "Copy a spreadsheet into a textarea and store the data in mongodb.",
  name: "krstffr:spreadsheet-to-mongodb",
  version: "1.0.2",
  git: "https://github.com/krstffr/meteor-spreadsheet-to-mongodb.git"
});

Package.onUse(function (api) {

  // Set versions from.
  api.versionsFrom("METEOR@0.9.0");

	api.use('templating', 'client');

	api.add_files('lib/external/jquery.csv-0.71.min.js', 'client');
  api.add_files('lib/spreadsheet-to-mongodb.js', ['client', 'server']);
  api.add_files('lib/spreadsheet-to-mongodb-server-methods.js', 'server');

  api.add_files('views/spreadsheet-to-mongodb__form.html', 'client');
  api.add_files('views/spreadsheet-to-mongodb__form.js', 'client');

  // The main object.
  api.export('SpreadsheetToMongoDB', ['server', 'client']);

});

Package.on_test(function (api) {
  
  api.use('krstffr:spreadsheet-to-mongodb');

  api.use('tinytest');
  api.use('test-helpers');

  api.add_files('tests/spreadsheet-to-mongodb-tests.js', ['client', 'server']);

});

