Package.describe({
  "summary": "Copy a spreadsheet into a textarea and store the data in mongodb."
});

Package.on_use(function (api) {

	api.add_files('lib/external/jquery.csv-0.71.min.js', ['client']);
  api.add_files('lib/spreadsheet-to-mongodb.js', ['client', 'server']);
  api.add_files('lib/spreadsheet-to-mongodb-server-methods.js', ['server']);

  if (typeof api.export !== 'undefined') {

    // The main object.
    api.export('SpreadsheetToMongoDB', ['server', 'client']);

  }

});
