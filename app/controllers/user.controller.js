require('dotenv').config();
const fs = require("fs");
const path = require("path");
const db = require("../models");

// init table
const Field = db.field;
const Role = db.role;
const SoftSkill = db.softskill;
const HardSkill = db.hardskill;

exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
};

exports.test = (req, res) => {
  console.log("testing!!!!!!")
};

exports.getField = (req, res) => {
  Field.findAll({

  }).then(all_fields => {    
    let fields = all_fields.map(item => {
      const imagePath = item.imagePath;
      ext = path.extname(imagePath).slice(1).toLowerCase();
      const contentType = `image/${ext}`;

      const image = fs.readFileSync(imagePath, { encoding: 'base64' });

      let data = {
        id: item.id,
        field: item.field,
        image: `data:${contentType};base64,${image}`
      }
      return data
    })
    res.status(200).send({fields})
  })
  .catch(err => {
    res.status(500).send({ message: err.message });
  });  
}

exports.getRole = (req, res) => {  
  Role.findAll({

  }).then(all_roles => {    
    let roles = all_roles.map(item => {
      const imagePath = item.imagePath;
      ext = path.extname(imagePath).slice(1).toLowerCase();
      const contentType = `image/${ext}`;

      const image = fs.readFileSync(imagePath, { encoding: 'base64' });

      let data = {
        id: item.id,
        role: item.role,
        fieldId: item.fieldId,
        image: `data:${contentType};base64,${image}`
      }
      return data
    })
    res.status(200).send({roles})
  })
  .catch(err => {
    res.status(500).send({ message: err.message });
  });  
};

exports.getSkill = (req, res) => {  
  SoftSkill.findAll({
    
  }).then(softskills => {  
    HardSkill.findAll({
    
    }).then(hardskills => {      
      res.send({softskills: softskills, hardskills: hardskills, status: "success"})
    })
    .catch(err => {
      res.send({ message: err.message, status: "failed" });
    });
  })
  .catch(err => {
    res.send({ message: err.message, status: "failed" });
  });  
};

exports.getSoftSkill = (req, res) => {  
  SoftSkill.findAll({
    
  }).then(softskills => {   
    res.send({softskills: softskills, status: "success"})
  })
  .catch(err => {
    res.send({ message: err.message, status: "failed" });
  });  
};

exports.getHardSkill = (req, res) => {
  HardSkill.findAll({
    
  }).then(hardskills => {      
    res.send({hardskills: hardskills, status: "success"})
  })
  .catch(err => {
    res.send({ message: err.message, status: "failed" });
  });  
};