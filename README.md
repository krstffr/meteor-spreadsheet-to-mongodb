# Spreadsheet-to-mongoDB for meteor.js [![Build Status](https://travis-ci.org/krstffr/meteor-spreadsheet-to-mongodb.svg)](https://travis-ci.org/krstffr/meteor-spreadsheet-to-mongodb)

Maybe you have a spreadsheet with lot's of data you want to use in your Meteor.js application. You'd probably want to store it in mongodb. How would you do that?

Well, with this package, just copy and paste the spreadsheet into a textarea and press and button, and it's there, right in your database.

## Super simple demo

Check out a demo here: http://spreadsheet-to-mongodb.meteor.com/

Use this spreadsheet format for adding data: https://docs.google.com/spreadsheets/d/1N1zpuBuYGbBKKkI-aiMluuvBkP7rIkh2wG4JbeLdAQw/edit#gid=0

## Here's how to make it work.

- Install the package: `mrt add krstffr:spreadsheet-to-mongodb`.
- Create a file which is available on both the server and the client.
- Set some options for the new "form" which will accept your spreadsheet data:
```javascript

	// This is for a spreadsheet holding bank statements (if that's what they're called in english).
	// We push it into the options array.
	var formOptions = {
		// Set a name for this specific "spreadsheet"
		formName: 'bankStatements',
		// Pass the collection in which you want to store the data inside
		// Note! This collection has to be defined by you!
		collection: BankStatements,
		// Should we pass part of the current users _id to the documents _id?
		// (This one needs more explaining!)
		addUserIdToId: true,
		// The fields, in the order they appear in the spreadsheet.
		fields: [
		{
			// This will be the key for the stored value
			name: 'date',
			// Every field which gets idpart set to true will be part of a hashed _id key for the document.
			// So: if you've got three fields for every spreadsheet row which will always remain constant,
			// you can use these for generating the _id for the document. This will make sure that every time
			// you update the spreadsheet and copy/paste the data into the textarea, the same document will
			// be updated instead of creating a completely new docuemnt.
			// (This might be super hard to understand. Needs more work.)
			idpart: true,
			// What kind of data should be stored? Currently 'number', 'date' and 'array' are supported.
			// (All other fields will be saved as strings.)
			type: 'date',
			// Is this field required? Meaning: if it's not set when submitting the spreadsheet
			// data an error will be thrown.
			required: true,
			// This sets a default value for docs.
			// (In this case, it kind of negates the use of required: true as if there is no value set then
			// this deafult value will be set.)
			defaultValue: '2014-01-01'
		},
		{ name: 'commentBank', idpart: true, required: true },
		// For cols in your spreadsheet which you don't want to store, just set the name to 'REMOVE'
		// and they won't be stored.
		{ name: 'REMOVE' },
		// The threeValuesInAnArray will be saved as an array, and it is separated by commas in your spreadsheet.
		// The arrayMaxLength: 3 makes sure only three items are stored.
		{ name: 'threeValuesInAnArray', type: 'array', arrayMaxLength: 3 },
		// The array below will use '|' as a separator instead of ','
		{ name: 'arrayWithCustomSeparator', arraySeparator: '|' },
		{ name: 'amount', type: 'number', idpart: true, required: true },
		{ name: 'sum', type: 'number' },
		{ name: 'commentUser' },
		{ name: 'REMOVE' }
		]
	};
	
	// Add the form!
	SpreadsheetToMongoDB.addForm( formOptions );

```
- Now you're all set up. Now you just need the actual form to paste your spreadsheets into. Use this handlebars helper to get the field (use the formName to select what form to get!):
`{{> spreadsheetToMongodb__form 'bankStatements' }}`
- Now you've got the form in your HTML, and when you copy/paste the spreadsheet data it will be stored in your mongodb.
- If you've set up fields with the `idpart: true` key then you can paste the data multiple times and be sure that you only get one doc/row in your spreadsheet, as the saving is done using .upsert(). (This might still be quite hard to grasp.)

## Defining your own save callback

Maybe you don't want the default save behaviour to execute when the user clicks the save button (which inserts all the rows from the spreadsheet into the MongoDB collection you've provided). Maybe you don't want to save the data at all. In these cases you've got two options: **1.** provide your own callback for the saved data and **2.** override the default save-to-DB behaviour.

**Provied your own save callback**

To run your own callback on the spreadsheet data, provide a ```.saveCallback( input )``` method to the form options object. The callback **must** return an array of your transformed data. Like this:

```javascript

	formOptions.saveCallback = function ( input ) {
		input = _(input).map( function( spreadsheetRow ) {
			// Math.floor the sum field
			spreadsheetRow.sum = Math.floor( spreadsheetRow.sum );
			return spreadsheetRow;
		});
		// You must always return the data you've modified
		return input;
	};

```

The returned ```input``` array will be saved to the provided MongoDB collection.

**Override the default save-to-DB behaviour**

If you don't want the data to be inserted into MongoDB, just provide add the ```.saveToDB = false``` field to your form options. This way you can do whatever you want to the data in your saveCallback method instead of saving it to MongoDB. Just add this:

```javascript

	formOptions.saveToDB = false;

```