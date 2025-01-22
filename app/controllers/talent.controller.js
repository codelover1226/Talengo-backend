var jwt = require("jsonwebtoken");
require('dotenv').config();
const axios = require("axios");
const fs = require("fs");
const { promisify } = require('util');
const path = require("path");
const FormData = require("form-data");
const nodemailer = require('nodemailer');
const heicConvert = require("heic-convert");
const { Op, where } = require('sequelize');
const config = require("../config/auth.config");
const db = require("../models");
const twilio = require('twilio');

const Pusher = require("pusher");
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

// init table
const Field = db.field;
const Role = db.role;
const SoftSkill = db.softskill;
const HardSkill = db.hardskill;

//talent profile table
const TalentProfile = db.talent_profile;
const TalentProfileEducation = db.talent_profile_education;
const TalentProfileExperience = db.talent_profile_experience;
const TalentProfileField = db.talent_profile_field;
const TalentProfileRole = db.talent_profile_role;
const TalentProfileSoftSkill = db.talent_profile_softskill;
const TalentProfileHardSkill = db.talent_profile_hardskill;
const TalentProfileWorkType = db.talent_profile_worktype;
const TalentProfileLanguage = db.talent_profile_language;
const TalentProfilePhoto = db.talent_profile_photo;
const TalentProfileRecommendation = db.talent_profile_recommendation;
const TalentProfileSeekingJobIn = db.talent_profile_seeking_job_in;

//talent personalization table
const TalentPersonalization = db.talent_personalization;
const TalentPersonalizationJobInterest = db.talent_personalization_job_interest;
const TalentPersonalizationOccupation = db.talent_personalization_occupation;
const TalentPersonalizationEducation = db.talent_personalization_education;
const TalentPersonalizationLanguage = db.talent_personalization_language;
const TalentPersonalizationExperience = db.talent_personalization_experience;
const TalentPersonalizationSkill = db.talent_personalization_skill;

exports.resumeUpload = (req, res) => {  
    const Axios = axios.default;
    const destination = req.file?.destination;
    const filename = req.file?.filename;
    const filePath = `./${destination}${filename}`; 
    
    const form = new FormData();
    form.append("providers", "hireability");
    form.append("file", fs.createReadStream(filePath));
    // form.append("fallback_providers", "");
  
    const options = {
      method: "POST",
      url: "https://api.edenai.run/v2/ocr/resume_parser",
      headers: {
        Authorization: `Bearer ${process.env.EDEN_API_KEY}`,
        "Content-Type": "multipart/form-data; boundary=" + form.getBoundary(),
      },
      data: form,
    };
  
    Axios.request(options)
      .then((response) => {      
        let data = JSON.stringify(response.data);       
        res.send({data, status: "success"});
      })
      .catch((error) => {
        res.send({error, status: "failed"})
      });  
};

exports.talentAvatarUpload = async (req, res) => {
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

        TalentPersonalization.findOne({
            where: {
                employeeId: user_id
            }
        })
        .then(talent => {
            if(!talent) {
                TalentPersonalization.create({
                employeeId: user_id,
                avatar_path: pngFilePath
                })
                .then(data => {
                res.send({status: "success"})
                })     
            } else {
                TalentPersonalization.update(
                {
                    avatar_path: pngFilePath
                },
                {
                    where:{
                    employeeId: user_id
                    }
                }
                )
                .then(data => {
                res.send({status: "success"})
                })     
            }
        })
        .catch(err => {
            res.send({ status: "failed" });
        });  
    } else {
        TalentPersonalization.findOne({
            where: {
                employeeId: user_id
            }
        })
        .then(talent => {
            if(!talent) {
                TalentPersonalization.create({
                    employeeId: user_id,
                    avatar_path: null
                })
                .then(data => {
                    res.send({status: "success"})
                })     
            } else {
                TalentPersonalization.update(
                    {
                        avatar_path: null
                    },
                    {
                        where:{
                        employeeId: user_id
                        }
                    }
                )
                .then(data => {
                    res.send({status: "success"})
                })     
            }
        })
        .catch(err => {
            res.send({ status: "failed" });
        });
    }
};

exports.talentPhotosUpload = (req, res) => {
    const token = req.headers["x-access-token"];
    const user_id = jwt.verify(token, config.secret).id;
    
    if (req.files.length > 0) { 
      TalentProfile.findOne({
        where: {
          employeeId: user_id
        }
      })
      .then(talent_profile => {
        TalentProfilePhoto.findAll({
          where: {
            talentProfileId: talent_profile.id
          }
        })
        .then(photos => {
          if (photos.length === 0) {
            req.files.map(async file => {
              const destination = file.destination;
              const filename = file.filename;
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
              };
  
              TalentProfilePhoto.create({
                photo_path: pngFilePath,
                talentProfileId: talent_profile.id
              })            
            });          
            res.send({status: "success"});        
          } else {
            TalentProfilePhoto.destroy({            
              where: {
                talentProfileId: talent_profile.id
              }
            })
            .then(status => {
              req.files.map(async file => {
                const destination = file.destination;
                const filename = file.filename;
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
                };
    
                TalentProfilePhoto.create({
                  photo_path: pngFilePath,
                  talentProfileId: talent_profile.id
                })              
              });            
              res.send({status: "success"});            
            })
            .catch(err => {
              res.send({ status: "failed" });
            });
          }
        })
        .catch(err => {
          res.send({ status: "failed" });
        });     
      }) 
      .catch(err => {
        res.send({ status: "failed" });
      });
    }
};

exports.getTalentPhotos = (req, res) => {
  const token = req.headers["x-access-token"];
  const user_id = jwt.verify(token, config.secret).id;  
  
  TalentProfile.findOne({
    where: {
      employeeId: user_id
    }
  })
  .then(async profile => {
    TalentProfilePhoto.findAll({
      where: {
        talentProfileId: profile.id
      }
    })
    .then(galleries => {
      if (galleries?.length == 0) {
        res.send({status: "success", gallery: []});
      } else {
        let gallery_temp = galleries?.map(gallery => {
          const imagePath = gallery.photo_path;
          const ext = path.extname(imagePath).slice(1).toLowerCase();
          const contentType = `image/${ext}`;
          const image = fs.readFileSync(imagePath, { encoding: 'base64' });

          return `data:${contentType};base64,${image}`;
        });

        res.send({status: "success", gallery: gallery_temp});
      }
    })
  })
  .catch(err => {
    res.send({ status: "failed" });
  });
};

exports.talentProfileCreate = (req, res) => {
  const token = req.headers["x-access-token"];
  var user_id = jwt.verify(token, config.secret).id;
  
  const {accommodation, phoneNumber, languages, name, country, city, seekingJobIn, fields, roles, whenStartJob, experiences, softskills, 
    hardskills, workTypes, educationLevel, educations, description
  } = req.body;

  const talentProfileFields = {};

  if (phoneNumber) {
    talentProfileFields.phone_number = phoneNumber
  };

  talentProfileFields.first_name = name?.firstName;
  talentProfileFields.middle_name = name?.middleName;
  talentProfileFields.last_name = name?.lastName;

  if (country) {
    talentProfileFields.country = country
  };
  if (city) {
    talentProfileFields.city = city
  };
  if (description) {
    talentProfileFields.description = description
  };
  if (whenStartJob) {
    talentProfileFields.when_start_job = whenStartJob
  };
  if (educationLevel) {
    talentProfileFields.education_level = educationLevel
  };
  if (user_id) {
    talentProfileFields.employeeId = user_id
  };
  if (accommodation) {
    talentProfileFields.accommodation = accommodation
  };

  TalentProfile.findOne({
    where: {
      employeeId: user_id
    }
  })
  .then(talent => {    
    if(!talent) {
      TalentProfile.create(
        talentProfileFields
      )
      .then(async profile => {        
        const talentProfileId = profile.id;
        talentProfileOther(talentProfileId, fields, roles, softskills, hardskills, workTypes, seekingJobIn, experiences, educations, languages);
      })
    } else {
      TalentProfile.update(
        talentProfileFields,
        {where: {employeeId: user_id}}
      )
      .then(data => {
        const talentProfileId = talent.id;
        talentProfileOther(talentProfileId, fields, roles, softskills, hardskills, workTypes, seekingJobIn, experiences, educations, languages);
      })
    };
    res.send({status: "success"});
  })
  .catch(err => {
    res.send({ status: "failed" });
  });  
};

