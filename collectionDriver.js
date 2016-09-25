var ObjectID = require('mongodb').ObjectID;
var assert = require('assert');

CollectionDriver = function(db) {
  this.db = db;
};

CollectionDriver.prototype.getCollection = function(collectionName, callback) {
  this.db.collection(collectionName, function(error, the_collection) {
    if( error ) callback(error);
    else callback(null, the_collection);
  });
};

//find all objects for a collection
CollectionDriver.prototype.findAll = function(collectionName, callback) {
    this.getCollection(collectionName, function(error, the_collection) { //A
      if( error ) callback(error)
      else {
        the_collection.find().toArray(function(error, results) { //B
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

//find a specific object by id
CollectionDriver.prototype.get = function(collectionName, id, callback) { //A
    this.getCollection(collectionName, function(error, the_collection) {
        if (error) callback(error)
        else {
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$"); //B
            if (!checkForHexRegExp.test(id)) callback({error: "invalid id"});
            else the_collection.findOne({'_id':ObjectID(id)}, function(error,doc) { //C
            	if (error) callback(error)
            	else callback(null, doc);
            });
        }
    });
}

//save new object
CollectionDriver.prototype.save = function(collectionName, obj, callback) {
    this.getCollection(collectionName, function(error, the_collection) { //A
      if( error ) callback(error)
      else {
        obj.cDate = new Date(); //B
        the_collection.insert(obj, function() { //C
          callback(null, obj);
        });
      }
    });
};


//update a specific object by querying with id
CollectionDriver.prototype.update = function(collectionName, obj, entityId, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
        if (error) callback(error)
        else {
	        obj = ObjectID(entityId); //A convert to a real obj id
	        obj.lastFinishedTime = new Date(); //B
          the_collection.save(obj, function(error,doc) { //C
          	if (error) callback(error)
          	else callback(null, obj);
          });
        }
    });
}

//delete a specific object by id
CollectionDriver.prototype.delete = function(collectionName, entityId, callback) {
    this.getCollection(collectionName, function(error, the_collection) { //A
        if (error) callback(error)
        else {
            the_collection.remove({'_id':ObjectID(entityId)}, function(error,doc) { //B
            	if (error) callback(error)
            	else callback(null, doc);
            });
        }
    });
}


CollectionDriver.prototype.insert = function(db, jsonData, callback){
    db.collection('activity').insertOne(jsonData,
        function(err, result){
            assert.equal(err, null);
            console.log("Inserted a document into the restaurants collection.");
            callback();
        }
    );
}

exports.CollectionDriver = CollectionDriver;