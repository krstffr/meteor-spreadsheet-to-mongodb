# Spreadsheet-to-mongoDB for meteor.js

Maybe you have a spreadsheet with lot's of data you want to use in your Meteor.js application. You'd probably want to store it in mongodb. How would you do that?

Well, with this package, just copy and paste the spreadsheet into a textarea and press and button, and it's there, right in your database.

## Super simple demo

[http://spreadsheet-to-mongodb.meteor.com./](Check out the demo at spreadsheet-to-mongodb.meteor.com).

## Here's how to make it work.

- Install the package: `mrt add spreadsheet-to-mongodb`.
- Create a file which is available on both the server and the client (maybe in a both/ directory).
- Inside, set some options which describes the data which is in the spreadsheet you're copying from:
```javascript


	// Holder for all options (an array)
	var options = [];

	// This is for a spreadsheet holding bank statements (if that's what they're called in english).
	// We push it into the options array.
	options.push({
		// Set a name for this specific "spreadsheet"
		name: 'bankStatements',
		// Pass the collection in which you want to store the data inside
		collection: BankStatements,
		// Should we pass the current users _id to every document? If not, just ignore setting this.
		addUserId: true,
		// Should we pass part of the current users _id to the documents _id?
		// (This one needs more explaingin!)
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
			// What kind of data should be stored? Currently only 'number' and 'date' are supported.
			type: 'date',
			// Is this field required? Meaning: if it's not set an error will be thrown.
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
		{ name: 'amount', type: 'number', idpart: true, required: true },
		{ name: 'sum', type: 'number' },
		{ name: 'commentUser' },
		{ name: 'REMOVE' }
		]
	});
	
	// Initialise
	spreadsheetToMongoDB = new SpreadsheetToMongoDB( options );

```
- Now you're all set up. Now you just need the actual form to paste your spreadsheets into. Use this handlebars helper to get the field:
`{{{ spreadsheetToMongoDBGetForm 'bankStatements' }}}`
- Now you've got the form in your HTML, and when you copy/paste the spreadsheet data it will be stored in your mongodb.
- If you've set up fields with the `idpart: true` key then you can paste the data multiple times and be sure that you only get one doc/row in your spreadsheet, as the saving is done using .upsert(). (This might still be quite hard to grasp.)