function talentProfileOther(talentProfileId, fields, roles, softskills, hardskills, workTypes, seekingJobIn, experiences, educations, languages) {  
  
  if(fields) {
    TalentProfileField.findAll({
      where: {
        talentProfileId: talentProfileId
      }
    })
    .then(talentProfileField => {
      if (talentProfileField.length === 0) {
        fields?.map(item => {            
          TalentProfileField.create({
            field: item?.value,
            talentProfileId: talentProfileId
          });
        });
      } else {
        TalentProfileField.destroy({
          where: {
            talentProfileId: talentProfileId
          }
        })
        .then(() => {
          return TalentProfileField.findOne({
            order: [['id', 'DESC']],
            limit: 1
          });
        })
        .then(lastRecord => {
          let nextId = 1;
          if (lastRecord) {
            nextId = lastRecord.id + 1;
          }

          const newRecords = fields?.map(item => ({            
            id: nextId++,
            field: item?.value,
            talentProfileId: talentProfileId              
          }));

          return TalentProfileField.bulkCreate(newRecords);
        })
      }
    })
    .catch(err => {
      res.send({ status: "failed" });
    });
  };
  if(roles) {            
    TalentProfileRole.findAll({
      where: {
        talentProfileId: talentProfileId
      }
    })
    .then(talentProfileRole => {
      if (talentProfileRole.length === 0) {
        roles?.map(item => {            
          TalentProfileRole.create({
            role: item?.value?.roleId,
            field_id: item?.value?.fieldId,
            talentProfileId: talentProfileId
          });
        });
      } else {
        TalentProfileRole.destroy({
          where: {
            talentProfileId: talentProfileId
          }
        })
        .then(() => {
          return TalentProfileRole.findOne({
            order: [['id', 'DESC']],
            limit: 1
          });
        })
        .then(lastRecord => {
          let nextId = 1;
          if (lastRecord) {
            nextId = lastRecord.id + 1;
          }

          const newRecords = roles?.map(item => ({            
            id: nextId++,
            role: item?.value?.roleId,
            field_id: item?.value?.fieldId,
            talentProfileId: talentProfileId            
          }));

          return TalentProfileRole.bulkCreate(newRecords);
        })
      }
    })
    .catch(err => {
      res.send({ status: "failed" });
    });
  };
  if(softskills) {            
    TalentProfileSoftSkill.findAll({
      where: {
        talentProfileId: talentProfileId
      }
    })
    .then(talentProfileSoftSkill => {
      if (talentProfileSoftSkill.length === 0) {
        softskills?.map(item => {            
          TalentProfileSoftSkill.create({
            softskill: item?.softskillId,
            role_id: item?.roleId,
            talentProfileId: talentProfileId
          });
        });
      } else {
        TalentProfileSoftSkill.destroy({
          where: {
            talentProfileId: talentProfileId
          }
        })
        .then(() => {
          return TalentProfileSoftSkill.findOne({
            order: [['id', 'DESC']],
            limit: 1
          });
        })
        .then(lastRecord => {
          let nextId = 1;
          if (lastRecord) {
            nextId = lastRecord.id + 1;
          }

          const newRecords = softskills?.map(item => ({            
            id: nextId++,
            softskill: item?.softskillId,
            role_id: item?.roleId,
            talentProfileId: talentProfileId              
          }));

          return TalentProfileSoftSkill.bulkCreate(newRecords);
        })
      }
    })
    .catch(err => {
      res.send({ status: "failed" });
    });
  };
  if(hardskills) {
    TalentProfileHardSkill.findAll({
      where: {
        talentProfileId: talentProfileId
      }
    })
    .then(talentProfileHardSkill => {
      if (talentProfileHardSkill.length === 0) {
        hardskills?.map(item => {            
          TalentProfileHardSkill.create({
            hardskill: item?.hardskillId,
            role_id: item?.roleId,
            talentProfileId: talentProfileId
          });
        });
      } else {
        TalentProfileHardSkill.destroy({
          where: {
            talentProfileId: talentProfileId
          }
        })
        .then(() => {
          return TalentProfileHardSkill.findOne({
            order: [['id', 'DESC']],
            limit: 1
          });
        })
        .then(lastRecord => {
          let nextId = 1;
          if (lastRecord) {
            nextId = lastRecord.id + 1;
          }

          const newRecords = hardskills?.map(item => ({            
            id: nextId++,
            hardskill: item?.hardskillId,
            role_id: item?.roleId,
            talentProfileId: talentProfileId              
          }));

          return TalentProfileHardSkill.bulkCreate(newRecords);
        })
      }
    })
    .catch(err => {
      res.send({ status: "failed" });
    });
  };
  if(workTypes) {
    TalentProfileWorkType.findAll({
      where: {
        talentProfileId: talentProfileId
      }
    })
    .then(talentProfileWorkType => {
      if (talentProfileWorkType.length === 0) {
        workTypes?.map(item => {            
          TalentProfileWorkType.create({
            work_type: item,            
            talentProfileId: talentProfileId
          });
        });
      } else {
        TalentProfileWorkType.destroy({
          where: {
            talentProfileId: talentProfileId
          }
        })
        .then(() => {
          return TalentProfileWorkType.findOne({
            order: [['id', 'DESC']],
            limit: 1
          });
        })
        .then(lastRecord => {
          let nextId = 1;
          if (lastRecord) {
            nextId = lastRecord.id + 1;
          }

          const newRecords = workTypes?.map(item => ({            
            id: nextId++,
            work_type: item,            
            talentProfileId: talentProfileId           
          }));

          return TalentProfileWorkType.bulkCreate(newRecords);
        })
      }
    })
    .catch(err => {
      res.send({ status: "failed" });
    });
  };
  if(seekingJobIn) {
    TalentProfileSeekingJobIn.findAll({
      where: {
        talentProfileId: talentProfileId
      }
    })
    .then(talentProfileSeekingJobIn => {
      if (talentProfileSeekingJobIn.length === 0) {
        seekingJobIn?.map(item => {            
          TalentProfileSeekingJobIn.create({
            location: item,
            talentProfileId: talentProfileId
          });
        });
      } else {
        TalentProfileSeekingJobIn.destroy({
          where: {
            talentProfileId: talentProfileId
          }
        })
        .then(() => {
          return TalentProfileSeekingJobIn.findOne({
            order: [['id', 'DESC']],
            limit: 1
          });
        })
        .then(lastRecord => {
          let nextId = 1;
          if (lastRecord) {
            nextId = lastRecord.id + 1;
          }

          const newRecords = seekingJobIn?.map(item => ({            
            id: nextId++,
            location: item,
            talentProfileId: talentProfileId              
          }));

          return TalentProfileSeekingJobIn.bulkCreate(newRecords);
        })
      }
    })
    .catch(err => {
      res.send({ status: "failed" });
    });
  };
  if(experiences) {
    TalentProfileExperience.findAll({
      where: {
        talentProfileId: talentProfileId
      }
    })
    .then(talentProfileExperience => {
      if (talentProfileExperience.length === 0) {
        experiences?.map(item => {            
          TalentProfileExperience.create({
            company: item?.companyName,
            role: item?.role,
            currently_working: item?.currentlyWorking,
            country: item?.country?.label,              
            from: item?.from,
            to: item?.to,              
            talentProfileId: talentProfileId
          });
        });
      } else {
        TalentProfileExperience.destroy({
          where: {
            talentProfileId: talentProfileId
          }
        })
        .then(() => {
          return TalentProfileExperience.findOne({
            order: [['id', 'DESC']],
            limit: 1
          });
        })
        .then(lastRecord => {
          let nextId = 1;
          if (lastRecord) {
            nextId = lastRecord.id + 1;
          }

          const newRecords = experiences?.map(item => ({            
            id: nextId++,
            company: item?.companyName,
            role: item?.role,
            currently_working: item?.currentlyWorking,
            country: item?.country?.label,              
            from: item?.from,
            to: item?.to,              
            talentProfileId: talentProfileId              
          }));

          return TalentProfileExperience.bulkCreate(newRecords);
        })
      }
    })
    .catch(err => {
      res.send({ status: "failed" });
    });
  };  
  if(educations) {
    TalentProfileEducation.findAll({
      where: {
        talentProfileId: talentProfileId
      }
    })
    .then(talentProfileEducation => {
      if (talentProfileEducation.length === 0) {
        educations?.map(item => {            
          TalentProfileEducation.create({
            title: item?.title,
            country: item?.country?.label,
            institution: item?.institution,
            field_of_study: item?.fieldOfStudy?.label,
            degree: item?.degree?.label,
            from: item?.from,
            to: item?.to,
            unfinished: item?.unfinished,
            talentProfileId: talentProfileId
          });
        });
      } else {
        TalentProfileEducation.destroy({
          where: {
            talentProfileId: talentProfileId
          }
        })
        .then(() => {
          return TalentProfileEducation.findOne({
            order: [['id', 'DESC']],
            limit: 1
          });
        })
        .then(lastRecord  => {
          let nextId = 1;
          if (lastRecord) {
            nextId = lastRecord.id + 1;
          }

          const newRecords = educations?.map(item => ({
            id: nextId++,
            title: item?.title,
            country: item?.country?.label,
            institution: item?.institution,
            field_of_study: item?.fieldOfStudy?.label,
            degree: item?.degree?.label,
            from: item?.from,
            to: item?.to,
            unfinished: item?.unfinished,
            talentProfileId: talentProfileId              
          }));

          return TalentProfileEducation.bulkCreate(newRecords);
        })
      }
    })
    .catch(err => {
      res.send({ status: "failed" });
    }); 
  };
  if(languages) {
    TalentProfileLanguage.findAll({
      where: {
        talentProfileId: talentProfileId
      }
    })
    .then(talentProfileLanguage => {
      if (talentProfileLanguage.length === 0) {
        languages?.map(item => {            
          TalentProfileLanguage.create({
            language: item?.language?.label,
            language_level: item?.level?.label,
            talentProfileId: talentProfileId
          });
        });
      } else {
        TalentProfileLanguage.destroy({
          where: {
            talentProfileId: talentProfileId
          }
        })
        .then(() => {
          return TalentProfileLanguage.findOne({
            order: [['id', 'DESC']],
            limit: 1
          });
        })
        .then(lastRecord => {
          let nextId = 1;
          if (lastRecord) {
            nextId = lastRecord.id + 1;
          }

          const newRecords = languages?.map(item => ({            
            id: nextId++,
            language: item?.language?.label,
            language_level: item?.level?.label,
            talentProfileId: talentProfileId             
          }));

          return TalentProfileLanguage.bulkCreate(newRecords);
        })
      }
    })
    .catch(err => {
      res.send({ status: "failed" });
    });
  };
}

