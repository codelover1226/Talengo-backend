require('dotenv').config();
const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer');
const path = require('path');
const twilio = require('twilio');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


exports.signup = (req, res) => {    
//   Save User to Database    
    const password = bcrypt.hashSync(req.body.password, 8);
    const email = req.body.email;    

    function generateRandomFiveDigitNumber() {
        const min = 10000; // Minimum 5-digit number
        const max = 99999; // Maximum 5-digit number
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }    
    // Generate a random 5-digit number
    const randomFiveDigitNumber = generateRandomFiveDigitNumber();
    
    const transporter = nodemailer.createTransport({
        host: 'smtp.simply.com',
        port: 587,
        auth: {
            user: 'no-reply@talengo-jobs.com',
            pass: 'HejTalengo1234'
        }
    });

    const file_path = path.resolve("./app/logo/logo.png");
    
    const mailOptions = {
        from: 'no-reply@talengo-jobs.com',
        to: email,
        subject: 'Confirm your email address',
        html: `<!DOCTYPE html>
        <html>
        
        <head>
            <title></title>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <style type="text/css">
                @media screen {
                    @font-face {
                        font-family: 'Montserrat';
                        font-style: normal;
                        font-weight: 400;
                        src: local('Montserrat'), local('Montserrat'), url(https://fonts.google.com/share?selection.family=Montserrat:ital,wght@1,200);
                    }
        
                    @font-face {
                        font-family: 'Montserrat';
                        font-style: normal;
                        font-weight: 700;
                        src: local('Montserrat Bold'), local('Montserrat-Bold'), url(https://fonts.google.com/share?selection.family=Montserrat%20Subrayada:wght@700%7CMontserrat:ital,wght@1,200);
                    }
        
                    /* CLIENT-SPECIFIC STYLES */
                    body,
                    table,
                    td,
                    a {
                        -webkit-text-size-adjust: 100%;
                        -ms-text-size-adjust: 100%;
                    }
        
                    table,
                    td {
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt;
                    }
        
                    img {
                        -ms-interpolation-mode: bicubic;
                    }
        
                    /* RESET STYLES */
                    img {
                        border: 0;
                        height: auto;
                        line-height: 100%;
                        outline: none;
                        text-decoration: none;
                    }
        
                    table {
                        border-collapse: collapse !important;
                    }
        
                    body {
                        height: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                    }
        
                    /* iOS BLUE LINKS */
                    a[x-apple-data-detectors] {
                        color: inherit !important;
                        text-decoration: none !important;
                        font-size: inherit !important;
                        font-family: inherit !important;
                        font-weight: inherit !important;
                        line-height: inherit !important;
                    }
        
                    /* MOBILE STYLES */
                    @media screen and (max-width:600px) {
                        h1 {
                            font-size: 32px !important;
                            line-height: 32px !important;
                        }
                    }
        
                    /* ANDROID CENTER FIX */
                    div[style*="margin: 16px 0;"] {
                        margin: 0 !important;
                    }
            </style>
        </head>
        
        <body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">        
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <!-- LOGO -->
                <tr>
                    <td bgcolor="#f4f4f4" align="center">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                                <td align="center" valign="top" style="padding: 40px 10px 40px 10px;"> </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                                <td bgcolor="#ffffff" align="left" valign="top"
                                    style="padding: 50px 50px 0px 50px; border-radius: 2px 2px 0px 0px; color: #F61114; font-family: 'Londrina Solid'Helvetica, Arial, sans-serif; font-size: 45px; font-weight: 700; letter-spacing: 2px; line-height: 48px;">
                                    <img src="cid:logo" alt="Talengo" />                                   
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                                <td bgcolor="#ffffff" align="center"
                                    style="padding: 0px 45px 0px 45px; color: #010A3F; font-family:'Montserrat bold' Helvetica, Arial, sans-serif; font-size: 24px; font-weight:600; line-height: 40px; text-align: left;">
                                    <p>Kindly verify your email to complete your account registration.</p>
                                </td>
                            </tr>
                            <tr>
                                <td bgcolor="#ffffff" align="center"
                                    style="text-align: left; padding: 20px 45px 40px 45px; color: #010A3F; font-family:'Montserrat bold' Helvetica, Arial, sans-serif; font-size: 16px; font-weight:400; line-height: 25px;">
                                    <p>Thanks for your interest in joining Talengo! To complete your registration, we need you to verify your email address.</p>
                                </td>
                            </tr>
                            <tr>
                                <td bgcolor="#ffffff" align="left">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                            <td bgcolor="#ffffff" align="center" style="padding: 0px;">
                                                <table border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <td align="center" bgcolor="#ffffff">
                                                            <p style="color: #010A3F; font-size: 16px; font-weight: 400; line-height: 16px; text-align: center;">Verification code</p>
                                                            <p style="color: #010A3F; font-size: 24px; font-weight:600; line-height: 24px; text-align: center;">${randomFiveDigitNumber}</p>
                                                        </td>                                                        
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr> <!-- COPY -->
                            <tr>
                                <td bgcolor="#ffffff" align="center"
                                    style="text-align: left; padding: 0px 45px 0px 45px; color: #010A3F; font-family:'Montserrat'Helvetica, Arial, sans-serif; font-size: 16px; font-weight:400; line-height: 25px;">
                                    <p style="margin: 0;">Please note that not all applications to join Talengo are accepted. We will notify you of our decision by email within 24 hours.</p>
                                </td>
                            </tr> <!-- COPY -->                        
                            <tr>
                                <td bgcolor="#ffffff" align="center"
                                    style="text-align: left; padding: 20px 45px 40px 45px; color: #010A3F; font-family:'Montserrat'Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 25px;">
                                    <p style="margin: 0;">Thanks for your time,</p>
                                    <p style="margin: 0;">The Talengo Team</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>                
            </table>
        </body>
        
        </html>`,
        attachments: [{
            filename: 'logo.png',
            path: file_path,
            cid: 'logo'
        }]
    };   
         
    transporter.sendMail(mailOptions, (error, info) => { 
        if (error) {
            console.log(error, '9999');
            res.send({message: 'Error sending verification email.', status: "verify_failed"});
        } else {  
            User.create({
                email: email,
                password: password,
                verification_code: randomFiveDigitNumber               
            })
            .then(user => {                
                res.send({ status: "success" }); 
            })
            .catch(err => {
                res.status(400).send({ message: err, status: "failed" });
            });           
        }
    });
};

