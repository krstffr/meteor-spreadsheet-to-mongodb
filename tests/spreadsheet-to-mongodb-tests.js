// STUB!
Meteor.userId = function () {
	return 'some kind of long string which gets returned etc';
};

var TestCollection = new Meteor.Collection('testCollection');

var correctFormOptions = {
	formName: 'A form name',
	collection: TestCollection,
	fields: [
	{ name: 'name', idpart: true, required: true },
	{ name: 'favoriteFruit', idpart: true },
	{ name: 'favoriteVideoGame', idpart: true, required: true },
	{ name: 'REMOVE' },
	{ name: 'dateOfBirth', type: 'date' },
	{ name: 'money', type: 'number' }
	]
};

var correctForm2Name = 'form 2';

var yetAnotherFormOptions = {
	formName: 'validationForm',
	collection: TestCollection,
	fields: [
	{ name: 'string', idpart: true },
	{ name: 'number', type: 'number', idpart: true },
	{ name: 'date', type: 'date' },
	{ name: 'REMOVE' },
	{ name: 'string2' }
	]
};

Tinytest.add('Spreadsheet To MongoDB - SpreadsheetToMongoDB should be set', function (test) {
	test.isNotNull(SpreadsheetToMongoDB);
});

Tinytest.add('Spreadsheet To MongoDB - that.log.enabled should be true', function (test) {
	SpreadsheetToMongoDB.log.enable();
	test.isTrue(SpreadsheetToMongoDB.log.enabled);
});

Tinytest.add('Spreadsheet To MongoDB - that.log.enabled should be disablable', function (test) {
	SpreadsheetToMongoDB.log.disable();
	test.isFalse(SpreadsheetToMongoDB.log.enabled);
});

Tinytest.add('Spreadsheet To MongoDB - hashCode( str ) should return the same hash', function (test) {
	var hashedString = SpreadsheetToMongoDB.hashCode('string 1');
	var hashedString2 = SpreadsheetToMongoDB.hashCode('string 2');
	test.equal( hashedString, SpreadsheetToMongoDB.hashCode('string 1') );
	test.notEqual( hashedString, SpreadsheetToMongoDB.hashCode('string 2') );
	test.equal( hashedString2, SpreadsheetToMongoDB.hashCode('string 2') );
});

Tinytest.add('Spreadsheet To MongoDB - addForm( formOptions ) should add a form when given correct formOptions', function (test) {

	var result = SpreadsheetToMongoDB.addForm( correctFormOptions );
	var result2 = SpreadsheetToMongoDB.addForm( yetAnotherFormOptions );

	test.equal( result.formName, correctFormOptions.formName );
	test.equal( result2.formName, yetAnotherFormOptions.formName );

});

Tinytest.add('Spreadsheet To MongoDB - addForm( formOptions ) should throw errors when given wrong formOptions', function (test) {

	var wrongFormOptions = {
		formName: { not: 'a string' },
		collection: 'not a real collection but a string',
		fields: 1234
	};

	test.throws(function () {
		// With the wrong formName type
		SpreadsheetToMongoDB.addForm( wrongFormOptions );
	});

	test.throws(function () {
		wrongFormOptions.formName = correctForm2Name;
		// With the wrong collection type
		SpreadsheetToMongoDB.addForm(wrongFormOptions);
	});

	test.throws(function () {
		wrongFormOptions.collection = correctFormOptions.collection;
		// With the wrong fields type
		SpreadsheetToMongoDB.addForm(wrongFormOptions);
	});

	wrongFormOptions.fields = correctFormOptions.fields;
	// Now all the wrong options have been replaces by correct ones and the form should be createable
	test.equal( SpreadsheetToMongoDB.addForm(wrongFormOptions).formName, correctForm2Name );

});

Tinytest.add('Spreadsheet To MongoDB - getFormByName( formName )', function (test) {
	
	var form1 = SpreadsheetToMongoDB.getFormByName( correctFormOptions.formName );
	test.equal( form1.fields[0].name, correctFormOptions.fields[0].name );

	var incorrectFormName = 'a form which does not exist';
	test.throws(function () {
		SpreadsheetToMongoDB.getFormByName( incorrectFormName );
	});

});

