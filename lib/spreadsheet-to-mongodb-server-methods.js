Meteor.methods({
	'SpreadsheetToMongoDB/save': function ( collection, formName ) {

		var result;

		if (!spreadsheetToMongoDB)
			throw new Meteor.Error(400, 'There\'s no spreadsheetToMongoDB object on server.');

		var currentForm = _(spreadsheetToMongoDB.options).findWhere({ name: formName });
		console.log(currentForm);

		if (currentForm.addUserId) {
			if (!this.userId)
				throw new Meteor.Error(400, 'You need to be logged in to use this awesome feature.');
			var userId = this.userId;
		}

		_.each(collection, function( doc ){

			if (currentForm.addUserId)
				doc.userId = userId;

			currentForm.collection.upsert( doc._id, doc );
			
		});

	},
});