exports.getCurrentTalentProfile = async (req, res) => {  
    const token = req.headers["x-access-token"];
    const user_id = jwt.verify(token, config.secret).id;  

    try {
        const talent = await TalentPersonalization.findOne({where: {employeeId: user_id}});
        
        if (!talent) {
            return res.send({ status: "failed", message: "No employee found" });
        };    
        
        let avatar;
        if (talent.avatar_path == null) {
            avatar = null
        } else {
            let imagePath = talent.avatar_path;
            let ext = path.extname(imagePath).slice(1).toLowerCase();
            let contentType = `image/${ext}`;
            image = fs.readFileSync(imagePath, { encoding: 'base64' });
            avatar = `data:${contentType};base64,${image}`
        };

        const talent_personalization = await TalentPersonalization.findByPk(talent.id, 
            {include: 
                [
                    {model: TalentPersonalizationJobInterest, as: "talent_personalization_job_interests"}, 
                    {
                        model: TalentPersonalizationOccupation,
                        as: "talent_personalization_occupations",
                        include: [
                            {
                                model: TalentPersonalizationSkill,
                                as: "talent_personalization_skills"
                            }
                        ]
                    },
                    {model: TalentPersonalizationEducation, as: "talent_personalization_educations"},
                    {model: TalentPersonalizationExperience, as: "talent_personalization_experiences"},
                    {model: TalentPersonalizationLanguage, as: "talent_personalization_languages"}                                     
                ] 
            }
        );

        // Convert talent and related models to plain objects
        const plainTalent = talent.get({ plain: true });
        const plainPersonalization = talent_personalization.get({ plain: true });

        const processFilePath = (filePath) => {
            if (!filePath) return null;
            const ext = path.extname(filePath).slice(1).toLowerCase();
            const contentType = `application/${ext}`;
            const file = fs.readFileSync(filePath, { encoding: 'base64' });
            return `data:${contentType};base64,${file}`;
        };

        const educations = plainPersonalization.talent_personalization_educations.map(education => ({
            ...education,
            file: processFilePath(education.file_path)
        }));

        const languages = plainPersonalization.talent_personalization_languages.map(language => ({
            ...language,
            file: processFilePath(language.file_path)
        }));

        let profile = {
            basicData: plainTalent,
            avatar: avatar,
            jobInterests: talent_personalization.talent_personalization_job_interests,
            occupations: talent_personalization.talent_personalization_occupations, // Now includes skills
            educations: educations,
            experiences: talent_personalization.talent_personalization_experiences,
            languages: languages,
            skills: talent_personalization.talent_personalization_skills
        };

        res.send({status: "success", profile: profile});        
    } catch (error) {
        res.send({ message: error.message, status: "failed" });
    }
};

