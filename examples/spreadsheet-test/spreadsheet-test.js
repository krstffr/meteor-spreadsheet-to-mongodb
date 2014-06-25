SillyCollection = new Meteor.Collection('sillyCollection');

var options = [];

options.push({
  name: 'sillyExample',
  collection: SillyCollection,
  fields: [
  { name: 'name', idpart: true, required: true },
  { name: 'favoriteFruit', idpart: true },
  { name: 'favoriteVideoGame', idpart: true, required: true },
  { name: 'REMOVE' },
  { name: 'dateOfBirth', type: 'date' },
  { name: 'money', type: 'number' }
  ]
});

spreadsheetToMongoDB = new SpreadsheetToMongoDB( options );

if (Meteor.isClient) {

  Meteor.startup(function () {
    Meteor.subscribe('exampleData');
  });

  Template.hello.helpers({
    options: function () {
      return { showSchema: true };
    },
    example: function () {
      return SillyCollection.find();
    }
  });

}

if (Meteor.isServer) {
  Meteor.publish('exampleData', function () {
    return SillyCollection.find({}, { limit: 25 });
  });
}