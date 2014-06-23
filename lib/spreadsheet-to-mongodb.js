SpreadsheetToMongoDB = function ( options ) {

	var that = this;
	that.options = options;

	// CSS classes
	that.cssClassesMain = 'SpreadsheetToMongoDB';
	that.cssClasses = {
		form: that.cssClassesMain +	'__form',
		textarea: that.cssClassesMain +	'__form__textarea'
	};

	// Method for hashing strings
	that.hashCode = function( str ) {
		var hash = 0, i, chr, len;
		if (str.length === 0) return hash;
		for (i = 0, len = str.length; i < len; i++) {
			chr   = str.charCodeAt(i);
			hash  = ((hash << 5) - hash) + chr;
			hash |= 0;
		}
		return hash;
	};


	// Client methods
	if (Meteor.isClient) {

		that.getTextarea = function (name) {

			// Check that the name exists in that.options
			if (!_(that.options).findWhere({ name: name }))
				throw new Error('You\'re trying to get a textarea which does not exist: '+name);

			// This is for temporarily putting the generated HTML in
			var HTMLwrapper = $('<div />');

			// The form
			var HTMLform = $('<form />')
			.attr('data-spreadsheet-to-mongodb-name', name)
			.addClass(that.cssClasses.form);

			// The textarea
			var HTMLtextarea = $('<textarea />')
			.addClass(that.cssClasses.textarea);

			// The save button
			var HTMLsaveButton = $('<input />')
			.val('Save')
			.attr('type', 'submit');

			HTMLform.append(HTMLtextarea, HTMLsaveButton);
			HTMLwrapper.append(HTMLform);

			return HTMLwrapper.html();

		};

		that.submitForm = function ( input, formName ) {

			// Get the form passed to options based on name
			var currentForm = _(that.options).findWhere({ name: formName });

			// Fix up input data
			input = '"'+input;										// First line
			input = input.replace(/	/g, '"	"');	// Place qoutes before and after tabs
			input = input.replace(/\n/g, '"\n"');	// Place quotes on end line (and start of the next)
			input = input.replace(/ "/g, '"');		// Remove trailing spaces
			input = input.replace(/	/g, ',');			// Replace all tabs with commas

			// Get the header row.
			var header = _(currentForm.fields).pluck('name');

			// Add header-row
			input = header.toString() + '\n' + input;

			var inputAsArray = $.csv.toObjects(input);

			// Get the idpart, number and date fields
			var _idFields = _.where(currentForm.fields, { idpart: true });
			var numberFields = _(_.where(currentForm.fields, { type: 'number' })).pluck('name');
			var dateFields = _(_.where(currentForm.fields, { type: 'date' })).pluck('name');

			inputAsArray = _(inputAsArray).map( function( inputRow ) {

				// Generate an _id
				_.each(_idFields, function(_idField) {
					inputRow._id += inputRow[ _idField.name ];
				});

				// Hash the _id, and remove whitespaces
				inputRow._id = that.hashCode( inputRow._id.replace(/ /g, '') );

				// Add the userId to the _id if user set addUserIdToId to options
				if (currentForm.addUserIdToId)
					inputRow._id += Meteor.userId().substr(0,10);

				// Remove all values which have the REMOVE key
				inputRow = _(inputRow).omit('REMOVE');

				// Make sure numbers are numbers
				_.each(numberFields, function(numberFieldName) {
					inputRow[numberFieldName] = parseFloat( inputRow[numberFieldName] );
				});

				// Make sure dates are dates
				_.each(dateFields, function(dateFieldName) {
					inputRow[dateFieldName] = new Date( inputRow[dateFieldName] );
				});

				return inputRow;

			});

			Meteor.call('SpreadsheetToMongoDB/save', inputAsArray, formName, function (error, result) {
				console.log(error, result);
			});

		};

		that.setupFormEvents = function () {
			
			// First unattach any previously bound events
			$('body').off('submit', '.'+that.cssClasses.form);

			// Now bind the new one.
			$('body').on('submit', '.'+that.cssClasses.form, function ( event ) {
				
				var formInput = $(this).find('.'+that.cssClasses.textarea).val();
				var formName = $(this).data('spreadsheet-to-mongodb-name');

				that.submitForm( formInput, formName );

				return false;

			});

		};

		that.init = function () {

			that.setupFormEvents();

		};

		this.init();

	}

	// Server methods
	if (Meteor.isServer) {

	}

};