Tinytest.add('Spreadsheet To MongoDB Client - .types numbers should be numbers', function (test) {

	var formFields = [{
		name: 'age',
		type: 'number'
	},
	{
		name: 'salary',
		type: 'number'
	},
	{
		name: 'years',
		type: 'number'
	}];

	var inputRow = {
		age: '34',
		salary: 5000,
		somethingElse: 'hej hej',
		years: '400'
	};

	inputRow = SpreadsheetToMongoDB.types.checkAllTypes( inputRow, formFields );

	test.equal( typeof inputRow.age, 'number' );
	test.equal( typeof inputRow.salary, 'number' );
	test.equal( typeof inputRow.years, 'number' );

});

Tinytest.add('Spreadsheet To MongoDB Client - .types dates should be dates', function (test) {

	var formFields = [{
		name: 'birthDate',
		type: 'date'
	},
	{
		name: 'deathDate',
		type: 'date'
	}];

	var inputRow = {
		birthDate: '21/04/1984',
		salary: 5000,
		somethingElse: 'hej hej',
		deathDate: '31/12/2056'
	};

	test.equal( typeof inputRow.birthDate, 'string' );
	test.equal( typeof inputRow.deathDate, 'string' );

	inputRow = SpreadsheetToMongoDB.types.checkAllTypes( inputRow, formFields );

	test.instanceOf( inputRow.birthDate, Date );
	test.instanceOf( inputRow.deathDate, Date );

});

Tinytest.add('Spreadsheet To MongoDB Client - .types arrays should be arrays', function (test) {

	var formFields = [{
		name: 'listOfThings',
		type: 'array'
	},
	{
		name: 'otherStuff',
		type: 'array',
		arrayMaxLength: 3
	}];

	var inputRow = {
		listOfThings: '123, Whatever, nice, 564 , 54, ""',
		salary: 5000,
		somethingElse: 'hej hej',
		otherStuff: '123,213,2564,Something'
	};

	test.equal( typeof inputRow.listOfThings, 'string' );
	test.equal( typeof inputRow.otherStuff, 'string' );

	inputRow = SpreadsheetToMongoDB.types.checkAllTypes( inputRow, formFields );

	test.instanceOf( inputRow.listOfThings, Array );
	test.instanceOf( inputRow.otherStuff, Array );

	// Make sure numbers are number, and strings are strings.
	test.equal( inputRow.listOfThings[0], 123 );
	test.equal( inputRow.listOfThings[3], 564 );
	test.equal( inputRow.listOfThings[5], '""' );
	test.length( inputRow.otherStuff, 3 );

});

if (Meteor.isServer) {

	Tinytest.addAsync('Spreadsheet To MongoDB Server - SpreadsheetToMongoDB/save( collection, formName )', function (test, next) {
		var docsToSave = [
		{
			name: 'A name',
			favoriteFruit: 'Apple',
			favoriteVideoGame: 'Super Mario Bros',
			dateOfBirth: new Date(),
			money: 400
		},
		{
			name: 'Another name',
			favoriteFruit: 'Banana',
			favoriteVideoGame: 'FFVII',
			dateOfBirth: new Date(),
			money: -951321
		},
		];

		Meteor.call('SpreadsheetToMongoDB/save', docsToSave, correctFormOptions.formName, function (err, res) {
			test.length(res, 2);
			next();
		});

	});

}

