const amigoSchema = new mongoose.Schema({
  id: Number,
  species: String,
  last_seen_address: String,
  name: String,
  description: String,
  message: String,
  photo_url: String,
  owner_id: Number,
  owner_number: String,
  stray: Boolean,
  outdoor_amigo: Boolean,
});
