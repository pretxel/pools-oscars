Migrations.add({
  version: 1,
  up() {
     const batch = Predictions.find({points: {$exists: false}}).forEach(prediction => {
      const points = 0;
      Predictions.update(prediction._id, {$set: {points}});
    });

    const execute = Meteor.wrapAsync(batch.execute, batch);
    return execute();
  },
  down() {
    Predictions.update({}, {$unset: {points: true}});
  }
});