exports.getAllTalentsProfile = async (req, res) => {  
//   const token = req.headers["x-access-token"];
//   const user_id = jwt.verify(token, config.secret).id;  

  try {
    const talents = await TalentPersonalization.findAll();
    
    if (talents.length === 0) {
      return res.send({ status: "failed", message: "No employees found" });
    };

    let temp = await Promise.all(talents.map(async talent => {
      
        let avatar;
        if (talent.avatar_path == null) {
            avatar = null
        } else {
            let imagePath = talent.avatar_path;
            let ext = path.extname(imagePath).slice(1).toLowerCase();
            let contentType = `image/${ext}`;     
        
            image = fs.readFileSync(imagePath, { encoding: 'base64' });

            avatar = `data:${contentType};base64,${image}`
        }      

        const talent_profile = await TalentPersonalization.findByPk(talent.id, 
            {include: 
                [
                    {model: TalentPersonalizationJobInterest, as: "talent_personalization_job_interests"}, 
                    {
                        model: TalentPersonalizationOccupation,
                        as: "talent_personalization_occupations",
                        include: [
                            {
                                model: TalentPersonalizationSkill,
                                as: "talent_personalization_skills"
                            }
                        ]
                    },
                    {model: TalentPersonalizationEducation, as: "talent_personalization_educations"},
                    {model: TalentPersonalizationExperience, as: "talent_personalization_experiences"},
                    {model: TalentPersonalizationLanguage, as: "talent_personalization_languages"}                                     
                ] 
            }
        );

        // Convert talent and related models to plain objects
        const plainTalent = talent.get({ plain: true });
        const plainPersonalization = talent_profile.get({ plain: true });

        const processFilePath = (filePath) => {
            if (!filePath) return null;
            const ext = path.extname(filePath).slice(1).toLowerCase();
            const contentType = `application/${ext}`;
            const file = fs.readFileSync(filePath, { encoding: 'base64' });
            return `data:${contentType};base64,${file}`;
        };

        const educations = plainPersonalization.talent_personalization_educations.map(education => ({
            ...education,
            file: processFilePath(education.file_path)
        }));

        const languages = plainPersonalization.talent_personalization_languages.map(language => ({
            ...language,
            file: processFilePath(language.file_path)
        }));

        let data = {
            basicData: plainTalent,
            avatar: avatar,
            workTypes: talent_profile.talent_personalization_job_interests,
            occupations: talent_profile.talent_personalization_occupations,
            educations: educations,
            experiences: talent_profile.talent_personalization_experiences,
            languages: languages,
            skills: talent_profile.talent_personalization_skills
        };      
        return data;
    }));
    // const talents = [
    //   {
    //       id: 1,
    //       avatar: "/b2c/jobs/detail2.png",
    //       name: "Anna",
    //       nationality: "Argentinian",
    //       location: "La Plata, Argentina",
    //       availableDate: "Jan, 12",
    //       matchScore: 70,
    //       isApplied: true,
    //       isLiked: false,
    //       isContacted: true,
    //       screenedStatus: "completed",
    //       status: "new"
    //   },
    //   {
    //       id: 2,
    //       avatar: "/b2c/jobs/detail2.png",
    //       name: "Giuseppe",
    //       nationality: "Argentinian",
    //       location: "La Plata, Argentina",
    //       availableDate: "Jan, 12",
    //       matchScore: 65,
    //       isApplied: false,
    //       isLiked: true,
    //       isContacted: false,
    //       screenedStatus: "progress",
    //       status: "new"
    //   },
    //   {
    //       id: 3,
    //       avatar: "/b2c/jobs/detail2.png",
    //       name: "Julia",
    //       nationality: "Argentinian",
    //       location: "La Plata, Argentina",
    //       availableDate: "Jan, 12",
    //       matchScore: 50,
    //       isApplied: false,
    //       isLiked: true,
    //       isContacted: true,
    //       screenedStatus: "default",
    //       status: "new"
    //   },
    //   {
    //       id: 4,
    //       avatar: "/b2c/jobs/detail2.png",
    //       name: "Franciszek",
    //       nationality: "Argentinian",
    //       location: "La Plata, Argentina",
    //       availableDate: "Jan, 12",
    //       matchScore: 47,
    //       isApplied: true,
    //       isLiked: false,
    //       isContacted: true,
    //       screenedStatus: "default",
    //       status: "old"
    //   },
    //   {
    //       id: 5,
    //       avatar: "/b2c/jobs/detail2.png",
    //       name: "Remmy",
    //       nationality: "Argentinian",
    //       location: "La Plata, Argentina",
    //       availableDate: "Jan, 12",
    //       matchScore: 35,
    //       isApplied: false,
    //       isLiked: false,
    //       isContacted: false,
    //       screenedStatus: "default",
    //       status: "old"
    //   },
    //   {
    //       id: 6,
    //       avatar: "/b2c/jobs/detail2.png",
    //       name: "Olivia",
    //       nationality: "Argentinian",
    //       location: "La Plata, Argentina",
    //       availableDate: "Jan, 12",
    //       matchScore: 30,
    //       isApplied: false,
    //       isLiked: true,
    //       isContacted: true,
    //       screenedStatus: "default",
    //       status: "old"
    //   },
    //   {
    //       id: 7,
    //       avatar: "/b2c/jobs/detail2.png",
    //       name: "Viviana",
    //       nationality: "Argentinian",
    //       location: "La Plata, Argentina",
    //       availableDate: "Jan, 12",
    //       matchScore: 25,
    //       isApplied: true,
    //       isLiked: false,
    //       isContacted: true,
    //       screenedStatus: "default",
    //       status: "old"
    //   },
    //   {
    //       id: 8,
    //       avatar: "/b2c/jobs/detail2.png",
    //       name: "Adolf",
    //       nationality: "Argentinian",
    //       location: "La Plata, Argentina",
    //       availableDate: "Jan, 12",
    //       matchScore: 20,
    //       isApplied: false,
    //       isLiked: false,
    //       isContacted: false,
    //       screenedStatus: "default",
    //       status: "old"
    //   },
    //   {
    //       id: 9,
    //       avatar: "/b2c/jobs/detail2.png",
    //       name: "Ruth",
    //       nationality: "Argentinian",
    //       location: "La Plata, Argentina",
    //       availableDate: "Jan, 12",
    //       matchScore: 15,
    //       isApplied: false,
    //       isLiked: true,
    //       isContacted: false,
    //       screenedStatus: "default",
    //       status: "old"
    //   }
    // ]
    
    res.send({ status: "success", employees: temp });
  } catch (error) {
    res.send({ message: error.message, status: "failed" });
  }
};

exports.TalentsJobTypeFilter = (req, res) => {  
  const jobType = req.body.jobType;
  console.log(jobType, '99999');
};

exports.TalentsAvailabilityFilter = (req, res) => {
  const availability = req.body.availability;
  console.log(availability, '====')
}

exports.TalentsAllFilter = async (req, res) => {
  const {location, fields, roles, hardSkills, softSkills, workPreference, workHour} = req.body;

  try {
    const whereCondition = {};
    const includeOptions = [];

    if (location.length > 0) {
      whereCondition.city = { [Op.in]: location };
    }

    if (fields.length > 0) {
      let all_fields_flag = false;

      if (fields.some(item => item == "1")) {
        all_fields_flag = true;
      }     

      if (all_fields_flag) {
        includeOptions.push({
          model: TalentProfileField,
          as: 'talent_profile_fields',
        });
      } else {
        includeOptions.push({
          model: TalentProfileField,
          as: 'talent_profile_fields',
          where: { field: { [Op.in]: fields } }
        });
      }      
    }

    if (roles.length > 0) {
      includeOptions.push({
        model: TalentProfileRole,
        as: 'talent_profile_roles',
        where: { role: { [Op.in]: roles } }
      });
    }

    if (hardSkills.length > 0) {
      includeOptions.push({
        model: TalentProfileHardSkill,
        as: 'talent_profile_hardskills',
        where: { hardskill: { [Op.in]: hardSkills } }
      });
    }

    if (softSkills.length > 0) {
      includeOptions.push({
        model: TalentProfileSoftSkill,
        as: 'talent_profile_softskills',
        where: { softskill: { [Op.in]: softSkills } }
      });
    }

    const talents = await TalentProfile.findAll({ where: whereCondition, include: includeOptions });
    
    if (talents.length === 0) {
      return res.send({ status: "failed", message: "No employees found" });
    };

    let temp = await Promise.all(talents.map(async talent => {
      
      let avatar;
      if (talent.avatar_path == null) {
        avatar = null
      } else {
        let imagePath = talent.avatar_path;
        let ext = path.extname(imagePath).slice(1).toLowerCase();
        let contentType = `image/${ext}`;     
      
        image = fs.readFileSync(imagePath, { encoding: 'base64' });

        avatar = `data:${contentType};base64,${image}`
      }
      

      const talent_profile = await TalentProfile.findByPk(talent.id, 
        {include: 
          [
            {model: TalentProfileField, as: "talent_profile_fields"}, 
            {model: TalentProfileRole, as: "talent_profile_roles"}, 
            {model: TalentProfileSoftSkill, as: "talent_profile_softskills"},
            {model: TalentProfileHardSkill, as: "talent_profile_hardskills"},
            {model: TalentProfileLanguage, as: "talent_profile_languages"},
            {model: TalentProfileExperience, as: "talent_profile_experiences"},
            {model: TalentProfileEducation, as: "talent_profile_educations"},
            {model: TalentProfilePhoto, as: "talent_profile_photos"},
            {model: TalentProfileRecommendation, as: "talent_profile_recommendations"},
          ] 
      });

      let photos = talent_profile?.talent_profile_photos?.map(photo => {
        const imagePath = photo.photo_path;
        const ext = path.extname(imagePath).slice(1).toLowerCase();
        const contentType = `image/${ext}`;     
     
        const image = fs.readFileSync(imagePath, { encoding: 'base64' });

        return `data:${contentType};base64,${image}`;
      });    

      const fieldIds = talent_profile.talent_profile_fields.map(item => item.field);
      const fields = await Field.findAll({ where: { id: fieldIds } });

      const roleIds = talent_profile.talent_profile_roles.map(item => item.role);
      const roles = await Role.findAll({ where: { id: roleIds } });

      const hardskillIds = talent_profile.talent_profile_hardskills.map(item => item.hardskill);
      const hardSkills = await HardSkill.findAll({where: {id: hardskillIds}});

      const softSkillIds = talent_profile.talent_profile_softskills.map(item => item.softskill);
      const softSkills = await SoftSkill.findAll({where: {id: softSkillIds}});

      let data = {
        basicData: talent,
        avatar: avatar,
        photos: photos,
        fields: fields,
        roles: roles,
        softSkills: softSkills,
        hardSkills: hardSkills,
        languages: talent_profile.talent_profile_languages,
        experiences: talent_profile.talent_profile_experiences,
        educations: talent_profile.talent_profile_educations,
        recommendations: talent_profile.talent_profile_recommendations,
      };
      
      return data;
    }));

    res.send({ status: "success", employees: temp });
  } catch (error) {    
    res.send({ message: error.message, status: "failed" });
  }
};

