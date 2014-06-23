Meteor.methods({
	'SpreadsheetToMongoDB/save': function ( collection, formName ) {

		// Var to store the result
		var result;

		// TODO, FIX: If the user don't want to call it spreadsheetToMongoDB, what to do?
		if (!spreadsheetToMongoDB)
			throw new Meteor.Error(400, 'There\'s no spreadsheetToMongoDB object on server.');

		// Get the submitted form from the passed form name
		var currentForm = _(spreadsheetToMongoDB.options).findWhere({ name: formName });

		// If the user has set addUserId == true, store it in a var for usage when saving docs
		if (currentForm.addUserId) {
			if (!this.userId)
				throw new Meteor.Error(400, 'You need to be logged in to use this awesome feature.');
			var userId = this.userId;
		}

		// Loop over every doc, and save it
		_.each(collection, function( doc ){

			// If addUserId == true, add it to the doc
			if (currentForm.addUserId)
				doc.userId = userId;

			// Upsert it.
			currentForm.collection.upsert( doc._id, doc );
			
		});

	}
});