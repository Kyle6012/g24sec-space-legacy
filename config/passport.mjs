import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GithubStrategy } from 'passport-github2';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.mjs';
import { Op } from 'sequelize';

dotenv.config();

const passportConfig = (passport) => {
    // Google Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID, 
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ where: { googleId: profile.id } });
            if (!user) {
                user = await User.create({
                    username: profile.displayName,
                    googleId: profile.id,
                    email: profile.emails[0].value,
                });
            }
            console.log(profile);
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    // GitHub Strategy
    passport.use(new GithubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}/auth/github/callback`,
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ where: { githubId: profile.id } });
            if (!user) {
                user = await User.create({
                    username: profile.username,
                    githubId: profile.id,
                    email: profile.emails[0].value,
                });
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    // Serialize and deserialize user
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findByPk(id);
            if (!user) {
                return done(new Error("User not found"));
            }
            done(null, user);
        } catch (error) {
            done(error);
        }
    }); 
};

export default passportConfig;