exports.sendRecommendation = (req, res) => {
    const token = req.headers["x-access-token"];
    const user_id = jwt.verify(token, config.secret).id;

    const {name, recommendations} = req.body;

    const transporter = nodemailer.createTransport({
        host: 'smtp.simply.com',
        port: 587,
        auth: {
        user: 'no-reply@talengo-jobs.com',
        pass: 'HejTalengo1234'
        }
    });

    const logo_path = path.resolve("./app/logo/jobs-logo.png");
    const employee_name = name?.firstName + " " + name?.lastName;

    recommendations.forEach(item => {
        const email_token = jwt.sign({email: item?.representativeEmail}, config.secret); 

        const mailOptions = {
            from: 'no-reply@talengo-jobs.com',
            to: item?.representativeEmail,
            subject: `Dear ${item?.representativeName}`,
            html: `<!DOCTYPE html>
            <html>
                <head>
                    <title></title>
                    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
            
                    <style type="text/css"> 
                        @media screen and (max-width: 600px) {
                            .content {
                                width: 100% !important;
                                display: block !important;
                                padding: 10px !important;
                            }
                            .header, .body {
                                padding: 20px !important;
                            }
                        }
                    </style>              
                </head>
                <body style="font-family: 'Poppins', Arial, sans-serif; background-color: #F5F6F7;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                            <td align="center" style="padding: 20px;">
                                <table class="content" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: white; border-collapse: collapse;">
                                    <!-- Header -->
                                    <tr>
                                        <td class="header" style="padding-top: 24px; text-align: center;">
                                            <img src="cid:logo" style="width: 120px; height: 63px;"/>                                
                                        </td>
                                    </tr>
                
                                    <!-- Body -->
                                    <tr>
                                        <td class="body" style="padding-left: 48px; padding-right: 48px; padding-top: 48px; text-align: center; color: #010A3F; font-weight: 700; font-size: 32px; line-height: 1.5;">Dear ${item?.representativeName}, 👋</td>
                                    </tr>
                                    <tr>
                                        <td class="body" style="padding-left: 48px; padding-right: 48px; padding-top: 24px; text-align: center; color: #010A3F; font-size: 28px; line-height: 1.7;">
                                            Your ex-employee <span style="font-weight: 700;">${employee_name}</span> asked for your job performance recommendation. ✉️
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="body" style="padding-left: 48px; padding-right: 48px; padding-top: 32px; text-align: center; color: #010A3F; font-size: 20px; line-height: 2;">
                                            ${employee_name} is looking for a job on Talengo and your input will help him find a new job faster. 🙏
                                        </td>
                                    </tr>
                
                                    <!-- Call to action Button -->
                                    <tr>
                                        <td style="padding: 32px 48px 0px 48px; text-align: center;">
                                            <!-- CTA Button -->
                                            <table width="100%" cellspacing="0" cellpadding="0" style="margin: auto;">
                                                <tr>
                                                    <td align="center">
                                                        <a href="${process.env.PRODUCTION_URL}/recommendation/${email_token}?name=${employee_name}&id=${user_id}" target="_blank" style="display: block; background-color: #F61114; border-radius: 75px; border: none; padding: 25px 50px; font-size: 20px; font-weight: 700; color: #FFFFFF; text-decoration: none; cursor: pointer;">
                                                            Write a recommendation
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding-top: 16px; text-align: center; color: #717171; font-size: 16px;">
                                            It&apos;s easy and quick, no registration is required.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding-top: 96px; text-align: center; color: #010A3F; font-size: 20px; line-height: 2;">
                                            Want to learn more about Talengo?
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="body" style="padding-left: 48px; padding-right: 48px; padding-top: 12px; text-align: center; color: #717171; font-size: 20px; line-height: 1.6;">
                                            Learn how Talengo improves hiring process using intelligent technology tools and advancements!
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 24px 48px 0px 48px; text-align: center;">
                                            <!-- CTA Button -->
                                            <table cellspacing="0" cellpadding="0" style="margin: auto;">
                                                <tr>
                                                    <td align="center">
                                                        <a href="${process.env.PRODUCTION_URL}/about" target="_blank" style="display: block; background-color: white; padding: 17px 42px; border-radius: 75px; border: 1px solid #010A3F; color: #010A3F; text-decoration: none; font-size: 20px; font-weight: 700; cursor: pointer;">Learn more</a>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="background-color: white; padding-top: 74px; text-align: center;">
                                            <img src="cid:logo" style="width: 120px; height: 63px;"/>                                
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding-left: 48px; padding-right: 48px; padding-top: 24px; text-align: center;">
                                            <a href="${process.env.PRODUCTION_URL}" target="_blank" style="text-decoration: none; color: #010A3F; font-size: 18px; font-weight: 700;">www.talengojobs.dk</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding-left: 48px; padding-right: 48px; padding-top: 8px; text-align: center; color: #717171; font-size: 16px;">
                                            Intelligent recruitment platform for our age
                                        </td>
                                    </tr>
                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color: white; padding-top: 48px; text-align: center; color: #717171; font-size: 14px;">
                                            Talengo LLC, Adress 12, City
                                        </td>
                                    </tr>                      
                                    <tr>
                                        <td style="background-color: white; text-align: center; padding-bottom: 45px;">
                                            <a href="#" target="_blank" style="color: #717171; text-decoration: underline; font-size: 14px;">I don&apos;t want to receive any more emails like this</a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
            </html>`,
            attachments: [{
                filename: 'jobs-logo.png',
                path: logo_path,
                cid: 'logo'
            }]
        };

        transporter.sendMail(mailOptions, (error, info) => { 
            if (error) {
                console.log(error, '9999');                
            } else {
                console.log('Email sent======: ' + info);
            }
        });
    }); 
}

exports.receiveRecommendation = (req, res) => {
    const {userId, emailToken, feedback, representative, jobTitle, companyName} = req.body;

    const representativeEmail = jwt.verify(emailToken, config.secret).email;
  
    TalentPersonalization.findOne({
        where: {
            employeeId: userId
        }
    })
    .then(personalization => {    
        TalentPersonalizationExperience.update(
            {
                representative_jobtitle: jobTitle,
                representative_company: companyName,
                representative_name: representative,
                representative_feedback: feedback
            },
            {
                where: {
                    representative_email: representativeEmail,
                    talentPersonalizationId: personalization.id
                }
            }
        )
        .then(data => {
            console.log(data, 'received recommendation!!!!')
            pusher.trigger("channel", "event", {data: "updated"}, req.headers["x-access-token"]).catch(err => console.log(err))
            res.send({status: "success"});
        })
        .catch(error => {
            res.send({status: "failed"})
        })    
    })
}

