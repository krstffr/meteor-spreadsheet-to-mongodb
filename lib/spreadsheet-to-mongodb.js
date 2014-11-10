SpreadsheetToMongoDBHandler = function () {

	var that = this;

	// Holder for all the forms!
	that.forms = [];


	// Handling of "types", meaning input types, such as "number", "date" etc.
	// Used for making sure the input "34" of type "numer" will be 34 instead of "34"
	that.types = {};

	// The default transform method
	that.types.defaultTransformMethod = function ( formFields, inputRow, typeName, cb ) {
		var fieldsOfType = _(_.where(formFields, { type: typeName })).pluck('name');
		_.each(fieldsOfType, function( fieldName ) {
			if (inputRow[fieldName])
				inputRow[fieldName] = cb( inputRow[fieldName] );
		});
		return inputRow;
	};

	// Execute each approved type's tranformMethod on the inputRow
	that.types.checkAllTypes = function ( inputRow, currentFormFields ) {
			
		check( inputRow, Object );
		check( currentFormFields, Array );

		_( that.types.approvedTypes ).each( function( type ) {
			inputRow = type.transformMethod( currentFormFields, inputRow );
		});

		return inputRow;

	};

	that.types.approvedTypes = [
	{
		name: 'number',
		transformMethod: function ( formFields, inputRow ) {
			return that.types.defaultTransformMethod(formFields, inputRow, this.name, function ( value ) {
				return parseFloat( value );
			});
		}
	},
	{
		name: 'date',
		transformMethod: function ( formFields, inputRow ) {
			return that.types.defaultTransformMethod(formFields, inputRow, this.name, function ( value ) {
				return new Date( value );
			});
		}
	},
	{
		name: 'array',
		transformMethod: function ( formFields, inputRow ) {

			// This is the callback used below!
			var cb = function ( value, arrayField ) {

				// Either use the user passed separator or the default comma
				var arraySeparator = arrayField.arraySeparator || ',';

				// split() the value into an array
				var arrayValue = value.split( arraySeparator );
				
				// trim() every item.
				arrayValue = _( arrayValue ).map( function( value ) { return value.trim(); });
				
				// Transform numbers into numbers
				arrayValue = _( arrayValue ).map( function( value ) {
					if (!isNaN(value))
						value = parseFloat( value );
					return value;
				});

				if (arrayField.arrayMaxLength)
					arrayValue = arrayValue.slice( 0, arrayField.arrayMaxLength );

				return arrayValue;

			};

			var arrayFields = _.where(formFields, { type: this.name });

			_.each(arrayFields, function( arrayField ) {
				if (inputRow[arrayField.name])
					inputRow[arrayField.name] = cb( inputRow[arrayField.name], arrayField );
			});
			return inputRow;

		}
	}
	];


	// Logger
	that.log = {};

	that.log.enabled = true;

	that.log.enable = function () {
		that.log.enabled = true;
	};

	that.log.disable = function () {
		that.log.enabled = false;
	};

	that.log.logMessage = function ( msg ) {
		if (that.log.enabled)
			return console.log( msg );
		return ;
	};

	// Method for hashing strings in a predictable way.
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

	that.addForm = function ( formOptions ) {

		// Make sure the user has provided correct types
		check(formOptions, Object);
		check(formOptions.formName, String);
		check(formOptions.collection, Meteor.Collection);
		check(formOptions.fields, Array);

		// Optional options
		if (formOptions.saveCallback)
			check(formOptions.saveCallback, Function);

		// .saveToDB should be a bool, and always be set 
		if (formOptions.saveToDB === undefined)
			formOptions.saveToDB = true;
		check(formOptions.saveToDB, Boolean);

		// Add the form to the forms array
		that.forms.push( formOptions );

		return that.forms[ that.forms.length - 1 ];

	};

	// Get the current form from .optios (based on name)
	that.getFormByName = function ( formName ) {

		check(formName, String);

		var currentForm = _(that.forms).findWhere({ formName: formName });
		if (!currentForm)
			throw new Error('You\'re trying to get a form which does not exist: '+formName);

		return currentForm;

	};

	// Client methods
	if (Meteor.isClient) {

		// Methods for handling the input
		that.handleInput = {};

		that.handleInput.checkRequiredFields = function ( requiredFields, inputRow ) {
			// Make sure all required fields are set
			_.each(requiredFields, function(requiredField) {
				if (!inputRow[ requiredField.name ]) {
					that.log.logMessage({ errorDoc: inputRow });
					throw new Error('Required field not set: ' + requiredField.name + '. See passed doc in the row above.');
				}
			});
			return true;
		};

		that.handleInput.setDefaultValues = function ( fieldsWithDefaultValues, inputRow ) {
			// Set default values for unset values
			_.each(fieldsWithDefaultValues, function( fieldWithDefaultValue ) {
				if( !inputRow[ fieldWithDefaultValue.name ] )
					inputRow[ fieldWithDefaultValue.name ] = fieldWithDefaultValue.defaultValue;
			});
			return inputRow;
		};

		that.handleInput.createId = function ( _idFields, inputRow, currentForm ) {

			var _id;

			// Generate an _id if there are _idFields set by the user
			_.each(_idFields, function(_idField) {
				_id += inputRow[ _idField.name ];
			});

			// Hash the _id and remove whitespaces (if the _id is generated by the users _idFields )
			if (_id && _idFields.length > 0)
				_id = that.hashCode( _id.replace(/ /g, '') );

			// If there is no _id set from _idFields (or explicitly by 
			// setting { _id: 'something' }), generate one!
			if (!_id)
				_id = Meteor.uuid();

			// Add the userId to the _id if user set addUserIdToId
			if (currentForm.addUserIdToId)
				_id += Meteor.userId().substr(0,10);

			return _id;

		};

		that.saveData = function ( input, formName ) {

			check( input, String );
			check( formName, String );

			// Get the form passed to options based on name
			var currentForm = that.getFormByName( formName );

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

			// Get the idpart, number, date, required fields and fields with default values
			var _idFields = _.where(currentForm.fields, { idpart: true });
			var numberFields = _(_.where(currentForm.fields, { type: 'number' })).pluck('name');
			var dateFields = _(_.where(currentForm.fields, { type: 'date' })).pluck('name');
			var requiredFields = _.where(currentForm.fields, { required: true });

			var fieldsWithDefaultValues = _.filter(currentForm.fields, function ( field ) {
				if (field.defaultValue) return field;
			});

			inputAsArray = _(inputAsArray).map( function( inputRow ) {

				// Make sure all required fields are set
				that.handleInput.checkRequiredFields( requiredFields, inputRow );

				// Set default values for unset values
				inputRow = that.handleInput.setDefaultValues( fieldsWithDefaultValues, inputRow );

				// Cretate the _id field
				inputRow._id = that.handleInput.createId( _idFields, inputRow, currentForm );

				// Remove all values which have the REMOVE key
				inputRow = _(inputRow).omit('REMOVE');

				// Execute all the "approvedTypes" transformMethods
				inputRow = that.types.checkAllTypes( inputRow, currentForm.fields );

				return inputRow;

			});

			// Check if the user has provided her own save callback method
			if (currentForm.saveCallback) {
				
				// Make sure the saveCallback is a Function
				check(currentForm.saveCallback, Function);

				inputAsArray = currentForm.saveCallback( inputAsArray );

				check(inputAsArray, Array);

			}

			if (currentForm.saveToDB) {
				// If the user has not provided a custom callback, execute the default save method
				Meteor.call('SpreadsheetToMongoDB/save', inputAsArray, formName, function (error, result) {
					if (error)
						that.log.logMessage(error);
				});
			}

			return inputAsArray;

		};

	}

};

SpreadsheetToMongoDB = new SpreadsheetToMongoDBHandler();