exports.emailVerificationForSignup = async (req, res) => {
    const { email, code } = req.body;

    try {
        const user = await User.findOne({ where: { email: email } });

        if (!user) {
            return res.status(404).send('User not found');
        }

        if (user.verification_code !== code) {
            return res.status(400).send({ message: "Invalid verification code", status: "failed" });
        }

        const customer = await stripe.customers.create({ email: email });

        await User.update(
            {
                is_verified: true,
                stripe_customer_id: customer.id
            },
            { where: { email: email } }
        );

        // Retrieve the updated user
        const updatedUser = await User.findOne({ where: { email: email } });
        const token = jwt.sign({ id: updatedUser.id }, config.secret);

        return res.send({
            message: "User was registered successfully!",
            data: updatedUser,
            status: "success",
            accessToken: token
        });

    } catch (err) {
        console.error(err); // Log the error for debugging
        return res.status(500).send({ message: "Server Error", status: "failed" });
    }
};

exports.businessSignup = (req, res) => {
    // Save User to Database
    const secret_email_key = process.env.SECRET_EMAIL_KEY;
    const password = bcrypt.hashSync(req.body.password, 8);
    const email = req.body.email;
    const email_verify_token = jwt.sign({email: email}, config.secret); 
    const secret_email = jwt.sign({email: email}, config.secret);
    
    const transporter = nodemailer.createTransport({
        host: 'smtp.simply.com',
        port: 587,
        auth: {
            user: 'no-reply@talengo-jobs.com',
            pass: 'HejTalengo1234'
        }
    });

    const file_path = path.resolve("./app/logo/logo.png");
      
    const mailOptions = {
        from: 'no-reply@talengo-jobs.com',
        to: email,
        subject: 'Confirm your email address',
        html: `<!DOCTYPE html>
        <html>
        
        <head>
            <title></title>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <style type="text/css">
                @media screen {
                    @font-face {
                        font-family: 'Montserrat';
                        font-style: normal;
                        font-weight: 400;
                        src: local('Montserrat'), local('Montserrat'), url(https://fonts.google.com/share?selection.family=Montserrat:ital,wght@1,200);
                    }
        
                    @font-face {
                        font-family: 'Montserrat';
                        font-style: normal;
                        font-weight: 700;
                        src: local('Montserrat Bold'), local('Montserrat-Bold'), url(https://fonts.google.com/share?selection.family=Montserrat%20Subrayada:wght@700%7CMontserrat:ital,wght@1,200);
                    }
        
                    /* CLIENT-SPECIFIC STYLES */
                    body,
                    table,
                    td,
                    a {
                        -webkit-text-size-adjust: 100%;
                        -ms-text-size-adjust: 100%;
                    }
        
                    table,
                    td {
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt;
                    }
        
                    img {
                        -ms-interpolation-mode: bicubic;
                    }
        
                    /* RESET STYLES */
                    img {
                        border: 0;
                        height: auto;
                        line-height: 100%;
                        outline: none;
                        text-decoration: none;
                    }
        
                    table {
                        border-collapse: collapse !important;
                    }
        
                    body {
                        height: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                    }
        
                    /* iOS BLUE LINKS */
                    a[x-apple-data-detectors] {
                        color: inherit !important;
                        text-decoration: none !important;
                        font-size: inherit !important;
                        font-family: inherit !important;
                        font-weight: inherit !important;
                        line-height: inherit !important;
                    }
        
                    /* MOBILE STYLES */
                    @media screen and (max-width:600px) {
                        h1 {
                            font-size: 32px !important;
                            line-height: 32px !important;
                        }
                    }
        
                    /* ANDROID CENTER FIX */
                    div[style*="margin: 16px 0;"] {
                        margin: 0 !important;
                    }
            </style>
        </head>
        
        <body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">        
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <!-- LOGO -->
                <tr>
                    <td bgcolor="#f4f4f4" align="center">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                                <td align="center" valign="top" style="padding: 40px 10px 40px 10px;"> </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                                <td bgcolor="#ffffff" align="left" valign="top"
                                    style="padding: 50px 50px 0px 50px; border-radius: 2px 2px 0px 0px; color: #F61114; font-family: 'Londrina Solid'Helvetica, Arial, sans-serif; font-size: 45px; font-weight: 700; letter-spacing: 2px; line-height: 48px;">
                                    <img src="cid:logo" alt="Talengo" />                                   
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                                <td bgcolor="#ffffff" align="center"
                                    style="padding: 0px 45px 0px 45px; color: #010A3F; font-family:'Montserrat bold' Helvetica, Arial, sans-serif; font-size: 24px; font-weight:600; line-height: 40px; text-align: left;">
                                    <p>Kindly verify your email to complete your account registration.</p>
                                </td>
                            </tr>
                            <tr>
                                <td bgcolor="#ffffff" align="center"
                                    style="text-align: left; padding: 20px 45px 40px 45px; color: #010A3F; font-family:'Montserrat bold' Helvetica, Arial, sans-serif; font-size: 16px; font-weight:400; line-height: 25px;">
                                    <p>Thanks for your interest in joining Talengo! To complete your registration, we need you to verify your email address.</p>
                                </td>
                            </tr>
                            <tr>
                                <td bgcolor="#ffffff" align="left">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                            <td bgcolor="#ffffff" align="center" style="padding: 20px 30px 40px 30px;">
                                                <table border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                    <td align="center" style="border-radius: 30px;" bgcolor="#F61114">
                                                        <a href="${process.env.PRODUCTION_URL}/${email_verify_token}?${secret_email_key}=${secret_email}" target="_blank" style="font-weight: 700; font-size: 20px; font-family: 'Montserrat Bold'Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 10px 55px; border-radius: 2px; display: inline-block;">Verify now</a>
                                                    </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr> <!-- COPY -->
                            <tr>
                                <td bgcolor="#ffffff" align="center"
                                    style="text-align: left; padding: 0px 45px 0px 45px; color: #010A3F; font-family:'Montserrat'Helvetica, Arial, sans-serif; font-size: 16px; font-weight:400; line-height: 25px;">
                                    <p style="margin: 0;">Please note that not all applications to join Talengo are accepted. We will notify you of our decision by email within 24 hours.</p>
                                </td>
                            </tr> <!-- COPY -->                        
                            <tr>
                                <td bgcolor="#ffffff" align="center"
                                    style="text-align: left; padding: 20px 45px 40px 45px; color: #010A3F; font-family:'Montserrat'Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 25px;">
                                    <p style="margin: 0;">Thanks for your time,</p>
                                    <p style="margin: 0;">The Talengo Team</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                                <td bgcolor="#f4f4f4" align="center"
                                    style="padding: 0px 30px 30px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 18px;">
                                    <br>
                                    <p style="margin: ;"><a href="#" target="_blank" style="color: #111111; font-weight: 700;"
                                            </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        
        </html>`,
        attachments: [{
            filename: 'logo.png',
            path: file_path,
            cid: 'logo'
        }]
    };   
           
    transporter.sendMail(mailOptions, (error, info) => { 
        if (error) {
            console.log(error, '9999');
            res.send({message: 'Error sending verification email.', status: "verify_failed"});
        } else {
            stripe.customers.create({
                email: email                
            }).then(customer => {
                User.create({
                    email: email,
                    password: password,
                    email_verify_token: email_verify_token,
                    stripe_customer_id: customer.id
                })
                .then(user => {
                    const token = jwt.sign({ id: user.id }, config.secret);
                    res.send({ message: "User was registered successfully!", data:user, status: "success", accessToken: token }); 
                })
                .catch(err => {
                    res.status(400).send({ message: err, status: "failed" });
                });  
            }).catch(error => {
                res.status(400).send({ message: err, status: "failed" });
            });       
        }
    });
};