exports.sendEmail = (req, res) => {
  const token = req.headers["x-access-token"];
  const user_id = jwt.verify(token, config.secret).id;
  const {name, email} = req.body;
  const secret = jwt.sign({ email: email, user_id: user_id }, config.secret);
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.simply.com',
    port: 587,
    auth: {
      user: 'no-reply@talengo-jobs.com',
      pass: 'HejTalengo1234'
    }
  });

  const logo_path = path.resolve("./app/logo/jobs-logo.png");  

  const mailOptions = {
    from: 'no-reply@talengo-jobs.com',
    to: email,
    subject: `Dear ${name}`,
    html: `<!DOCTYPE html>
    <html>
        <head>
            <title></title>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    
            <style type="text/css"> 
                @media screen and (max-width: 600px) {
                    .content {
                        width: 100% !important;
                        display: block !important;
                        padding: 10px !important;
                    }
                    .header, .body {
                        padding: 20px !important;
                    }
                }
            </style>              
        </head>
        <body style="font-family: 'Poppins', Arial, sans-serif; background-color: #F5F6F7;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center" style="padding: 20px;">
                        <table class="content" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: white; border-collapse: collapse;">
                            <!-- Header -->
                            <tr>
                                <td class="header" style="padding-top: 24px; text-align: center;">
                                    <img src="cid:logo" style="width: 120px; height: 63px;"/>                                
                                </td>
                            </tr>
        
                            <!-- Body -->
                            <tr>
                                <td class="body" style="padding-left: 48px; padding-right: 48px; padding-top: 48px; text-align: center; color: #010A3F; font-weight: 700; font-size: 32px; line-height: 1.5;">${name}, 👋</td>
                            </tr>
                            <tr>
                                <td class="body" style="padding-left: 48px; padding-right: 48px; padding-top: 24px; text-align: center; color: #010A3F; font-size: 28px; line-height: 1.7;">
                                  Please confirm this email address by clicking on the button below.
                                </td>
                            </tr>
                            <!-- Call to action Button -->
                            <tr>
                                <td style="padding: 32px 48px 0px 48px; text-align: center;">
                                    <!-- CTA Button -->
                                    <table width="100%" cellspacing="0" cellpadding="0" style="margin: auto;">
                                        <tr>
                                            <td align="center">
                                                <a href="${process.env.PRODUCTION_URL}/b2c/verify-email/${secret}" target="_blank" style="display: block; background-color: #F61114; border-radius: 75px; border: none; padding: 25px 50px; font-size: 20px; font-weight: 700; color: #FFFFFF; text-decoration: none; cursor: pointer;">
                                                  Confirm email
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-top: 48px; text-align: center; color: #717171; font-size: 20px;">
                                  Alternatively, you can use this link:
                                </td>
                            </tr>     
                            <tr>
                              <td style="background-color: white; text-align: center;">
                                  <a href="#" target="_blank" style="color: #717171; text-decoration: underline; font-size: 20px;">talengo.dk/email234266369kkf</a>
                              </td>
                            </tr>                            
                            <tr>
                                <td style="background-color: white; padding-top: 96px; text-align: center;">
                                    <img src="cid:logo" style="width: 120px; height: 63px;"/>                                
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-left: 48px; padding-right: 48px; padding-top: 24px; text-align: center;">
                                    <a href="${process.env.PRODUCTION_URL}/b2b/landing-page/about" target="_blank" style="text-decoration: none; color: #010A3F; font-size: 18px; font-weight: 700;">www.talengojobs.dk</a>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-left: 48px; padding-right: 48px; padding-top: 8px; text-align: center; color: #717171; font-size: 16px;">
                                    Intelligent recruitment platform for our age
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: white; padding-top: 48px; text-align: center; color: #717171; font-size: 14px;">
                                    Talengo LLC, Adress 12, City
                                </td>
                            </tr>                      
                            <tr>
                                <td style="background-color: white; text-align: center; padding-bottom: 45px;">
                                    <a href="#" target="_blank" style="color: #717171; text-decoration: underline; font-size: 14px;">I don&apos;t want to receive any more emails like this</a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
    </html>`,
    attachments: [{
      filename: 'jobs-logo.png',
      path: logo_path,
      cid: 'logo'
    }]
  };

  transporter.sendMail(mailOptions, (error, info) => { 
    if (error) {
      console.log(error, '9999');                
    } else {
      console.log('Email sent======: ' + info);

      const talentPersonalizationFields = {};  
      if (email) {
        talentPersonalizationFields.email = email;
        talentPersonalizationFields.email_confirm = false;
      };

      TalentPersonalization.findOne({
        where: {
          employeeId: user_id
        }
      })
      .then(talent => {    
        if(!talent) {
            TalentPersonalization.create(
                talentPersonalizationFields
          )
        } else {
            TalentPersonalization.update(
                talentPersonalizationFields,
            {where: {employeeId: user_id}}
          )
        };
        res.send({status: "success"});
      })
      .catch(err => {
        res.send({ status: "failed" });
      }); 
    }
  }); 
}

exports.confirmEmail = (req, res) => {  
  const {token} = req.body;
  const user_id = jwt.verify(token, config.secret).user_id;
  const email = jwt.verify(token, config.secret).email;

  TalentPersonalization.update(
    {
      email_confirm: true
    },
    {
      where:{
        employeeId: user_id,
        email: email
      }
    }
  )
  .then(talent => {
    res.send({status: "success"});
  })
  .catch(err => {
    res.send({ status: "failed" });
  }); 
}

exports.mailchimpConfirm = (req, res) => {
  const {email} = req.body; 

  const transporter = nodemailer.createTransport({
    host: 'smtp.simply.com',
    port: 587,
    auth: {
      user: 'no-reply@talengo-jobs.com',
      pass: 'HejTalengo1234'
    }
  });

  const logo_path = path.resolve("./app/logo/jobs-logo.png");

  const mailOptions = {
    from: 'no-reply@talengo-jobs.com',
    to: email,
    subject: `From mailchimp`,
    html: `<!DOCTYPE html>
    <html>
        <head>
            <title></title>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    
            <style type="text/css"> 
                @media screen and (max-width: 600px) {
                    .content {
                        width: 100% !important;
                        display: block !important;
                        padding: 10px !important;
                    }
                    .header, .body {
                        padding: 20px !important;
                    }
                }
            </style>              
        </head>
        <body style="font-family: 'Poppins', Arial, sans-serif; background-color: #F5F6F7;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center" style="padding: 20px;">
                        <table class="content" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: white; border-collapse: collapse;">
                            <!-- Header -->
                            <tr>
                                <td class="header" style="padding-top: 24px; text-align: center;">
                                    <img src="cid:logo" style="width: 120px; height: 63px;"/>                                
                                </td>
                            </tr>
        
                            <!-- Body -->
                            <tr>
                                <td class="body" style="padding-left: 48px; padding-right: 48px; padding-top: 48px; text-align: center; color: #010A3F; font-weight: 700; font-size: 32px; line-height: 1.5;">Hi, 👋</td>
                            </tr>
                            <tr>
                                <td class="body" style="padding-left: 48px; padding-right: 48px; padding-top: 24px; text-align: center; color: #010A3F; font-size: 28px; line-height: 1.7;">
                                  Your email is now registered in our waitlist. We will notify you when Talengo launches, so stay tuned!
                                </td>
                            </tr>                            
                            <tr>
                                <td style="background-color: white; padding-top: 158px; text-align: center;">
                                    <img src="cid:logo" style="width: 120px; height: 63px;"/>                                
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-left: 48px; padding-right: 48px; padding-top: 24px; text-align: center;">
                                    <a href="${process.env.PRODUCTION_URL}" target="_blank" style="text-decoration: none; color: #010A3F; font-size: 18px; font-weight: 700;">www.talengojobs.dk</a>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-left: 48px; padding-right: 48px; padding-top: 8px; text-align: center; color: #717171; font-size: 16px;">
                                    Intelligent recruitment platform for our age
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: white; padding-top: 48px; text-align: center; color: #717171; font-size: 14px;">
                                    Talengo LLC, Adress 12, City
                                </td>
                            </tr>                      
                            <tr>
                                <td style="background-color: white; text-align: center; padding-bottom: 45px;">
                                    <a href="#" target="_blank" style="color: #717171; text-decoration: underline; font-size: 14px;">I don&apos;t want to receive any more emails like this</a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
    </html>`,
    attachments: [{
      filename: 'jobs-logo.png',
      path: logo_path,
      cid: 'logo'
    }]
  };

  transporter.sendMail(mailOptions, (error, info) => { 
    if (error) {
      console.log(error, '9999');                
    } else {
      console.log('Email sent======: ' + info);
    }
  }); 
}

