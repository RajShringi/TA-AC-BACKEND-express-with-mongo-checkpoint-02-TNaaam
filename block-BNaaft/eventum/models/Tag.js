const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tagSchema = new Schema(
  {
    name: { type: String, required: true },
    events: [{ type: Schema.Types.ObjectId, ref: "Event", required: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tag", tagSchema);
