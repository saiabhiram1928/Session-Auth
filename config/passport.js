const LocalStrategy = require('passport-local').Strategy
const { verifyPasswd } = require('../lib/passwordUtils')
const User = require('../models/user')

const customFeilds = {
    usernameField : 'email' ,
    passwordField : "password",
} 

const verifyCallback =(username , password , done) => {
    User.findOne({email : username}).then((user) => {
        const verify = verifyPasswd(password , user.password , user.salt)
        if(!user){
           return done(null ,false , {message: "user Doesn't exist"})
        }else if(user && !verify){ return done(null ,false , {message: "passwd doesnt match"})}
        return done(null , user)
    }).catch((err)=> {
   
        return done(err , false)
    })
}
module.exports =(passport)=>{
    passport.use(new LocalStrategy(customFeilds, verifyCallback)),

    passport.serializeUser((user , done ) => {
        done(null, user.id)
    }),
    passport.deserializeUser((id , done) =>{
        User.findById(id).then((user) =>{
            done(null , user)
        }).catch((err) => {
            done(err,false)
        })
    })
}
