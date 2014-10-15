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
  ]
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