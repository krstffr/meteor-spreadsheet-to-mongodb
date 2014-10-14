Template.spreadsheetToMongodb__form.helpers({
	form: function () {
		// this should be the name of the form
		if (!this)
			return ;
		// Return the form based on the formName
		var formName = this.toString();
		return SpreadsheetToMongoDB.getFormByName( formName );
	}
});

Template.spreadsheetToMongodb__form.events({
	'submit': function ( e, tmpl ) {

		e.preventDefault();

		// Get the formName and the input and pass it to the saveData method
		var input = $( tmpl.find('.SpreadsheetToMongoDB__form__textarea') ).val();
		var formName = tmpl.data.toString();

		SpreadsheetToMongoDB.saveData( input, formName );

	}
});