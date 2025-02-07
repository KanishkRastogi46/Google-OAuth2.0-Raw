import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    profileId: String,
    email: String,
    displayName: String,
    photo: String,
    accessToken: String,
    refreshToken: String,
});

const User = mongoose.models.users || mongoose.model("User", userSchema);
export default User;