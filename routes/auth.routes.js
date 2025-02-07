import { Router } from "express";
import { config } from "dotenv";
import crypto from "crypto";
import axios from "axios";
import decodeJwtPayload from "../utils/decode.utils.js";
import User from "../models/users.models.js";
import { access } from "fs";

config();

const router = Router();

const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]



router.get("/login", (req, res) => {
    // Generate a secure random state value.
    const state = crypto.randomBytes(32).toString('hex');
    // Store state in the session
    req.session.state = state;
    // Redirect to Google's OAuth 2.0 server
    let authorizeUrl = `https://accounts.google.com/o/oauth2/v2/auth?scope=${scopes[0]} ${scopes[1]}&access_type=offline&include_granted_scopes=true&response_type=code&state=${state}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&client_id=${process.env.GOOGLE_CLIENT_ID}`;
    res.redirect(authorizeUrl);
})


router.get("/google/callback", async (req, res) => {
    let q = req.query;

    if (q.error) {
        return res.status(400).json({ error: q.error });
    } else if (q.state !== req.session.state) {
        return res.status(401).json({ error: "State mismatch" });
    } else {
        let data = {
            code: q.code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: "authorization_code"
        }
        let response = await axios.post("https://oauth2.googleapis.com/token", data);

        let id_token = response.data.id_token;
        let user = decodeJwtPayload(id_token.split(".")[1]);
        console.log(user);
        try {
            let exists = await User.findOne({ profileId: user.sub });
            if (!exists) {
                await User.create({
                    profileId: user.sub,
                    email: user.email,
                    displayName: user.name,
                    photo: user.picture,
                    accessToken: response.data.access_token,
                    refreshToken: response.data.refresh_token  
                });
            }
        } catch (error) {
            console.log(error);
        }
        req.session.user = user;
        res.redirect("http://localhost:3000/home");
    }
});


router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("http://localhost:3000");
});


export default router;