exports.emailVerify = (req, res) => {
    let verify_email = req.body.verify_email;
    let verify_token = req.body.verify_token; 
    let result = jwt.verify(verify_email, config.secret);
   
    User.findOne({
        where: {
            email: result.email
        }
    })
    .then(user => {
        const token = jwt.sign({ id: user.id }, config.secret);

        if(verify_token == user.email_verify_token) {
            res.status(200).send({
                email: user.email,
                status: "verified",
                accessToken: token                 
            });
        } else {
            return res.status(404).send({ message: "Invalid email!", status: "verify_failed", email: user.email});
        }   
    })
    .catch(err => {
        return res.status(404).send( {message: "Server Error"});
    });
};

exports.resendEmail = (req, res) => {
  // Save User to Database
    const secret_email_key = process.env.SECRET_EMAIL_KEY;  
    const email = req.body.email;
    const email_verify_token = jwt.sign({email: email}, config.secret); 
    const secret_email = jwt.sign({email: email}, config.secret);   

    const transporter = nodemailer.createTransport({
        host: 'smtp.simply.com',
        port: 587,
        auth: {
            user: 'no-reply@talengo-jobs.com',
            pass: 'HejTalengo1234'
        }
    });

    const file_path = path.resolve("./app/logo/logo.png"); 

    const mailOptions = {
        from: 'no-reply@talengo-jobs.com',
        to: email,
        subject: 'Confirm your email address',
        html: `<!DOCTYPE html>
        <html>
        
        <head>
            <title></title>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <style type="text/css">
                @media screen {
                    @font-face {
                        font-family: 'Montserrat';
                        font-style: normal;
                        font-weight: 400;
                        src: local('Montserrat'), local('Montserrat'), url(https://fonts.google.com/share?selection.family=Montserrat:ital,wght@1,200);
                    }
        
                    @font-face {
                        font-family: 'Montserrat';
                        font-style: normal;
                        font-weight: 700;
                        src: local('Montserrat Bold'), local('Montserrat-Bold'), url(https://fonts.google.com/share?selection.family=Montserrat%20Subrayada:wght@700%7CMontserrat:ital,wght@1,200);
                    }
        
                    /* CLIENT-SPECIFIC STYLES */
                    body,
                    table,
                    td,
                    a {
                        -webkit-text-size-adjust: 100%;
                        -ms-text-size-adjust: 100%;
                    }
        
                    table,
                    td {
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt;
                    }
        
                    img {
                        -ms-interpolation-mode: bicubic;
                    }
        
                    /* RESET STYLES */
                    img {
                        border: 0;
                        height: auto;
                        line-height: 100%;
                        outline: none;
                        text-decoration: none;
                    }
        
                    table {
                        border-collapse: collapse !important;
                    }
        
                    body {
                        height: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                    }
        
                    /* iOS BLUE LINKS */
                    a[x-apple-data-detectors] {
                        color: inherit !important;
                        text-decoration: none !important;
                        font-size: inherit !important;
                        font-family: inherit !important;
                        font-weight: inherit !important;
                        line-height: inherit !important;
                    }
        
                    /* MOBILE STYLES */
                    @media screen and (max-width:600px) {
                        h1 {
                            font-size: 32px !important;
                            line-height: 32px !important;
                        }
                    }
        
                    /* ANDROID CENTER FIX */
                    div[style*="margin: 16px 0;"] {
                        margin: 0 !important;
                    }
            </style>
        </head>
        
        <body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">
            </head> <!-- HIDDEN PREHEADER TEXT -->
            <div
                style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'Montserrat'Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
                Go anywhere with anywheel!</div>
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <!-- LOGO -->
                <tr>
                    <td bgcolor="#f4f4f4" align="center">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                                <td align="center" valign="top" style="padding: 40px 10px 40px 10px;"> </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                                <td bgcolor="#ffffff" align="left" valign="top"
                                    style="padding: 50px 20px 0px 20px; border-radius: 2px 2px 0px 0px; color: #010A3F; font-family: 'Londrina Solid'Helvetica, Arial, sans-serif; font-size: 45px; font-weight: 700; letter-spacing: 2px; line-height: 48px;">
                                    <img src="cid:logo" alt="Talengo" />
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                                <td bgcolor="#ffffff" align="center"
                                    style="padding: 0px 45px 0px 45px; color: #010A3F; font-family:'Montserrat bold' Helvetica, Arial, sans-serif; font-size: 24px; font-weight:600; line-height: 40px; text-align: left;">
                                    <p>Kindly verify your email to complete your account registration.</p>
                                </td>
                            </tr>
                            <tr>
                                <td bgcolor="#ffffff" align="center"
                                    style="text-align: left; padding: 20px 45px 40px 45px; color: #010A3F; font-family:'Montserrat bold' Helvetica, Arial, sans-serif; font-size: 16px; font-weight:400; line-height: 25px;">
                                    <p>Thanks for your interest in joining Talengo! To complete your registration, we need you to verify your email address.</p>
                                </td>
                            </tr>
                            <tr>
                                <td bgcolor="#ffffff" align="left">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                            <td bgcolor="#ffffff" align="center" style="padding: 20px 30px 40px 30px;">
                                                <table border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                    <td align="center" style="border-radius: 30px;" bgcolor="#F61114">
                                                        <a href="${process.env.PRODUCTION_URL}/signup/verify-email/${email_verify_token}?${secret_email_key}=${secret_email}" target="_blank" style="font-weight: 700; font-size: 20px; font-family: 'Montserrat Bold'Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 10px 55px; border-radius: 2px; display: inline-block;">Verify now</a>
                                                    </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr> <!-- COPY -->
                            <tr>
                                <td bgcolor="#ffffff" align="center"
                                    style="text-align: left; padding: 0px 45px 0px 45px; color: #010A3F; font-family:'Montserrat'Helvetica, Arial, sans-serif; font-size: 16px; font-weight:400; line-height: 25px;">
                                    <p style="margin: 0;">Please note that not all applications to join Talengo are accepted. We will notify you of our decision by email within 24 hours.</p>
                                </td>
                            </tr> <!-- COPY -->                        
                            <tr>
                                <td bgcolor="#ffffff" align="center"
                                    style="text-align: left; padding: 20px 45px 40px 45px; color: #010A3F; font-family:'Montserrat'Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 25px;">
                                    <p style="margin: 0;">Thanks for your time,</p>
                                    <p style="margin: 0;">The Talengo Team</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                                <td bgcolor="#f4f4f4" align="center"
                                    style="padding: 0px 30px 30px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 18px;">
                                    <br>
                                    <p style="margin: ;"><a href="#" target="_blank" style="color: #111111; font-weight: 700;"
                                            </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        
        </html>`,
        attachments: [{
            filename: 'logo.png',
            path: file_path,
            cid: 'logo'
        }]
    };
    
    transporter.sendMail(mailOptions, (error, info) => {    
        if (error) {
            console.log(error, '9999');
            res.status(500).send({message: 'Error sending verification email.', data:{resend_status: "failed"}});
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send({data:{resend_status: "success"}});      
        }
    }); 
};