if (Meteor.isClient) {

	Tinytest.add('Spreadsheet To MongoDB Client - handleInput.checkRequiredFields( requiredFields, inputRow )', function (test) {
		
		var requiredFields = [{
			name: 'a required field'
		}, {
			name: 'some other required field'
		}];

		var inputRow = {
			'a required field': 'yes'
		};

		// So now one field is missing
		test.throws(function () {
			SpreadsheetToMongoDB.handleInput.checkRequiredFields( requiredFields, inputRow );
		});

		// Lets add the missing field
		inputRow['some other required field'] = 145;

		test.equal( SpreadsheetToMongoDB.handleInput.checkRequiredFields( requiredFields, inputRow ), true );

		// Lets add another required field which will throw an error
		requiredFields.push({
			name: 'yet another one!'
		});

		test.throws(function () {
			SpreadsheetToMongoDB.handleInput.checkRequiredFields( requiredFields, inputRow );
		});

	});

	Tinytest.add('Spreadsheet To MongoDB Client - handleInput.setDefaultValues( fieldsWithDefaultValues, inputRow )', function (test) {
		
		var inputRow = {
			name: 'something',
			age: 34
		};
		
		var defaultValues = [{
			name: 'work',
			defaultValue: 'Carpenter'
		}, {
			name: 'birthPlace',
			defaultValue: 'Stockholm'
		}];
		
		var inputRowWithDefaultInputs = SpreadsheetToMongoDB.handleInput.setDefaultValues( defaultValues, inputRow );
		
		test.equal( inputRowWithDefaultInputs[defaultValues[0].name], defaultValues[0].defaultValue );
		test.equal( inputRowWithDefaultInputs[defaultValues[1].name], defaultValues[1].defaultValue );

	});

	Tinytest.add('Spreadsheet To MongoDB Client - handleInput.createId( _idFields, inputRow, currentForm )', function (test) {

		var inputRow1 = {
			birthDate: '21/04/1984',
			salary: 5000,
			somethingElse: 'hej hej',
			deathDate: '31/12/2056'
		};
		var inputRow2 = {
			birthDate: '21/04/1983',
			salary: 100,
			somethingElse: 'no',
			deathDate: '31/12/2064'
		};

		var _idFields = [{
			name: 'birthDate',
			idpart: true
		}, {
			name: 'somethingElse',
			idpart: true
		}];

		var currentForm = SpreadsheetToMongoDB.getFormByName( correctFormOptions.formName );

		var firstIteration = SpreadsheetToMongoDB.handleInput.createId( _idFields, inputRow1, currentForm );
		var secondIteration = SpreadsheetToMongoDB.handleInput.createId( _idFields, inputRow1, currentForm );
		var otherIteration = SpreadsheetToMongoDB.handleInput.createId( _idFields, inputRow2, currentForm );

		// Should be a number when _idFields gets passed
		test.equal( typeof firstIteration, 'number' );
		test.equal( firstIteration, secondIteration );
		test.notEqual( firstIteration, otherIteration );

		var iterationWithoutIdFields = SpreadsheetToMongoDB.handleInput.createId( [], inputRow2, currentForm );

		// Should be a string when no _idFields gets passed
		test.equal( typeof iterationWithoutIdFields, 'string' );

		var tempForm = _.clone(currentForm);
		tempForm.addUserIdToId = true;

		var iterationWithMeteorUserId = SpreadsheetToMongoDB.handleInput.createId( [], inputRow2, tempForm );

		// The Meteor.userId() should be part of the new id!
		test.isTrue( iterationWithMeteorUserId.indexOf( Meteor.userId().substring(0,3) ) > -1 );

	});

Tinytest.add('Spreadsheet To MongoDB Client - saveData( input, formName )', function (test) {

	var input = 'row1.string\t500\t1/18/1901\trow1.REMOVE\trow1.string2\trow1.ANEXTRAVALUEWHICHDISAPPEARS\nrow2.string\t800\t10/31/2054\trow2.REMOVE\trow2.string2\n\n\nrow5.string\t5684800\t12/31/3954\trow5.REMOVE\trow5.string2\trow5.anExtraField?';

	var returnedInput = SpreadsheetToMongoDB.saveData( input, yetAnotherFormOptions.formName );

	test.equal( returnedInput[1].string, 'row2.string' );
	test.equal( returnedInput[0].number, 500 );
	test.instanceOf( returnedInput[1].date, Date );
	test.isUndefined( returnedInput[0].REMOVE );
	test.equal( returnedInput[1].string2, 'row2.string2' );
	test.isUndefined( returnedInput[3].string2 );
	test.isUndefined( returnedInput[3].REMOVE );
	test.isUndefined( returnedInput[3].date );
	test.isUndefined( returnedInput[2].number );
	test.equal( returnedInput[4].string, 'row5.string' );

});

}