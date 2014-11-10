SillyCollection = new Meteor.Collection('sillyCollection');

var newFormOptions = {
  formName: 'sillyExample',
  collection: SillyCollection,
  fields: [
  { name: 'name', idpart: true, required: true },
  { name: 'favoriteFruit', idpart: true },
  { name: 'favoriteVideoGame', idpart: true, required: true },
  { name: 'REMOVE' },
  { name: 'dateOfBirth', type: 'date' },
  { name: 'money', type: 'number', defaultValue: 5000 },
  { name: 'favoriteMovies', type: 'array', arrayMaxLength: 3 },
  { name: 'arrayWithCustomSeparator', type: 'array', arraySeparator: '|' }
  ],
  // This callback is for illustrating the saveCallback which can transform the data to be stored.
  saveCallback: function ( input ) {
    $('.SpreadsheetToMongoDB__form__textarea')
    .val('Hey! Did you know: you can provide your own saveCallback which does all kinds of crazy stuff to the spreadsheet data? Cool right? Also: you just saved or updated '+input.length+' docs to the DB! Also: the total sum in the "money" field was: ' + _.reduce(_(input).pluck('money'), function(memo, num){ return memo + num; }, 0) )
    .hide()
    .addClass('after-save-callback')
    .fadeIn(150)
    .on('click', function () {
      console.log('removing class etc.');
      $(this)
      .val('')
      .removeClass('after-save-callback')
      .off('click');
    });
    return input;
  }
};

SpreadsheetToMongoDB.addForm( newFormOptions );

if (Meteor.isClient) {

  Meteor.startup(function () {
    Meteor.subscribe('exampleData');
  });

  Template.hello.helpers({
    example: function () {
      return SillyCollection.find();
    }
  });

}

if (Meteor.isServer) {
  Meteor.publish('exampleData', function () {
    return SillyCollection.find({}, { limit: 25, sort: { name: 1 } });
  });
}