exports.forgotPasswordSendEmail = (req, res) => {  
    const email = req.body.email;
    const secret_email = jwt.sign({email: email}, config.secret);   

    const transporter = nodemailer.createTransport({
        host: 'smtp.simply.com',
        port: 587,
        auth: {
            user: 'no-reply@talengo-jobs.com',
            pass: 'HejTalengo1234'
        }
    });

    const file_path = path.resolve("./app/logo/logo.png"); 

    const mailOptions = {
        from: 'no-reply@talengo-jobs.com',
        to: email,
        subject: 'Reset your password - Talengo',
        html: `<!DOCTYPE html>
        <html>
        
        <head>
            <title></title>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <style type="text/css">
                @media screen {
                    @font-face {
                        font-family: 'Montserrat';
                        font-style: normal;
                        font-weight: 400;
                        src: local('Montserrat'), local('Montserrat'), url(https://fonts.google.com/share?selection.family=Montserrat:ital,wght@1,200);
                    }
        
                    @font-face {
                        font-family: 'Montserrat';
                        font-style: normal;
                        font-weight: 700;
                        src: local('Montserrat Bold'), local('Montserrat-Bold'), url(https://fonts.google.com/share?selection.family=Montserrat%20Subrayada:wght@700%7CMontserrat:ital,wght@1,200);
                    }
        
                    /* CLIENT-SPECIFIC STYLES */
                    body,
                    table,
                    td,
                    a {
                        -webkit-text-size-adjust: 100%;
                        -ms-text-size-adjust: 100%;
                    }
        
                    table,
                    td {
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt;
                    }
        
                    img {
                        -ms-interpolation-mode: bicubic;
                    }
        
                    /* RESET STYLES */
                    img {
                        border: 0;
                        height: auto;
                        line-height: 100%;
                        outline: none;
                        text-decoration: none;
                    }
        
                    table {
                        border-collapse: collapse !important;
                    }
        
                    body {
                        height: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                    }
        
                    /* iOS BLUE LINKS */
                    a[x-apple-data-detectors] {
                        color: inherit !important;
                        text-decoration: none !important;
                        font-size: inherit !important;
                        font-family: inherit !important;
                        font-weight: inherit !important;
                        line-height: inherit !important;
                    }
        
                    /* MOBILE STYLES */
                    @media screen and (max-width:600px) {
                        h1 {
                            font-size: 32px !important;
                            line-height: 32px !important;
                        }
                    }
        
                    /* ANDROID CENTER FIX */
                    div[style*="margin: 16px 0;"] {
                        margin: 0 !important;
                    }
            </style>
        </head>
        
        <body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;"> 
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <!-- LOGO -->
                <tr>
                    <td bgcolor="#f4f4f4" align="center">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                                <td align="center" valign="top" style="padding: 40px 10px 40px 10px;"> </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                                <td bgcolor="#ffffff" align="left" valign="top"
                                    style="padding: 50px 20px 0px 20px; border-radius: 2px 2px 0px 0px; color: #010A3F; font-family: 'Londrina Solid'Helvetica, Arial, sans-serif; font-size: 45px; font-weight: 700; letter-spacing: 2px; line-height: 48px;">
                                    <img src="cid:logo" alt="Talengo" />
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                                <td bgcolor="#ffffff" align="center"
                                    style="padding: 0px 45px 0px 45px; color: #010A3F; font-family:'Montserrat bold' Helvetica, Arial, sans-serif; font-size: 24px; font-weight:600; line-height: 40px; text-align: left;">
                                    <p>Update your password</p>
                                </td>
                            </tr>
                            <tr>
                                <td bgcolor="#ffffff" align="center"
                                    style="text-align: left; padding: 0px 45px 0px 45px; color: #010A3F; font-family:'Montserrat bold' Helvetica, Arial, sans-serif; font-size: 16px; font-weight:400; line-height: 25px;">
                                    <p>Hi,</p>
                                </td>
                            </tr>
                            <tr>
                                <td bgcolor="#ffffff" align="center"
                                    style="text-align: left; padding: 0px 45px 0px 45px; color: #010A3F; font-family:'Montserrat bold' Helvetica, Arial, sans-serif; font-size: 16px; font-weight:400; line-height: 25px;">
                                    <p>We received a request that you want to update your password. You can do this by selecting the button below. You will be asked to verify your identity, and then you can update your password.</p>
                                </td>
                            </tr>
                            <tr>
                                <td bgcolor="#ffffff" align="center"
                                    style="text-align: left; padding: 0px 45px 0px 45px; color: #010A3F; font-family:'Montserrat bold' Helvetica, Arial, sans-serif; font-size: 16px; font-weight:400; line-height: 25px;">
                                    <p>This request expires in 24 hours.</p>
                                </td>
                            </tr>
                            <tr>
                                <td bgcolor="#ffffff" align="left">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                            <td bgcolor="#ffffff" align="center" style="padding: 20px 30px 40px 30px;">
                                                <table border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                    <td align="center" style="border-radius: 30px;" bgcolor="#F61114">
                                                        <a href="${process.env.PRODUCTION_URL}/login/reset-password/${secret_email}" target="_blank" style="font-weight: 700; font-size: 20px; font-family: 'Montserrat Bold'Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 10px 55px; border-radius: 2px; display: inline-block;">Update Password</a>
                                                    </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr> <!-- COPY -->
                            <tr>
                                <td bgcolor="#ffffff" align="center"
                                    style="text-align: left; padding: 0px 45px 0px 45px; color: #010A3F; font-family:'Montserrat'Helvetica, Arial, sans-serif; font-size: 16px; font-weight:400; line-height: 25px;">
                                    <p style="margin: 0;">If you didn't make this request, you don't need to do anything.</p>
                                </td>
                            </tr> <!-- COPY -->                        
                            <tr>
                                <td bgcolor="#ffffff" align="center"
                                    style="text-align: left; padding: 20px 45px 40px 45px; color: #010A3F; font-family:'Montserrat'Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 25px;">
                                    <p style="margin: 0;">Thanks,</p>
                                    <p style="margin: 0;">The Talengo Team</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                                <td bgcolor="#f4f4f4" align="center"
                                    style="padding: 0px 30px 30px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 18px;">
                                    <br>
                                    <p style="margin: ;"><a href="#" target="_blank" style="color: #111111; font-weight: 700;"
                                            </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        
        </html>`,
        attachments: [{
            filename: 'logo.png',
            path: file_path,
            cid: 'logo'
        }]
    };
    
    transporter.sendMail(mailOptions, (error, info) => {    
        if (error) {        
            res.status(500).send({message: 'Error sending verification email.', resend_status: "failed"});
        } else {        
            res.status(200).send({data:{resend_status: "success"}});      
        }
    }); 
};

