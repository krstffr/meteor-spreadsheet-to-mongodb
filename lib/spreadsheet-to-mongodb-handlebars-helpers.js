Handlebars.registerHelper('spreadsheetToMongoDBGetForm', function ( formName ) {
	// TODO FIX: The name here should probably be settable by user.
	// See issue #1 on github.
	// https://github.com/krstffr/meteor-spreadsheet-to-mongodb/issues/1
	if (!spreadsheetToMongoDB) return ;
		return spreadsheetToMongoDB.getTextarea(formName);
});