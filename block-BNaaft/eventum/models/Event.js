const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
    host: String,
    start_date: Date,
    end_date: Date,
    categories: [{ type: String }],
    location: String,
    likes: { type: Number, default: 0 },
    remarks: [{ type: Schema.Types.ObjectId, ref: "Remark" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
