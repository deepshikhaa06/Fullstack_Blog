const LocalStrategy=require("passport-local").Strategy;
const User=require("../model/User")
const bcrypt=require("bcryptjs")

module.exports=function (passport) {
    //*DEFINE LOCAL STRATEGY FOR EMAIL AND PASSWORD  AUTHENTICATION
    passport.use(new LocalStrategy({usernameField: 'email'}, async (email, password, done) => {
        try {
            let user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: 'Incorrect email.' });
            }
            const isMatch=await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
            
        } catch (error) {
            console.error(error);
            return done(error);
        }
    }))
    
    //*SERIALIZE USER TO SESSION
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    
    //*DESERIALIZE USER FROM SESSION
    passport.deserializeUser(async (id, done) => {
        try {
            let user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
})
}
