module.exports = {
  async up(db, client) {
    await db.collection('version').insertOne({id: '1'});
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
  }
};