exports.updatePassword = (req, res) => {
    let {token, password} = req.body;
    let decoded_email = jwt.verify(token, config.secret);
    let reset_password = bcrypt.hashSync(password, 8);

    User.update({
        password: reset_password
    }, {
        where: {
          email: decoded_email.email
        }
    })
    .then(user => { 
      res.status(200).send({
        status: "update_success"       
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.login = (req, res) => {    
    User.findOne({
        where: {
            email: req.body.email
        }
    })
    .then(user => {
        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }    
        
        if(user.password == null) {
            return res.status(401).send({
                accessToken: null,
                message: "Invalid Password!"
            });
        } else {
            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );
    
            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                });
            }
        }        

        const token = jwt.sign({ id: user.id }, config.secret);
        res.status(200).send({       
            email: user.email,      
            accessToken: token,
            status: "success"       
        });
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

exports.fetchB2BUser = (req, res) => {
    const token = req.headers["x-access-token"];
    const user_id = jwt.verify(token, config.secret).id;

    User.findOne({
        where: {
            id: user_id
        }
    })
    .then(user => {
        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }    

        res.send({status: "success", email: user.email})
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

exports.googleLogin = (req, res) => {
    
    User.findOne({
        where: {
            email: req.body.email
        }
    })
    .then(user => {
        if (!user) {
            User.create({
                email: req.body.email
            })
            .then(response => {
                const token = jwt.sign({ id: response.id }, config.secret); 
        
                res.status(200).send({       
                    email: response.email,      
                    accessToken: token,
                    status: "success"       
                });
            })
        }
        if(user) {
            const token = jwt.sign({ id: user.id }, config.secret); 
    
            res.status(200).send({       
                email: user.email,      
                accessToken: token,
                status: "success"       
            });
        }
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
}

exports.signout = (req, res) => {
    res.status(200).send(
        "logout"
    )
};

exports.getInfo = ( req, res) => {
    User.findOne({
        where: {
        email: req.body.email
        }
    })
    .then(user => {
        if (!user) {
        return res.status(404).send({ message: "User Not found." });
        }
        res.status(200).send({      
            email: user.email,     
        });
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });           
}

exports.sendSMSVerificationCodeForSignup = (req, res) => {
    const phoneNumber = req.body.phoneNumber;
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    User.findOne({
        where: {
            phone_number: phoneNumber
        }
    })
    .then(user => {
        if (user) {
            return res.send({ message: "Failed! Phone number is already in use!", status: 401 });
        };

        client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications
        .create({
            to: phoneNumber,
            channel: 'sms',
            messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID
        }).then((data) => {
            if (data.status == "pending") {
                res.send({ message: "success", status: 200});
            }
        })
        .catch(err => {
            res.send({ status: "failed", status: 500 });
        });
    })    
}

exports.sendSMSVerificationCodeForLogin = (req, res) => {
    const phoneNumber = req.body.phoneNumber;
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    User.findOne({
        where: {
            phone_number: phoneNumber
        }
    })
    .then(user => {
        if (!user) {
            return res.send({ message: "User Not found.", status: 404 });
        };

        client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications
        .create({
            to: phoneNumber,
            channel: 'sms',
            messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID
        }).then((data) => {
            if (data.status == "pending") {
                res.send({ message: "success", status: 200});
            }
        })
        .catch(err => {
            res.send({ status: "failed", status: 500 });
        });
    })    
}

exports.checkSMSVerificationCode = (req, res) => {
    const phoneNumber = req.body.phoneNumber;
    const code = req.body.code;
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks
        .create({
            to: phoneNumber,
            code: code
        })
        .then((data) => {
            if (data.status == "approved") {
                //here generate the token and save it into the DB
                //and then send the token into the frontend
                User.findOne({
                    where: {
                        phone_number: phoneNumber
                    }
                })
                .then(has_user => {
                    if (!has_user) {
                        User.create({
                            phone_number: phoneNumber
                        })
                        .then(user => {
                            const token = jwt.sign({ id: user.id }, config.secret);
                            res.send({ message: "User was registered successfully!", data:user, status: 200, accessToken: token });
                        })
                        .catch(err => {
                            res.send({ message: err, status: 500 });
                        });
                    } else {
                        const token = jwt.sign({ id: has_user.id }, config.secret);
                        res.send({ message: "User was logined successfully!", data:has_user, status: 200, accessToken: token });                    
                    }
                })
                .catch(err => {
                    res.send({ message: err, status: 500 });
                });                
            }
        })
        .catch(err => {
            res.send({ message: err, status: 400 });
        });
}

exports.b2bUserUpdatePassword = (req, res) => {
    const token = req.headers["x-access-token"];
    const user_id = jwt.verify(token, config.secret).id;

    let { password } = req.body;    
    let reset_password = bcrypt.hashSync(password, 8);

    User.update({
        password: reset_password
    }, {
        where: {
          id: user_id
        }
    })
    .then(user => { 
      res.send({ status: "success" });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};