exports.TalentDiplomaFilesUploadWithEducation = (req, res) => {
    const token = req.headers["x-access-token"];
    const user_id = jwt.verify(token, config.secret).id;

    const educationDataArray = req.body.educations; // Get education data from the body
    const diplomaFiles = req.files; // Get the uploaded files

    const results = educationDataArray?.map((education, index) => {
        const diplomaFile = diplomaFiles[index];

        return {
            education,
            file: diplomaFile?.size === 0 ? null : diplomaFile
        } 
    });         

    TalentPersonalization.findOne({
        where: {
            employeeId: user_id
        }
    })
    .then(talent_personalization => {
        TalentPersonalizationEducation.findAll({
            where: {
                talentPersonalizationId: talent_personalization.id
            }
        })
        .then(talentPersonalizationEducation => {
            if(talentPersonalizationEducation.length === 0) {
                results?.map(item => {            
                    const unfinishedBool = item?.education?.unfinished === 'true';
                    const isCurrentlyEducationBool = item?.education?.isCurrentlyEducation === 'true';
                    const isAddedDiplomaFileBool = item?.education?.isAddedDiplomaFile === 'true';

                    let filePath = null;
                    if (item.file) {
                        const destination = item.file.destination;
                        const filename = item.file.filename;
                        filePath = `${destination}${filename}`;
                    };
                    
                    TalentPersonalizationEducation.create({
                        education_level: item?.education?.educationLevel,
                        education_name: item?.education?.educationName,
                        institution_name: item?.education?.institutionName,
                        from: item?.education?.periodFrom === 'null' ? null : item?.education?.periodFrom,
                        to: item?.education?.periodTo === 'null' ? null : item?.education?.periodTo,
                        unfinished: unfinishedBool,
                        country: item?.education?.country,
                        is_currently_education: isCurrentlyEducationBool,
                        is_added_diploma_file: isAddedDiplomaFileBool,
                        file_path: filePath,
                        talentPersonalizationId: talent_personalization.id
                    });
                });
            } else {
                TalentPersonalizationEducation.destroy({
                    where: {
                        talentPersonalizationId: talent_personalization.id
                    }
                })
                .then(() => {
                    return TalentPersonalizationEducation.findOne({
                        order: [['id', 'DESC']],
                        limit: 1
                    });
                })
                .then(lastRecord => {
                    let nextId = 1;
                    if (lastRecord) {
                        nextId = lastRecord.id + 1;
                    };        
                    const newRecords = results?.map(item => {  
                        const unfinishedBool = item?.education?.unfinished === 'true';
                        const isCurrentlyEducationBool = item?.education?.isCurrentlyEducation === 'true';
                        const isAddedDiplomaFileBool = item?.education?.isAddedDiplomaFile === 'true';
    
                        let filePath = null;
                        if (item.file) {
                            const destination = item.file.destination;
                            const filename = item.file.filename;
                            filePath = `${destination}${filename}`;
                        };

                        return {
                            id: nextId++,
                            education_level: item?.education?.educationLevel,
                            education_name: item?.education?.educationName,
                            institution_name: item?.education?.institutionName,
                            from: item?.education?.periodFrom === 'null' ? null : item?.education?.periodFrom,
                            to: item?.education?.periodTo === 'null' ? null : item?.education?.periodTo,
                            unfinished: unfinishedBool,
                            country: item?.education?.country,
                            is_currently_education: isCurrentlyEducationBool,
                            is_added_diploma_file: isAddedDiplomaFileBool,
                            file_path: filePath,
                            talentPersonalizationId: talent_personalization.id  
                        }         
                    });        
                    return TalentPersonalizationEducation.bulkCreate(newRecords);
                })
            }
            res.send({status: "success"});
        })        
    })
    .catch(err => {
        res.send({ status: "failed" });
    }); 
};

exports.talentLanguageDocFilesUpload = (req, res) => {
    const token = req.headers["x-access-token"];
    const user_id = jwt.verify(token, config.secret).id;

    const languageDataArray = req.body.languages; // Get education data from the body
    const docFiles = req.files; // Get the uploaded files

    const results = languageDataArray?.map((data, index) => {
        const docFile = docFiles[index];

        return {
            data,
            file: docFile?.size === 0 ? null : docFile
        } 
    });

    TalentPersonalization.findOne({
        where: {
            employeeId: user_id
        }
    })
    .then(talent_personalization => {
        TalentPersonalizationLanguage.findAll({
            where: {
                talentPersonalizationId: talent_personalization.id
            }
        })
        .then(talentPersonalizationLanguage => {
            if(talentPersonalizationLanguage.length === 0) {
                results?.map(item => {            
                    const isAddedDocBool = item?.data?.isAddedDocument === 'true';                    

                    let filePath = null;
                    if (item.file) {
                        const destination = item.file.destination;
                        const filename = item.file.filename;
                        filePath = `${destination}${filename}`;
                    };
                    
                    TalentPersonalizationLanguage.create({
                        language: item?.data?.language,
                        level: item?.data?.level,
                        is_added_doc: isAddedDocBool,                        
                        file_path: filePath,
                        talentPersonalizationId: talent_personalization.id
                    });
                });
            } else {
                TalentPersonalizationLanguage.destroy({
                    where: {
                        talentPersonalizationId: talent_personalization.id
                    }
                })
                .then(() => {
                    return TalentPersonalizationLanguage.findOne({
                        order: [['id', 'DESC']],
                        limit: 1
                    });
                })
                .then(lastRecord => {
                    let nextId = 1;
                    if (lastRecord) {
                        nextId = lastRecord.id + 1;
                    };        
                    const newRecords = results?.map(item => {  
                        const isAddedDocBool = item?.data?.isAddedDocument === 'true';
    
                        let filePath = null;
                        if (item.file) {
                            const destination = item.file.destination;
                            const filename = item.file.filename;
                            filePath = `${destination}${filename}`;
                        };

                        return {
                            id: nextId++,
                            language: item?.data?.language,
                            level: item?.data?.level,
                            is_added_doc: isAddedDocBool,                        
                            file_path: filePath,
                            talentPersonalizationId: talent_personalization.id 
                        }         
                    });        
                    return TalentPersonalizationLanguage.bulkCreate(newRecords);
                })
            }
            res.send({status: "success"});
        })        
    })
    .catch(err => {
        res.send({ status: "failed" });
    }); 
};

exports.talentPersonalizationCreate = (req, res) => {
    const token = req.headers["x-access-token"];
    var user_id = jwt.verify(token, config.secret).id;
    
    const {firstName, lastName, email, sex, nationality, country, city, description, relocationToDenmark, needAccommodationInDenmark, knowDestination, destination, 
        jobInterests, isInEmployment, whenStartJob, occupations, phoneNumber, experiences, educationLevel
    } = req.body;
  
    const talentPersonalizationFields = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        sex: sex,
        nationality: nationality,
        country: country,
        city: city,
        description: description,
        relocation_to_denmark: relocationToDenmark,
        need_accommodation_in_denmark: needAccommodationInDenmark,
        know_destination: knowDestination,
        destination: destination,
        is_in_employment: isInEmployment,
        when_start_job: whenStartJob,
        phone_number: phoneNumber,
        education_level: educationLevel,
        employeeId: user_id
    };
    
    TalentPersonalization.findOne({
      where: {
        employeeId: user_id
      }
    })
    .then(talent => {    
        if(!talent) {
            TalentPersonalization.create(
                talentPersonalizationFields
            )
            .then(profile => {        
                const talentPersonalizationId = profile.id;
                talentPersonalizationOther(talentPersonalizationId, jobInterests, occupations, experiences);
            })
        } else {
            TalentPersonalization.update(
                talentPersonalizationFields,
                {where: {employeeId: user_id}}
            )
            .then(data => {
                const talentPersonalizationId = talent.id;
                talentPersonalizationOther(talentPersonalizationId, jobInterests, occupations, experiences);
            })
        };
        res.send({status: "success"});
    })
    .catch(err => {
      res.send({ status: "failed" });
    });  
};
  
