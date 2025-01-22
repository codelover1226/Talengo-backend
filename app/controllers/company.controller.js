var jwt = require("jsonwebtoken");
require('dotenv').config();
const axios = require("axios");
const fs = require("fs");
const { promisify } = require('util');
const path = require("path");
const heicConvert = require("heic-convert");
const config = require("../config/auth.config");
const db = require("../models");

//company profile table
const CompanyProfile = db.company_profile;

exports.CompanyLogoUpload = async (req, res) => {
    const token = req.headers["x-access-token"];
    const user_id = jwt.verify(token, config.secret).id;

    if (req.file != undefined) {
        const destination = req.file.destination;
        const filename = req.file.filename;
        const filePath = `${destination}${filename}`; 

        const ext = path.extname(filePath).slice(1).toLowerCase();
        let pngFilePath = filePath; // Initialize pngFilePath with the original filePath

        if(ext === 'heic') {
            const inputBuffer = await promisify(fs.readFile)(filePath); 
            const outputBuffer = await heicConvert({
                buffer: inputBuffer,
                format: 'PNG'
            });
            pngFilePath = `${destination}${filename.slice(0, -5)}.png`; // Update file path with .png extension    
            await promisify(fs.writeFile)(pngFilePath, outputBuffer);
        }  

        CompanyProfile.update(
            {
                logo_path: pngFilePath
            },
            {
                where:{
                    employerId: user_id
                }
            }
        )
        .then(data => {
            res.send({status: "success"})
        })
        .catch(err => {
            res.send({ status: "failed" });
        });
    } else {
        CompanyProfile.update(
            {
                logo_path: null
            },
            {
                where:{
                    employerId: user_id
                }
            }
        )
        .then(data => {
            res.send({status: "success"})
        })
        .catch(err => {
            res.send({ status: "failed" });
        });
    }
};

exports.CompanyProfileImageUpload = async (req, res) => {
    const token = req.headers["x-access-token"];
    const user_id = jwt.verify(token, config.secret).id;
  
    if (req.file != undefined) {
        const destination = req.file.destination;
        const filename = req.file.filename;
        const filePath = `${destination}${filename}`; 
    
        const ext = path.extname(filePath).slice(1).toLowerCase();
        let pngFilePath = filePath; // Initialize pngFilePath with the original filePath
  
        if(ext === 'heic') {
            const inputBuffer = await promisify(fs.readFile)(filePath); 
            const outputBuffer = await heicConvert({
                buffer: inputBuffer,
                format: 'PNG'
            });
            pngFilePath = `${destination}${filename.slice(0, -5)}.png`; // Update file path with .png extension    
            await promisify(fs.writeFile)(pngFilePath, outputBuffer);
        }  

        CompanyProfile.update(
            {
                profile_image_path: pngFilePath
            },
            {
                where:{
                    employerId: user_id
                }
            }
        )
        .then(data => {
            res.send({status: "success"})
        })
        .catch(err => {
            res.send({ status: "failed" });
        });  
    } else {
        CompanyProfile.update(
            {
                profile_image_path: null
            },
            {
                where:{
                    employerId: user_id
                }
            }
        )
        .then(data => {
            res.send({status: "success"})
        })
        .catch(err => {
            res.send({ status: "failed" });
        });
    }
};

exports.CompanyProfileCreate = (req, res) => {
  const token = req.headers["x-access-token"];  
  const user_id = jwt.verify(token, config.secret).id;
  
  const { cvrNumber, companyName, phoneNumber, address, postCode } = req.body;

  CompanyProfile.create({
    employerId: user_id,
    cvr_number: cvrNumber,
    company_name: companyName,
    phone_number: phoneNumber,
    address: address,
    post_code: postCode,    
  })
  .then(data => {
    res.send({status: "success"})
  })
  .catch(error => {
    res.send({status: "failed"})
  })
};

exports.companyProfileUpdate = (req, res) => {
    const token = req.headers["x-access-token"];  
    const user_id = jwt.verify(token, config.secret).id;
    
    const { cvrNumber, companyName, phoneNumber, address, postCode, publicName, description, representativeFirstName, representativeLastName, position } = req.body;  

    CompanyProfile.update(
        {
            cvr_number: cvrNumber,
            company_name: companyName,
            phone_number: phoneNumber,
            address: address,
            post_code: postCode,
            public_name: publicName,
            description: description,
            representative_first_name: representativeFirstName,
            representative_last_name: representativeLastName,
            your_position: position
        },
        {
            where:{
                employerId: user_id
            }
        }
    )
    .then(data => {
        res.send({status: "success"})
    })
    .catch(err => {
        res.send({ status: "failed" });
    });    
};

exports.getCompanyProfile = (req, res) => {
  const token = req.headers["x-access-token"];
  const user_id = jwt.verify(token, config.secret).id;  
  
  CompanyProfile.findOne({
    where: {
      employerId: user_id
    }
  })
  .then(async profile => {
    let logo, profile_image;
    if (profile.logo_path == null) {
      logo = null
    } else {
      const imagePath = profile.logo_path;
      const ext = path.extname(imagePath).slice(1).toLowerCase();
      const contentType = `image/${ext}`;     
    
      const image = fs.readFileSync(imagePath, { encoding: 'base64' });

      logo = `data:${contentType};base64,${image}`
    };

    if (profile.profile_image_path == null) {
        profile_image = null
      } else {
        const imagePath = profile.profile_image_path;
        const ext = path.extname(imagePath).slice(1).toLowerCase();
        const contentType = `image/${ext}`;     
      
        const image = fs.readFileSync(imagePath, { encoding: 'base64' });
  
        profile_image = `data:${contentType};base64,${image}`
      };

    res.send({status: "success", profile: profile, logo: logo, profile_image: profile_image});    
  })
  .catch(err => {
    res.send({ status: "failed" });
  });
};

exports.getCompany = async (req, res) => {
  const {cvrNum, companyName} = req.body;  
    
  const username = "GOBORNHOLM_CVR_I_SKYEN";
  const password = "30ff8539-077d-4de7-9928-79258799d0e6";
  const encoded = Buffer.from(username + ':' + password).toString('base64');

  if(cvrNum != undefined) {
    const config = {
      method: 'post',
      url: 'http://distribution.virk.dk/cvr-permanent/_search',    
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin' : "http://localhost:3000",
        'Authorization': 'Basic ' + encoded
      },
      data: {      
        query: {
            match_phrase_prefix : {
              "Vrvirksomhed.cvrNummer" : cvrNum,                             
          }
        },
        size: 30
      }
    }

    await axios(config)
    .then(function (response) {
      const searchResults = response.data.hits.hits;    
      res.send({searchResults, status: "success"});
    })
    .catch(function (error) {
      console.error(error);
      res.send({error, status: "failed"});
    });
  }
  
  if(companyName != undefined) {
    const config = {
      method: 'post',
      url: 'http://distribution.virk.dk/cvr-permanent/_search',    
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin' : "http://localhost:3000",
        'Authorization': 'Basic ' + encoded
      },
      data: {
        query: {
            match_phrase_prefix : {                
              "Vrvirksomhed.virksomhedMetadata.nyesteNavn.navn": companyName   
          }
        },
        size: 30
      }
    }

    await axios(config)
    .then(function (response) {
      const searchResults = response.data.hits.hits;    
      res.send({searchResults, status: "success"});
    })
    .catch(function (error) {
      console.error(error);
      res.send({error, status: "failed"});
    });
  }  
};