import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import path from "path"
import jwt from "jsonwebtoken"
import * as crypto from "crypto"
import bcrypt from "bcrypt"
import "dotenv/config.js"
import flash from 'connect-flash'
import cookieParser from "cookie-parser";
import session from "express-session";
import {validationResult,checkSchema} from 'express-validator'

import sendMail from './emailConfig.js'
import loginForm from './template/loginForm.js'
import registerForm from "./template/registerForm.js";
import forgotPassword from "./template/forgotPassword.js";
import userModel from "./model/userModel.js";
import tokenModel from "./model/tokenModel.js";
import resetPassword from "./template/resetPassword.js";

const app = express()

const port = process.env.PORT || 3551
const mongoUrl = process.env.MONGOURL || 'mongodb://127.0.0.1:27017/user'
const saltRounds = 10;
app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));
app.use(flash())
const __dirname = path.resolve()


mongoconnect().catch(err => console.log(`mongo error : ${err}`))

async function mongoconnect() {
    await mongoose.connect(mongoUrl)

}

mongoose.connection.on('connected', () => console.log('server connected'))


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const loginValidateSchema = {
    email: {
        isEmail: {
            errorMessage: 'Must be a valid e-mail address',
        },
        isLength: {
            options: { max: 30 },
        },
        trim: true
    },
    password: {
        // exists: {
        //     errorMessage: "password is required"
        // },
        isLength: {
            options: { min: 4, max: 12 },
            errorMessage: 'The password must be at least 4 characters',
        },
        trim: true
    }
}

function isAuthenticate(req, res, next) {
    const token = req.cookies['token']
    if (token === null) {
        req.flash('info', 'please login')
        res.redirect('/login')
        return
    }
    jwt.verify(token, 'shhhhh', (err, user) => {
        if (err) {
            req.flash('info', 'login fail')
            res.redirect('/login')
            return
        }
        req.user = user
        next()
    })

}

app.get('/procted', isAuthenticate, (req, res) => {

    res.send(`<h3> your email : ${req.user.email} </h3>`)
})

app.get('/register', (req, res) => {
    res.send(registerForm(req.flash('info')))
})

app.post('/register', checkSchema(loginValidateSchema),async (req, res) => {
    // valid email id
    // password must be 8 character long
    // first database condition : check email already exist or not
    const { password, email } = req.body
    const validationErreor = validationResult(req)
    try {
         if(!validationErreor.isEmpty()){
            const result2 = validationErreor.formatWith(error => error.msg);
            req.flash('info', result2.array())
            res.redirect('/register')
            return
         }
        if (!password && !email) {
            req.flash('info', 'provide email and password')
            res.redirect('/register')
            return
        }

        const isExist = await userModel.findOne({ email: req.body.email }).exec()

        if (isExist) {
            req.flash('info', 'email already exist')
            res.redirect('/register')
            return
        } else {
            const hashPAssword = await bcrypt.hash(password, saltRounds)
            const newUser = new userModel({
                email: email,
                password: hashPAssword
            })
            await newUser.save()
            // let generateToken = crypto.randomBytes(64).toString('hex')
            // await new tokenModel({
            //     _id: newUser._id,
            //     token: generateToken
            // }).save()
            // const link = `${req.protocol}://${req.get('host')}/verifyemail?token=${generateToken}&id=${newUser._id}`
            // var mailOption = {
            //     to: newUser.email,
            //     subject: "verify email",
            //     html: `<p>verify email link : <a href=${link}> ${link} </a> </p>`
            // }
            // const mail = await sendMail(mailOption)
            // console.log('mail'.mail)
            req.flash('info', 'registered successfully')
            res.redirect('/login')
        }
    } catch (err) {
        req.flash('info', `register error ${err}`)
        res.redirect('/register')
    }
})

app.get('/verifyemail', (req, res) => {
    const { token, id } = req.query
    res.send(`<!doctype html>
   <html lang="en">
      <head>
         <meta charset="utf-8">
      </head>   
   <body>
   
   <h2>HTML Forms</h2>
   
   <form action="/verifyemail?token=${token}&id=${id}" method="post">
     <input type="submit" value="verify">
   </form> 
   
   </body>
   </html>`)
})

app.post('/verifyemail', async (req, res) => {
    const { token, id } = req.query
    try {
        if (!token) {
            return res.json({ message: "url is not valid" })
        }
        const verifyEmail = await tokenModel.findOne({ _id: id, token }).lean()
        if (!verifyEmail) {
            return res.status(401).json({ message: "expire link" })
        }
        await userModel.findByIdAndUpdate({ _id: id }, { $set: { isVerified: true } }).exec();
        await tokenModel.deleteOne({ user_id: id })
        res.json({ message: 'verify user successfully' })
    } catch (err) {
        res.json({ message: `verify error : ${err}` })
    }
})