function talentPersonalizationOther(talentPersonalizationId, jobInterests, occupations, experiences) {
    if (jobInterests) {
        TalentPersonalizationJobInterest.findAll({
            where: {
                talentPersonalizationId: talentPersonalizationId
            }
        })
        .then(talentPersonalizationJobInterest => {
            if (talentPersonalizationJobInterest.length === 0) {
                // If no job interests exist, create new ones
                return Promise.all(jobInterests.map(item => 
                    TalentPersonalizationJobInterest.create({
                        job_type: item,
                        talentPersonalizationId: talentPersonalizationId
                    })
                ));
            } else {
                // Destroy existing job interests
                return TalentPersonalizationJobInterest.destroy({
                    where: {
                        talentPersonalizationId: talentPersonalizationId
                    }
                })
                .then(() => {
                    // Create new job interests
                    return Promise.all(jobInterests.map(item => 
                        TalentPersonalizationJobInterest.create({
                            job_type: item,
                            talentPersonalizationId: talentPersonalizationId
                        })
                    ));
                });
            }
        })
        .catch(err => {
            console.error("Error:", err);
            res.send({ status: "failed", message: err.message });
        });
    }

    if (occupations) {
        TalentPersonalizationOccupation.findAll({
            where: {
                talentPersonalizationId: talentPersonalizationId
            }
        })
        .then(talentPersonalizationOccupations => {
            if (talentPersonalizationOccupations.length === 0) {
                // Create new occupations if none exist
                return Promise.all(occupations.map(item => 
                    TalentPersonalizationOccupation.create({
                        code: item?.code,
                        title: item?.title,
                        talentPersonalizationId: talentPersonalizationId
                    })
                    .then(data => {
                        // Check for existing skills
                        return TalentPersonalizationSkill.findAll({
                            where: {
                                talentPersonalizationOccupationId: data?.id
                            }
                        })
                        .then(skills => {
                            if (skills.length === 0) {
                                // Create skills if none exist
                                return Promise.all(item?.skills?.map(skill => 
                                    TalentPersonalizationSkill.create({
                                        title: skill?.title,
                                        uri: skill?.uri,
                                        talentPersonalizationOccupationId: data?.id
                                    })
                                ));
                            } else {
                                // Optionally, handle existing skills (delete them)
                                return TalentPersonalizationSkill.destroy({
                                    where: {
                                        talentPersonalizationOccupationId: data?.id
                                    }
                                })
                                .then(() => {
                                    // Create new skills
                                    const newRecords = item?.skills.map(skill => ({
                                        title: skill?.title,
                                        uri: skill?.uri,
                                        talentPersonalizationOccupationId: data?.id     
                                    }));
                                    return TalentPersonalizationSkill.bulkCreate(newRecords);
                                });
                            }
                        });
                    })
                ));
            } else {
                // Destroy existing occupations and their associated skills
                return TalentPersonalizationOccupation.findAll({
                    where: {
                        talentPersonalizationId: talentPersonalizationId
                    }
                })
                .then(existingOccupations => {
                    // Collect all occupation IDs to delete associated skills
                    const occupationIds = existingOccupations.map(occupation => occupation.id);
                    
                    // Destroy associated skills
                    return TalentPersonalizationSkill.destroy({
                        where: {
                            talentPersonalizationOccupationId: occupationIds
                        }
                    })
                    .then(() => {
                        // Now destroy the occupations
                        return TalentPersonalizationOccupation.destroy({
                            where: {
                                talentPersonalizationId: talentPersonalizationId
                            }
                        });
                    });
                })
                .then(() => {
                    // Create new occupations
                    const newRecords = occupations.map(item => ({
                        code: item?.code,
                        title: item?.title,
                        talentPersonalizationId: talentPersonalizationId          
                    }));

                    return TalentPersonalizationOccupation.bulkCreate(newRecords);
                })
                .then(() => {
                    // After creating new occupations, create skills
                    return Promise.all(occupations.map(item => {
                        // Find the newly created occupation
                        return TalentPersonalizationOccupation.findOne({
                            where: {
                                code: item.code,
                                talentPersonalizationId: talentPersonalizationId
                            }
                        })
                        .then(newOccupation => {
                            // Create skills for the new occupation
                            return Promise.all(item?.skills?.map(skill => 
                                TalentPersonalizationSkill.create({
                                    title: skill?.title,
                                    uri: skill?.uri,
                                    talentPersonalizationOccupationId: newOccupation?.id
                                })
                            ));
                        });
                    }));
                })
            }
        })
        .catch(err => {
            console.error("Error:", err);
            res.send({ status: "failed", message: err.message });
        });
    }    

    if (experiences) {
        TalentPersonalizationExperience.findAll({
            where: {
                talentPersonalizationId: talentPersonalizationId
            }
        })
        .then(talentPersonalizationExperience => {
            if (talentPersonalizationExperience.length === 0) {
                // If no experiences exist, create new ones
                return Promise.all(experiences.map(item => 
                    TalentPersonalizationExperience.create({
                        job_title: item?.jobTitle,
                        company_name: item?.companyName,
                        from: item?.period?.from,
                        to: item?.period?.to,
                        country: item?.country,
                        is_currently_working: item?.isCurrentlyWorking,
                        talentPersonalizationId: talentPersonalizationId
                    })
                ));
            } else {
                // Destroy existing experiences
                return TalentPersonalizationExperience.destroy({
                    where: {
                        talentPersonalizationId: talentPersonalizationId
                    }
                })
                .then(() => {
                    // Create new experiences
                    return Promise.all(experiences.map((item, index) => 
                        TalentPersonalizationExperience.create({
                            job_title: item?.jobTitle,
                            company_name: item?.companyName,
                            from: item?.period?.from,
                            to: item?.period?.to,
                            country: item?.country,
                            is_currently_working: item?.isCurrentlyWorking,
                            talentPersonalizationId: talentPersonalizationId
                        })
                    ));
                });
            }
        })
        .catch(err => {
            console.error("Error:", err);
            res.send({ status: "failed", message: err.message });
        });
    }    
}

exports.talentPersonalizationAvatarUpload = async (req, res) => {
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

        TalentPersonalization.update(
            {
                avatar_path: pngFilePath
            },
            {
                where:{
                    employeeId: user_id
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

exports.sendSMSVerificationCodeForPhoneChange = (req, res) => {
    const token = req.headers["x-access-token"];
    var user_id = jwt.verify(token, config.secret).id;

    const phoneNumber = req.body.phoneNumber;
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    TalentPersonalization.findOne({
        where: {
            employeeId: user_id
        }
    })
    .then(talent => {
        if (!talent) {
            return res.send({ message: "Talent Not found.", status: 404 });
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

exports.checkSMSVerificationCodeForPhoneChange = (req, res) => {
    const token = req.headers["x-access-token"];
    var user_id = jwt.verify(token, config.secret).id;

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
                TalentPersonalization.update(
                    {
                        phone_number: phoneNumber
                    },
                    {
                        where: {
                            employeeId: user_id
                        }
                    }
                )
                .then(data => {                    
                    res.send({ message: "Successfully changed!", status: 200});                    
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