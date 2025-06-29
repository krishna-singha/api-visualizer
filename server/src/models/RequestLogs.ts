import mongoose from "mongoose";

const requestLogsSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  requests: [{ type: mongoose.Schema.Types.Mixed, default: {} }],
});

const RequestLogs = mongoose.model("RequestLogs", requestLogsSchema);

export default RequestLogs;