app.get('/login', (req, res) => {

    res.send(loginForm(req.flash('info')))
})

app.post('/login', async (req, res) => {
    const { password, email } = req.body
    try {
        if(!password && !email){
            req.flash('info', 'enter email and password ')
            res.redirect('/login')
            return;
        }
        const isExistUser = await userModel.findOne({ email:email }).exec()
        if (!isExistUser) {
            req.flash('info', 'email and password not match')
            res.redirect('/login')
            return;
        } else {
            const isPasswordMatch = await bcrypt.compare(password, isExistUser.password)
            if (!isPasswordMatch) {
                req.flash('info', 'email and password not match')
                res.redirect('/login')
                return;
            }
            const accessToken = jwt.sign({ email: isExistUser.email }, 'shhhhh')
            res.cookie('token', accessToken)
            res.redirect('/procted')
        }
    } catch (err) {
        req.flash('info', `login error ${err}`)
        res.redirect('/login')
    }
})

app.get('/logout', (req, res) => {
    res.clearCookie('token')
    res.send(`<h3>you are log out<h3>`)
})

app.get('/resendverifylink', (req, res) => {
    res.send(`<!doctype html>
   <html lang="en">
      <head>
         <meta charset="utf-8">
      </head>   
   <body>
   
   <h2>HTML Forms</h2>
   
   <form action="/resendverifylink" method="post">
     <input type="email"  name="email">
     <input type="submit" value="resend">
   </form> 
   
   </body>
   </html>`)
})

app.post('/resendverifylink', async (req, res) => {
    const { email } = req.body
    try {
        const existUser = await userModel.findOne({ email: req.body.email }).exec()
        if (!existUser) {
            return res.json({ message: `user not exist` })
        }
        let generateToken = crypto.randomBytes(64).toString('hex')
        await new tokenModel({
            _id: existUser._id,
            token: generateToken
        }).save()
        const link = `${req.protocol}://${req.get('host')}/verifyemail?token=${generateToken}&id=${existUser._id}`
        var mailOption = {
            to: existUser.email,
            subject: "verify email",
            html: `<p>verify email link : <a href=${link}> ${link} </a> </p>`
        }
        const mail = await sendMail(mailOption)
        console.log('mail'.mail)
    } catch (err) {
        res.json({ message: `error ${err}` })
    }
})

app.get('/forgetpassword', (req, res) => {
    res.send(forgotPassword(req.flash('info')))
})

app.post('/forgetpassword', async (req, res) => {
    const { email } = req.body
    try {
        if (!email) {
            req.flash('info', 'provide valid email')
            res.redirect('/forgetpassword')
            return
        } else {
            const user = await userModel.findOne({ email }).exec()
            if (!user) {
                req.flash('info', 'User not found')
                res.redirect('/forgetpassword')
                return
            }
            let token = await tokenModel.findOne({ _id: user._id }).exec()
            if (token) {
                await tokenModel.deleteOne({ _id: user_id })
            }
            let generateToken = crypto.randomBytes(64).toString('hex')
            await new tokenModel({
                _id: user._id,
                token: generateToken
            }).save()
            const link = `${req.protocol}://${req.get('host')}/password-reset?token=${generateToken}&id=${user._id}`
            var mailOption = {
                to: user.email,
                subject: "reset password",
                html: `<p>reset password link : <a href=${link}> ${link} </a> </p>`
            }
            var mail = await sendMail(mailOption)

            res.redirect('/forgetpassword/info')
        }
    } catch (err) {
        req.flash('info', `forgot password error ${err}`)
        res.redirect('/forgetpassword')
    }
})

app.get('/password-reset', (req, res) => {
    const { token, id } = req.query
    res.send(resetPassword(token, id, req.flash('info')))
})

app.post('/password-reset', async (req, res) => {
    const { token, id } = req.query
    const { password } = req.body
    try {
        if (!password) {
            req.flash('info', 'password not provide')
            res.redirect('/password-reset')
            return
        }
        const passwordResetToken = await tokenModel.findOne({ _id: id, token }).lean()
        if (!passwordResetToken) {
            req.flash('info', 'expire link')
            res.redirect('/password-reset')
            return
        }
        const hashPAssword = await bcrypt.hash(password, saltRounds)
        await userModel.findByIdAndUpdate({ _id: id }, { $set: { password: hashPAssword } }).exec();
        await tokenModel.deleteOne({ user_id: id })
        res.redirect('/login')
    } catch (err) {
        req.flash('info', `password reset error : ${err}`)
        res.redirect('/password-reset')
    }

})

app.get('/forgetpassword/info', (req, res) => {
    res.send(`<h3>check your email</h3>`)
})

app.listen(port, console.log(`server start at port ${port}`))