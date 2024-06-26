import mongoose, { Schema, Document } from 'mongoose';


export interface ISong {
    title: string;
    url?: string;
    status: string;
    server: string;
    requester: string;
    skipVotes?: string[];
}

const songSchema = new Schema<ISong>({
    title: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        enum: ["queued", "playing", "played"],
        default: "playing",
    },
    server: {
        type: String,
        required: true,
    },
    requester: {
        type: String,
        required: true,
    },
    skipVotes: {
        type: Array,
        default: [],
    },
}, { timestamps: true });

// module.exports = mongoose.model("Song", songSchema);
export default mongoose.model<ISong>('Song', songSchema);
