var jwt = require("jsonwebtoken");
require('dotenv').config();
const fs = require("fs");
const path = require("path");
const { Op, where } = require('sequelize');
const config = require("../config/auth.config");
const db = require("../models");

// init table
const Field = db.field;
const Role = db.role;
const SoftSkill = db.softskill;
const HardSkill = db.hardskill;

// job listing table
const JobListing = db.job_listing;
const JobListingEssentialSkillAndKnowledge = db.job_listing_essential_skill_knowledge;
const JobListingOptionalSkillAndKnowledge = db.job_listing_optional_skill_knowledge;
const JobListingPhoto = db.job_listing_photo;
const JobListingLanguage = db.job_listing_language;

//company profile table
const CompanyProfile = db.company_profile;
const CompanyProfileGallery = db.company_profile_gallery;

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

//job application table
const JobApplication = db.job_application;

// job bookmark table
const JobBookMark = db.job_bookmark;

// b2b part
exports.jobListingPhotoUpload = (req, res) => {
  const token = req.headers["x-access-token"];
  const user_id = jwt.verify(token, config.secret).id;
  
  if (req.files.length > 0) { 
    JobListing.findOne({
      where: {
        employerId: user_id
      }
    })
    .then(joblisting => {
      JobListingPhoto.findAll({
        where: {
          jobListingId: joblisting.id
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

            JobListingPhoto.create({
              photo_path: pngFilePath,
              jobListingId: joblisting.id
            })            
          });          
          res.send({status: "success"});        
        } else {
          JobListingPhoto.destroy({            
            where: {
              jobListingId: joblisting.id
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
  
              JobListingPhoto.create({
                photo_path: pngFilePath,
                jobListingId: joblisting.id
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

exports.jobListingPublish = (req, res) => {
  const token = req.headers["x-access-token"];
  const user_id = jwt.verify(token, config.secret).id;  

  const { 
    title, jobTitle, description, sameLocationAsCompnay, essentialSkillAndKnowledge, optionalSkillAndKnowledge, jobType, period, workHour,
    shiftsAndIncludes, pay, vacantPositions, accommodation, languages, otherRequirements
  } = req.body;

  const jobListingFields = {
    title: title,    
    job_title: jobTitle,
    description: description,
    same_location_as_company: sameLocationAsCompnay,
    job_type: jobType,
    period_from: period?.fromDate,
    period_to: period?.toDate,
    work_hour: workHour?.hour,
    work_per: workHour?.per,
    shifts_fixed: shiftsAndIncludes?.shiftsFixed,
    shifts_floater: shiftsAndIncludes?.shiftsFloater,
    shifts_flexible: shiftsAndIncludes?.shiftsFlexible,
    includes_night_time_work: shiftsAndIncludes?.includesNightTimeWork,
    includes_work_on_weekends: shiftsAndIncludes?.includesWorkOnWeekends,
    pay_amount: pay?.amount,
    pay_method: pay?.method,
    vacant_position: vacantPositions,
    accommodation: accommodation,
    require_education: otherRequirements?.requireEducation,
    require_profile_picture: otherRequirements?.requireProfilePicture,
    require_no_criminal_record: otherRequirements?.requireNoCriminalRecord,
    employerId: user_id,
    is_public: true
  };  

  JobListing.create(
    jobListingFields,    
  )
  .then(job_list => {    
    const jobListingId = job_list.id;

    essentialSkillAndKnowledge?.map(item => {
      JobListingEssentialSkillAndKnowledge.create({
        title: item?.title,
        has_skill_type: item?.hasSkillType,
        uri: item?.uri,
        description: item?.description,
        jobListingId: jobListingId
      })
      .then(data => {
      })
      .catch(err => {
        res.send({ status: "language_table failed" });
      });        
    });

    optionalSkillAndKnowledge?.map(item => {
      JobListingOptionalSkillAndKnowledge.create({
        title: item?.title,
        has_skill_type: item?.hasSkillType,
        uri: item?.uri,
        description: item?.description,
        jobListingId: jobListingId
      })
      .then(data => {
      })
      .catch(err => {
        res.send({ status: "language_table failed" });
      });        
    });

    languages?.map(item => {
      JobListingLanguage.create({
        language: item?.language,
        language_level: item?.level,
        require_document: item?.requireDocument,
        jobListingId: jobListingId
      })
      .then(data => {
      })
      .catch(err => {
        res.send({ status: "language_table failed" });
      });        
    });

    res.send({status: "success", jobListingId: jobListingId})
  })
  .catch(err => {
    res.send({ status: "failed" });
  })
};

exports.jobListingUpdate = (req, res) => {
  const token = req.headers["x-access-token"];
  const user_id = jwt.verify(token, config.secret).id;  

  const { 
    isPublic, editJobId, title, jobTitle, description, sameLocationAsCompnay, essentialSkillAndKnowledge, optionalSkillAndKnowledge, jobType, period, workHour,
    shiftsAndIncludes, pay, vacantPositions, accommodation, languages, otherRequirements
  } = req.body;

  const jobListingFields = {
    title: title,
    job_title: jobTitle,
    description: description,
    same_location_as_company: sameLocationAsCompnay,
    job_type: jobType,
    period_from: period?.fromDate,
    period_to: period?.toDate,
    work_hour: workHour?.hour,
    work_per: workHour?.per,
    shifts_fixed: shiftsAndIncludes?.shiftsFixed,
    shifts_floater: shiftsAndIncludes?.shiftsFloater,
    shifts_flexible: shiftsAndIncludes?.shiftsFlexible,
    includes_night_time_work: shiftsAndIncludes?.includesNightTimeWork,
    includes_work_on_weekends: shiftsAndIncludes?.includesWorkOnWeekends,
    pay_amount: pay?.amount,
    pay_method: pay?.method,
    vacant_position: vacantPositions,
    accommodation: accommodation,
    require_education: otherRequirements?.requireEducation,
    require_profile_picture: otherRequirements?.requireProfilePicture,
    require_no_criminal_record: otherRequirements?.requireNoCriminalRecord,
    employerId: user_id,
    is_public: isPublic
  };

  JobListing.update(
    jobListingFields, 
    {where: {id: editJobId}}   
  )
  .then(data => {    
    const jobListingId = editJobId; 
    
    // create and update essential skill and knowledge table
    JobListingEssentialSkillAndKnowledge.findAll({
      where: {
        jobListingId: jobListingId
      }
    })
    .then(essentials => {
      if(essentials.length == 0) {
        essentialSkillAndKnowledge?.map(item => {
          JobListingEssentialSkillAndKnowledge.create({
            title: item?.title,
            has_skill_type: item?.hasSkillType,
            uri: item?.uri,
            description: item?.description,
            jobListingId: jobListingId
          })          
        })
      } else {
        JobListingEssentialSkillAndKnowledge.destroy({
          where: {
            jobListingId: jobListingId
          }
        })
        .then(() => {
          return JobListingEssentialSkillAndKnowledge.findOne({
            order: [['id', 'DESC']],
            limit: 1
          });
        })
        .then(lastRecord => {
          let nextId = 1;
          if (lastRecord) {
            nextId = lastRecord.id + 1;
          }

          const newRecords = essentialSkillAndKnowledge?.map(item => ({
            id: nextId++,
            title: item?.title,
            has_skill_type: item?.hasSkillType,
            uri: item?.uri,
            description: item?.description,
            jobListingId: jobListingId          
          }));

          return JobListingEssentialSkillAndKnowledge.bulkCreate(newRecords);
        })
      }
    })
    .catch(err => {
      res.send({ status: "failed" });
    });

    // create and update optional skill and knowledge table
    JobListingOptionalSkillAndKnowledge.findAll({
      where: {
        jobListingId: jobListingId
      }
    })
    .then(essentials => {
      if(essentials.length == 0) {
        optionalSkillAndKnowledge?.map(item => {
          JobListingOptionalSkillAndKnowledge.create({
            title: item?.title,
            has_skill_type: item?.hasSkillType,
            uri: item?.uri,
            description: item?.description,
            jobListingId: jobListingId
          })          
        })
      } else {
        JobListingOptionalSkillAndKnowledge.destroy({
          where: {
            jobListingId: jobListingId
          }
        })
        .then(() => {
          return JobListingOptionalSkillAndKnowledge.findOne({
            order: [['id', 'DESC']],
            limit: 1
          });
        })
        .then(lastRecord => {
          let nextId = 1;
          if (lastRecord) {
            nextId = lastRecord.id + 1;
          }

          const newRecords = optionalSkillAndKnowledge?.map(item => ({
            id: nextId++,
            title: item?.title,
            has_skill_type: item?.hasSkillType,
            uri: item?.uri,
            description: item?.description,
            jobListingId: jobListingId          
          }));

          return JobListingOptionalSkillAndKnowledge.bulkCreate(newRecords);
        })
      }
    })
    .catch(err => {
      res.send({ status: "failed" });
    });

    // create and update language table
    JobListingLanguage.findAll({
      where: {
        jobListingId: jobListingId
      }
    })
    .then(language => {
      if(language.length == 0) {
        languages?.map(item => {
          JobListingLanguage.create({
            language: item?.language,
            language_level: item?.level,
            require_document: item?.requireDocument,
            jobListingId: jobListingId
          })          
        })
      } else {
        JobListingLanguage.destroy({
          where: {
            jobListingId: jobListingId
          }
        })
        .then(() => {
          return JobListingLanguage.findOne({
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
            language: item?.language,
            language_level: item?.level,
            require_document: item?.requireDocument,
            jobListingId: jobListingId           
          }));

          return JobListingLanguage.bulkCreate(newRecords);
        })
      }
    })
    .catch(err => {
      res.send({ status: "failed" });
    });   

    res.send({status: "success"});
  })
  .catch(err => {
    res.send({ status: "failed" });
  })
};

exports.getPublicJobListing = async (req, res) => {
    const token = req.headers["x-access-token"];
    const user_id = jwt.verify(token, config.secret).id;
    
    try {
        // get job lists
        const jobLists = await JobListing.findAll({where: {employerId: user_id, is_public: true}});
    
        if (jobLists.length === 0) {
            return res.send({ status: "failed", message: "No jobs found" });
        };
    
        let temp = await Promise.all(jobLists.map(async jobList => {
            //get photos
            const joblisting_photos = await JobListingPhoto.findAll({where: {jobListingId: jobList.id}});
            const photos = joblisting_photos?.map(item => {
              const imagePath = item.photo_path;
              const ext = path.extname(imagePath).slice(1).toLowerCase();
              const contentType = `image/${ext}`;     
            
              const image = fs.readFileSync(imagePath, { encoding: 'base64' });
        
              return `data:${contentType};base64,${image}`;
            });

            //get job applicants
            const job_applications = await JobApplication.findAll({where: {jobId: jobList.id}});

            // get matched talents
            const matchedTalents = await TalentProfile.findAll();
    
            let data = {
                basic: jobList,
                photos: photos,
                matchedTalents: matchedTalents,
                applicants: job_applications
            }
            return data
        }));
  
        res.send({status: "success", data: temp});
  
    } catch (error) {
      res.send({ message: error.message, status: "failed" });
    }
};

exports.getHiddenJobListing = async (req, res) => {
  const token = req.headers["x-access-token"];
  const user_id = jwt.verify(token, config.secret).id;
  
  try {
      // get job lists
      const jobLists = await JobListing.findAll({where: {employerId: user_id, is_public: false}});
  
      if (jobLists.length === 0) {
          return res.send({ status: "failed", message: "No jobs found" });
      };
  
      let temp = await Promise.all(jobLists.map(async jobList => {
          //get photos
          const joblisting_photos = await JobListingPhoto.findAll({where: {jobListingId: jobList.id}});
          const photos = joblisting_photos?.map(item => {
            const imagePath = item.photo_path;
            const ext = path.extname(imagePath).slice(1).toLowerCase();
            const contentType = `image/${ext}`;     
          
            const image = fs.readFileSync(imagePath, { encoding: 'base64' });
      
            return `data:${contentType};base64,${image}`;
          });

          //get job applicants
          const job_applications = await JobApplication.findAll({where: {jobId: jobList.id}});

          // get matched talents
          const matchedTalents = await TalentProfile.findAll();
  
          let data = {
              basic: jobList,
              photos: photos,
              matchedTalents: matchedTalents,
              applicants: job_applications
          }
          return data
      }));

      res.send({status: "success", data: temp});

  } catch (error) {
    res.send({ message: error.message, status: "failed" });
  }
};

exports.getCurrentJob = async (req, res) => {
    const token = req.headers["x-access-token"];
    const user_id = jwt.verify(token, config.secret).id;
    const jobId = req.body.id;
   
    try {
      // get detailed job
      const job = await JobListing.findOne({where: {id: jobId}});
  
      if(!job) {
        return res.send({ status: "failed", message: "No job found" });
      };
  
      const detailedJob = await JobListing.findByPk(jobId, {
        include:
          [
            {model: JobListingEssentialSkillAndKnowledge, as: "job_listing_essential_skill_knowledges"},
            {model: JobListingOptionalSkillAndKnowledge, as: "job_listing_optional_skill_knowledges"},                       
            {model: JobListingLanguage, as: "job_listing_languages"},     
          ]
      });  

      const skillTypes = ["skill", "færdighed", "capacidad"];
      const knowledgeTypes = ["knowledge", "viden", "conocimiento"];

      const essential_skills = detailedJob?.job_listing_essential_skill_knowledges?.filter(item => skillTypes.includes(item?.has_skill_type));
      const optional_skills = detailedJob?.job_listing_optional_skill_knowledges?.filter(item => skillTypes.includes(item?.has_skill_type));
      const essential_knowledges = detailedJob?.job_listing_essential_skill_knowledges?.filter(item => knowledgeTypes.includes(item?.has_skill_type));
      const optional_knowledges = detailedJob?.job_listing_optional_skill_knowledges?.filter(item => knowledgeTypes.includes(item?.has_skill_type));
      
      const joblisting_photos = await JobListingPhoto.findAll({where: {jobListingId: job.id}});
      const photos = joblisting_photos?.map(item => {
        const imagePath = item.photo_path;
        const ext = path.extname(imagePath).slice(1).toLowerCase();
        const contentType = `image/${ext}`;     
      
        const image = fs.readFileSync(imagePath, { encoding: 'base64' });
  
        return `data:${contentType};base64,${image}`;
      });
  
      let temp = {
        basic: job,
        languages: detailedJob.job_listing_languages,
        essentialSkills: essential_skills,
        optionalSkills: optional_skills,
        essentialKnowledges: essential_knowledges,
        optionalKnowledges: optional_knowledges,
        photos: photos  
      };
  
      res.send({status: "success", data: temp});
    } catch (error) {
      res.send({ message: error.message, status: "failed" });
    }
};

exports.getPreviewJob = async (req, res) => {
    const token = req.headers["x-access-token"];
    const user_id = jwt.verify(token, config.secret).id;
    const jobId = req.body.id;
   
    try {
      // get detailed job
      const job = await JobListing.findOne({where: {id: jobId}});
  
      if(!job) {
        return res.send({ status: "failed", message: "No job found" });
      };
  
      const detailedJob = await JobListing.findByPk(jobId, {
        include:
          [
            {model: JobListingEssentialSkillAndKnowledge, as: "job_listing_essential_skill_knowledges"},
            {model: JobListingOptionalSkillAndKnowledge, as: "job_listing_optional_skill_knowledges"},
            {model: JobListingLanguage, as: "job_listing_languages"},  
            {model: JobApplication, foreignKey: "jobId", as: "job_applications"},          
          ]
      });
      const skillTypes = ["skill", "færdighed", "capacidad"];
      const knowledgeTypes = ["knowledge", "viden", "conocimiento"];

      const essential_skills = detailedJob?.job_listing_essential_skill_knowledges?.filter(item => skillTypes.includes(item?.has_skill_type));
      const optional_skills = detailedJob?.job_listing_optional_skill_knowledges?.filter(item => skillTypes.includes(item?.has_skill_type));
      const essential_knowledges = detailedJob?.job_listing_essential_skill_knowledges?.filter(item => knowledgeTypes.includes(item?.has_skill_type));
      const optional_knowledges = detailedJob?.job_listing_optional_skill_knowledges?.filter(item => knowledgeTypes.includes(item?.has_skill_type));

      const joblisting_photos = await JobListingPhoto.findAll({where: {jobListingId: job.id}});
      const photos = joblisting_photos?.map(item => {
        const imagePath = item.photo_path;
        const ext = path.extname(imagePath).slice(1).toLowerCase();
        const contentType = `image/${ext}`;     
      
        const image = fs.readFileSync(imagePath, { encoding: 'base64' });
  
        return `data:${contentType};base64,${image}`;
      });

      // get company profile for posted jobs
      const company_profile = await CompanyProfile.findOne({where: {employerId: job.employerId}});
      
      let company_profile_logo;
      if (company_profile.image_path == null) {
        company_profile_logo = null
      } else {
        let imagePath = company_profile.image_path;
        let ext = path.extname(imagePath).slice(1).toLowerCase();
        let contentType = `image/${ext}`;     
      
        image = fs.readFileSync(imagePath, { encoding: 'base64' });
  
        company_profile_logo = `data:${contentType};base64,${image}`
      };  
      //get job list posted by this company
      const jobLists = await JobListing.findAll({where: {employerId: company_profile.employerId}});
      const otherJobLists = jobLists.filter(item => item.id != jobId);
  
      let temp = {
        basic: job,  
        applications: detailedJob.job_applications?.filter(item => item?.status == "apply_received"),      
        languages: detailedJob.job_listing_languages,
        skills: [...essential_skills, ...optional_skills],
        knowledges: [...essential_knowledges, ...optional_knowledges],
        jobListingPhotos: photos,
        companyProfile: company_profile,
        companyLogo: company_profile_logo,        
        jobLists: otherJobLists
      };
  
      res.send({status: "success", data: temp});
    } catch (error) {
      res.send({ message: error.message, status: "failed" });
    }
};

exports.MatchedTalentsForCreateJob = async (req, res) => {  
    const token = req.headers["x-access-token"];
    const user_id = jwt.verify(token, config.secret).id;  

    const {jobTitle} = req.body;   
  
    try {
      // const talents = await TalentProfile.findAll();
      
      // if (talents.length === 0) {
      //   return res.send({ status: "failed", message: "No talents found" });
      // };   
      
      // let temp = await Promise.all(talents.map(async talent => {
      
      //   let avatar;
      //   if (talent.avatar_path == null) {
      //     avatar = null
      //   } else {
      //     let imagePath = talent.avatar_path;
      //     let ext = path.extname(imagePath).slice(1).toLowerCase();
      //     let contentType = `image/${ext}`;     
        
      //     image = fs.readFileSync(imagePath, { encoding: 'base64' });
  
      //     avatar = `data:${contentType};base64,${image}`
      //   }
        
  
      //   const talent_profile = await TalentProfile.findByPk(talent.id, 
      //     {include: 
      //       [
      //         {model: TalentProfileField, as: "talent_profile_fields"}, 
      //         {model: TalentProfileRole, as: "talent_profile_roles"}, 
      //         {model: TalentProfileSoftSkill, as: "talent_profile_softskills"},
      //         {model: TalentProfileHardSkill, as: "talent_profile_hardskills"},
      //         {model: TalentProfileWorkType, as: "talent_profile_worktypes"},
      //         {model: TalentProfileSeekingJobIn, as: "talent_profile_seeking_job_ins"},
      //         {model: TalentProfileLanguage, as: "talent_profile_languages"},
      //         {model: TalentProfileExperience, as: "talent_profile_experiences"},
      //         {model: TalentProfileEducation, as: "talent_profile_educations"},
      //         {model: TalentProfilePhoto, as: "talent_profile_photos"},
      //         {model: TalentProfileRecommendation, as: "talent_profile_recommendations"},
      //       ] 
      //   });
  
      //   let photos = talent_profile?.talent_profile_photos?.map(photo => {
      //     const imagePath = photo.photo_path;
      //     const ext = path.extname(imagePath).slice(1).toLowerCase();
      //     const contentType = `image/${ext}`;     
       
      //     const image = fs.readFileSync(imagePath, { encoding: 'base64' });
  
      //     return `data:${contentType};base64,${image}`;
      //   });    
  
      //   const fieldIds = talent_profile.talent_profile_fields.map(item => item.field);
      //   const fields = await Field.findAll({ where: { id: fieldIds } });
  
      //   const roleIds = talent_profile.talent_profile_roles.map(item => item.role);
      //   const roles = await Role.findAll({ where: { id: roleIds } });
  
      //   const hardskillIds = talent_profile.talent_profile_hardskills.map(item => item.hardskill);
      //   const hardSkills = await HardSkill.findAll({where: {id: hardskillIds}});
  
      //   const softSkillIds = talent_profile.talent_profile_softskills.map(item => item.softskill);
      //   const softSkills = await SoftSkill.findAll({where: {id: softSkillIds}});
  
      //   let data = {
      //     basicData: talent,
      //     avatar: avatar,
      //     photos: photos,
      //     fields: fields,
      //     roles: roles,
      //     softSkills: softSkills,
      //     hardSkills: hardSkills,
      //     workTypes: talent_profile.talent_profile_worktypes,
      //     seekingJobIn: talent_profile.talent_profile_seeking_job_ins,
      //     languages: talent_profile.talent_profile_languages,
      //     experiences: talent_profile.talent_profile_experiences,
      //     educations: talent_profile.talent_profile_educations,
      //     recommendations: talent_profile.talent_profile_recommendations,
      //   };
        
      //   return data;
      // }));

      const temp = [
        {
            id: 1,
            avatar: "/b2c/jobs/detail2.png",
            name: "Anna",
            nationality: "Argentinian",
            location: "La Plata, Argentina",
            availableDate: "Jan, 12",
            matchScore: 70,
            isApplied: true,
            isLiked: false,
            isContacted: true,
            interviewStatus: "completed"
        },
        {
            id: 2,
            avatar: "/b2c/jobs/detail2.png",
            name: "Giuseppe",
            nationality: "Argentinian",
            location: "La Plata, Argentina",
            availableDate: "Jan, 12",
            matchScore: 65,
            isApplied: false,
            isLiked: true,
            isContacted: false,
            interviewStatus: "progress"
        },
        {
            id: 3,
            avatar: "/b2c/jobs/detail2.png",
            name: "Julia",
            nationality: "Argentinian",
            location: "La Plata, Argentina",
            availableDate: "Jan, 12",
            matchScore: 50,
            isApplied: false,
            isLiked: true,
            isContacted: true,
            interviewStatus: "default"
        },
        {
            id: 4,
            avatar: "/b2c/jobs/detail2.png",
            name: "Franciszek",
            nationality: "Argentinian",
            location: "La Plata, Argentina",
            availableDate: "Jan, 12",
            matchScore: 47,
            isApplied: true,
            isLiked: false,
            isContacted: true,
            interviewStatus: "default"
        },
        {
            id: 5,
            avatar: "/b2c/jobs/detail2.png",
            name: "Remmy",
            nationality: "Argentinian",
            location: "La Plata, Argentina",
            availableDate: "Jan, 12",
            matchScore: 35,
            isApplied: false,
            isLiked: false,
            isContacted: false,
            interviewStatus: "default"
        },
        {
            id: 6,
            avatar: "/b2c/jobs/detail2.png",
            name: "Olivia",
            nationality: "Argentinian",
            location: "La Plata, Argentina",
            availableDate: "Jan, 12",
            matchScore: 30,
            isApplied: false,
            isLiked: true,
            isContacted: true,
            interviewStatus: "default"
        },
        {
            id: 7,
            avatar: "/b2c/jobs/detail2.png",
            name: "Viviana",
            nationality: "Argentinian",
            location: "La Plata, Argentina",
            availableDate: "Jan, 12",
            matchScore: 25,
            isApplied: true,
            isLiked: false,
            isContacted: true,
            interviewStatus: "default"
        },
        {
            id: 8,
            avatar: "/b2c/jobs/detail2.png",
            name: "Adolf",
            nationality: "Argentinian",
            location: "La Plata, Argentina",
            availableDate: "Jan, 12",
            matchScore: 20,
            isApplied: false,
            isLiked: false,
            isContacted: false,
            interviewStatus: "default"
        },
        {
            id: 9,
            avatar: "/b2c/jobs/detail2.png",
            name: "Ruth",
            nationality: "Argentinian",
            location: "La Plata, Argentina",
            availableDate: "Jan, 12",
            matchScore: 15,
            isApplied: false,
            isLiked: true,
            isContacted: false,
            interviewStatus: "default"
        }
      ];
  
      res.send({ status: "success", talents: temp });
    } catch (error) {
      res.send({ message: error.message, status: "failed" });
    }
};

exports.MatchedTalentsForCurrentJob = async (req, res) => {  
    const token = req.headers["x-access-token"];
    const user_id = jwt.verify(token, config.secret).id;  
    const jobId = req.body.id;
  
    try {
      // get detailed job
      const job = await JobListing.findOne({where: {id: jobId}});
  
      if(!job) {
        return res.send({ status: "failed", message: "No job found" });
      };
  
      const detailedJob = await JobListing.findByPk(jobId, {
        include:
          [
            {model: JobListingEssentialSkillAndKnowledge, as: "job_listing_essential_skill_knowledges"},
            {model: JobListingOptionalSkillAndKnowledge, as: "job_listing_optional_skill_knowledges"},                       
            {model: JobListingLanguage, as: "job_listing_languages"},     
          ]
      });

      const skillTypes = ["skill", "færdighed", "capacidad"];
      const knowledgeTypes = ["knowledge", "viden", "conocimiento"];

      const essential_skills = detailedJob?.job_listing_essential_skill_knowledges?.filter(item => skillTypes.includes(item?.has_skill_type))?.map(item => ({title: item?.title, description: item?.description, hasSkillType: item?.has_skill_type, uri: item?.uri}));
      const optional_skills = detailedJob?.job_listing_optional_skill_knowledges?.filter(item => skillTypes.includes(item?.has_skill_type))?.map(item => ({title: item?.title, description: item?.description, hasSkillType: item?.has_skill_type, uri: item?.uri}));;
      const essential_knowledges = detailedJob?.job_listing_essential_skill_knowledges?.filter(item => knowledgeTypes.includes(item?.has_skill_type))?.map(item => ({title: item?.title, description: item?.description, hasSkillType: item?.has_skill_type, uri: item?.uri}));;
      const optional_knowledges = detailedJob?.job_listing_optional_skill_knowledges?.filter(item => knowledgeTypes.includes(item?.has_skill_type))?.map(item => ({title: item?.title, description: item?.description, hasSkillType: item?.has_skill_type, uri: item?.uri}));;
      
      const joblisting_photos = await JobListingPhoto.findAll({where: {jobListingId: job.id}});
      const photos = joblisting_photos?.map(item => {
        const imagePath = item.photo_path;
        const ext = path.extname(imagePath).slice(1).toLowerCase();
        const contentType = `image/${ext}`;     
      
        const image = fs.readFileSync(imagePath, { encoding: 'base64' });
  
        return `data:${contentType};base64,${image}`;
      });

      const currentJob = {
        basic: job,
        languages: detailedJob.job_listing_languages,
        essentialSkills: essential_skills,
        optionalSkills: optional_skills,
        essentialKnowledges: essential_knowledges,
        optionalKnowledges: optional_knowledges,
        photos: photos
      }

      // //get matched talents for this job
      // const talents = await TalentProfile.findAll();  

      const talents = [
        {
            id: 1,
            avatar: "/b2c/jobs/detail2.png",
            name: "Anna",
            nationality: "Argentinian",
            location: "La Plata, Argentina",
            availableDate: "Jan, 12",
            matchScore: 70,
            isApplied: true,
            isLiked: false,
            isContacted: true,
            interviewStatus: "completed"
        },
        {
            id: 2,
            avatar: "/b2c/jobs/detail2.png",
            name: "Giuseppe",
            nationality: "Argentinian",
            location: "La Plata, Argentina",
            availableDate: "Jan, 12",
            matchScore: 65,
            isApplied: false,
            isLiked: true,
            isContacted: false,
            interviewStatus: "progress"
        },
        {
            id: 3,
            avatar: "/b2c/jobs/detail2.png",
            name: "Julia",
            nationality: "Argentinian",
            location: "La Plata, Argentina",
            availableDate: "Jan, 12",
            matchScore: 50,
            isApplied: false,
            isLiked: true,
            isContacted: true,
            interviewStatus: "default"
        },
        {
            id: 4,
            avatar: "/b2c/jobs/detail2.png",
            name: "Franciszek",
            nationality: "Argentinian",
            location: "La Plata, Argentina",
            availableDate: "Jan, 12",
            matchScore: 47,
            isApplied: true,
            isLiked: false,
            isContacted: true,
            interviewStatus: "default"
        },
        {
            id: 5,
            avatar: "/b2c/jobs/detail2.png",
            name: "Remmy",
            nationality: "Argentinian",
            location: "La Plata, Argentina",
            availableDate: "Jan, 12",
            matchScore: 35,
            isApplied: false,
            isLiked: false,
            isContacted: false,
            interviewStatus: "default"
        },
        {
            id: 6,
            avatar: "/b2c/jobs/detail2.png",
            name: "Olivia",
            nationality: "Argentinian",
            location: "La Plata, Argentina",
            availableDate: "Jan, 12",
            matchScore: 30,
            isApplied: false,
            isLiked: true,
            isContacted: true,
            interviewStatus: "default"
        },
        {
            id: 7,
            avatar: "/b2c/jobs/detail2.png",
            name: "Viviana",
            nationality: "Argentinian",
            location: "La Plata, Argentina",
            availableDate: "Jan, 12",
            matchScore: 25,
            isApplied: true,
            isLiked: false,
            isContacted: true,
            interviewStatus: "default"
        },
        {
            id: 8,
            avatar: "/b2c/jobs/detail2.png",
            name: "Adolf",
            nationality: "Argentinian",
            location: "La Plata, Argentina",
            availableDate: "Jan, 12",
            matchScore: 20,
            isApplied: false,
            isLiked: false,
            isContacted: false,
            interviewStatus: "default"
        },
        {
            id: 9,
            avatar: "/b2c/jobs/detail2.png",
            name: "Ruth",
            nationality: "Argentinian",
            location: "La Plata, Argentina",
            availableDate: "Jan, 12",
            matchScore: 15,
            isApplied: false,
            isLiked: true,
            isContacted: false,
            interviewStatus: "default"
        }
      ]
      
      const data = {
        currentJob: currentJob,
        matchedTalents: talents
      }
  
      res.send({ status: "success", data: data});
    } catch (error) {
      res.send({ message: error.message, status: "failed" });
    }
};

function MatchScore(candidate, job) {
  let score = 0;
  let total = 0; // Total categories to evaluate
  let commonFields = {
    jobType: "",
    seekingJobIn: "",
    fields: [],
    roles: [],
    hardSkills: [],
    softSkills: [],
    languages: []
  };

  let uncommonFields = {
    jobType: "",
    seekingJobIn: "",
    fields: [],
    roles: [],
    hardSkills: [],
    softSkills: [],
    languages: []
  };

  // Job type matching
  if (candidate.workTypes.includes(job.jobType)) {
    score += 1;
    total += 1;   
    commonFields.jobType = job.jobType; 
  } else {
    uncommonFields.jobType = job.jobType; // Add to uncommon if no match
  }

  // Location matching
  if (candidate.seekingJobIn.includes(job.location)) {
    score += 1;
    total += 1;    
    commonFields.seekingJobIn = job.location;
  } else {
    uncommonFields.seekingJobIn = job.location; // Add to uncommon if no match
  }

  // Fields matching
  if (job.jobFields.length > 0) {     
    const matchingFields = job.jobFields.filter(jobField =>
      candidate.fields.some(candidateField => candidateField.field == jobField.field)
    );    
    score += matchingFields.length / job.jobFields.length;
    total += 1;   
    commonFields.fields = matchingFields;

    // Uncommon fields    
    const uncommonCandidateFields = job.jobFields.filter(jobField =>
      !candidate.fields.some(candidateField => candidateField.field == jobField.field)
    );
    uncommonFields.fields = uncommonCandidateFields;
  }  

  // Roles matching
  if (job.jobRoles.length > 0) {     
    const matchingRoles = job.jobRoles.filter(jobRole =>
      candidate.roles.some(candidateRole => candidateRole.role == jobRole.role)
    );   
    score += matchingRoles.length / job.jobRoles.length;
    total += 1;   
    commonFields.roles = matchingRoles;

    const uncommonCandidateRoles = job.jobRoles.filter(jobRole =>
      !candidate.roles.some(candidateRole => candidateRole.role == jobRole.role)
    );
    uncommonFields.roles = uncommonCandidateRoles;
  }  

  // Hard skills matching
  if (job.jobHardSkills.length > 0) {    
    const matchHardSkills = job.jobHardSkills.filter(jobHardSkill =>
      candidate.hardSkills.some(candidateHardSkill => candidateHardSkill.hard_skill == jobHardSkill.hard_skill)
    );

    score += matchHardSkills.length / job.jobHardSkills.length;
    total += 1;  
    commonFields.hardSkills = matchHardSkills;
   
    const uncommonCandidateHardSkills = job.jobHardSkills.filter(jobHardSkill =>
      !candidate.hardSkills.some(candidateHardSkill => candidateHardSkill.hard_skill == jobHardSkill.hard_skill)
    );
    uncommonFields.hardSkills = uncommonCandidateHardSkills;  
  }

  // Soft skills matching
  if (job.jobSoftSkills.length > 0) {    
    const matchSoftSkills = job.jobSoftSkills.filter(jobSoftSkill =>
      candidate.softSkills.some(candidateSoftSkill => candidateSoftSkill.soft_skill == jobSoftSkill.soft_skill)
    );
    score += matchSoftSkills.length / job.jobSoftSkills.length;
    total += 1;    
    commonFields.softSkills = matchSoftSkills;

    // Uncommon soft skills    
    const uncommonCandidateSoftSkills = job.jobSoftSkills.filter(jobSoftSkill =>
      !candidate.softSkills.some(candidateSoftSkill => candidateSoftSkill.soft_skill == jobSoftSkill.soft_skill)
    );
    uncommonFields.softSkills = uncommonCandidateSoftSkills;
  }  

  // Language matching
  if (job.jobLanguages.length > 0) {
    const matchingLanguages = candidate.languages.filter(candidateLang =>
      job.jobLanguages.some(jobLang => jobLang.language == candidateLang.language)
    );   
    score += matchingLanguages.length / job.jobLanguages.length;
    total += 1;    
    commonFields.languages = matchingLanguages;

    // Uncommon languages    
    const uncommonCandidateLanguages = job.jobLanguages.filter(jobLang =>
      !candidate.languages.some(candidateLang => candidateLang.language == jobLang.language)
    );
    uncommonFields.languages = uncommonCandidateLanguages;
  }

  const matchScore = Math.round(parseFloat((score / total) * 100));
  
  const data = {
    commonFields: commonFields,
    uncommonFields: uncommonFields,
    matchScore: matchScore
  };
  
  return data;
}

// b2c part
exports.getJobLists = async (req, res) => {
  const token = req.headers["x-access-token"];
  const user_id = jwt.verify(token, config.secret).id;
  
  try {
    // get current user
    const talent = await TalentProfile.findOne({where: {employeeId: user_id}});

    if(!talent) {
      return res.send({ status: "no_talent", message: "No talent" });
    };

    const talent_profile = await TalentProfile.findByPk(talent.id, 
      {include: 
        [
          {model: TalentProfileField, as: "talent_profile_fields"}, 
          {model: TalentProfileRole, as: "talent_profile_roles"}, 
          {model: TalentProfileSoftSkill, as: "talent_profile_softskills"},
          {model: TalentProfileHardSkill, as: "talent_profile_hardskills"},
          {model: TalentProfileWorkType, as: "talent_profile_worktypes"},
          {model: TalentProfileSeekingJobIn, as: "talent_profile_seeking_job_ins"},
          {model: TalentProfileLanguage, as: "talent_profile_languages"},
          {model: TalentProfileExperience, as: "talent_profile_experiences"},
          {model: TalentProfileEducation, as: "talent_profile_educations"},
          {model: TalentProfilePhoto, as: "talent_profile_photos"},
          {model: TalentProfileRecommendation, as: "talent_profile_recommendations"},
        ] 
    });

    const talent_fieldIds = talent_profile.talent_profile_fields.map(item => item.field);
    const talent_fields = await Field.findAll({ where: { id: talent_fieldIds } });

    const talent_roleIds = talent_profile.talent_profile_roles.map(item => item.role);
    const talent_roles = await Role.findAll({ where: { id: talent_roleIds } });

    const talent_hardskillIds = talent_profile.talent_profile_hardskills.map(item => item.hardskill);
    const talent_hardSkills = await HardSkill.findAll({where: {id: talent_hardskillIds}});

    const talent_softSkillIds = talent_profile.talent_profile_softskills.map(item => item.softskill);
    const talent_softSkills = await SoftSkill.findAll({where: {id: talent_softSkillIds}});

    const talent_workTypes = talent_profile.talent_profile_worktypes.map(item => item.work_type);
    const talent_seekingJobIn = talent_profile.talent_profile_seeking_job_ins.map(item => `${item.city}, ${item.state}`); 
    
    const talent_languages = talent_profile.talent_profile_languages?.map(item => ({
      language: item?.language,
      level: item?.language_level
    }));

    const candidate = {
      workTypes: talent_workTypes,          
      seekingJobIn: talent_seekingJobIn,
      fields: talent_fields,
      roles: talent_roles,
      hardSkills: talent_hardSkills,
      softSkills: talent_softSkills,
      languages: talent_languages
    };

    // get job lists
    const jobLists = await JobListing.findAll({where: {is_public: true}});

    if (jobLists.length === 0) {
      return res.send({ status: "failed", message: "No jobs found" });
    };

    let temp = await Promise.all(jobLists.map(async jobList => {

      const job = await JobListing.findByPk(jobList.id, {
        include:
          [
            {model: JobListingField, as: "job_listing_fields"},
            {model: JobListingRole, as: "job_listing_roles"},
            {model: JobListingHardSkill, as: "job_listing_hardskills"},
            {model: JobListingSoftSkill, as: "job_listing_softskills"},
            {model: JobListingLanguage, as: "job_listing_languages"},
            {model: JobListingStudyField, as: "job_listing_study_fields"},
            {model: JobListingTimeFrameWorkDay, as: "job_listing_timeframe_workdays"},
            {model: JobListingTimeFrameWorkHour, as: "job_listing_timeframe_workhours"},
            {model: JobApplication, foreignKey: "jobId", as: "job_applications"},
            {model: JobBookMark, foreignKey: "jobId", as: "job_bookmarks"},
          ]
      });

      const job_fieldIds = job.job_listing_fields.map(item => item.field);
      const job_fields = await Field.findAll({ where: { id: job_fieldIds } });

      const job_roleIds = job.job_listing_roles.map(item => item.role); 
      const job_roles = await Role.findAll({ where: { id: job_roleIds } });

      const job_hardskillIds = job.job_listing_hardskills.map(item => item.hardskill);
      const job_hardSkills = await HardSkill.findAll({where: {id: job_hardskillIds}});

      const job_softskillIds = job.job_listing_softskills.map(item => item.softskill);
      const job_softSkills = await SoftSkill.findAll({where: {id: job_softskillIds}}); 

      const job_languages = job.job_listing_languages?.map(item => ({
        language: item.language,
        level: item?.language_level
      }));

      const jobForMatch = {
        jobType: jobList?.job_type,
        location: jobList?.location,
        jobFields: job_fields,
        jobRoles: job_roles,
        jobHardSkills: job_hardSkills,
        jobSoftSkills: job_softSkills,
        jobLanguages: job_languages
      };

      // calculate match score
      let matchedResult = MatchScore(candidate, jobForMatch);


      const my_job_bookmark_status = job?.job_bookmarks?.some(item => item?.employeeId == user_id && item?.is_saved);      
      const my_job_application_status = job?.job_applications?.some(item => (item?.employeeId == user_id && item?.status == "apply_received")); 
      const my_job_application = job?.job_applications?.find(item => (item?.employeeId == user_id && item?.status == "apply_received"));

      // get company profile for posted jobs
      const company_profile = await CompanyProfile.findOne({where: {employerId: jobList.employerId}});

      const company_profile_gallery = await CompanyProfileGallery.findAll({where: {companyProfileId: company_profile.id}});
      const gallery = company_profile_gallery?.map(item => {
        const imagePath = item.image_path;
        const ext = path.extname(imagePath).slice(1).toLowerCase();
        const contentType = `image/${ext}`;     
     
        const image = fs.readFileSync(imagePath, { encoding: 'base64' });

        return `data:${contentType};base64,${image}`;
      });

      let data = {
        basic: jobList,
        applications: job.job_applications?.filter(item => item?.status == "apply_received"),
        my_job_application_status: my_job_application_status,
        my_job_application: my_job_application,
        my_job_bookmark_status: my_job_bookmark_status,
        fields: job_fields,
        roles: job_roles,
        company_profile_gallery: gallery,
        matchedResult: matchedResult
      }
      return data
    }));

    res.send({status: "success", data: temp});

  } catch (error) {
    res.send({ message: error.message, status: "failed" });
  }
};

exports.getBookmarkedJobLists = async (req, res) => {
  const token = req.headers["x-access-token"];
  const user_id = jwt.verify(token, config.secret).id;

  try {
    // get current user
    const talent = await TalentProfile.findOne({where: {employeeId: user_id}});

    if(!talent) {
      return res.send({ status: "no_talent", message: "No talent" });
    };

    const talent_profile = await TalentProfile.findByPk(talent.id, 
      {include: 
        [
          {model: TalentProfileField, as: "talent_profile_fields"}, 
          {model: TalentProfileRole, as: "talent_profile_roles"}, 
          {model: TalentProfileSoftSkill, as: "talent_profile_softskills"},
          {model: TalentProfileHardSkill, as: "talent_profile_hardskills"},
          {model: TalentProfileWorkType, as: "talent_profile_worktypes"},
          {model: TalentProfileSeekingJobIn, as: "talent_profile_seeking_job_ins"},
          {model: TalentProfileLanguage, as: "talent_profile_languages"},
          {model: TalentProfileExperience, as: "talent_profile_experiences"},
          {model: TalentProfileEducation, as: "talent_profile_educations"},
          {model: TalentProfilePhoto, as: "talent_profile_photos"},
          {model: TalentProfileRecommendation, as: "talent_profile_recommendations"},
        ] 
    });

    const talent_fieldIds = talent_profile.talent_profile_fields.map(item => item.field);
    const talent_fields = await Field.findAll({ where: { id: talent_fieldIds } });

    const talent_roleIds = talent_profile.talent_profile_roles.map(item => item.role);
    const talent_roles = await Role.findAll({ where: { id: talent_roleIds } });

    const talent_hardskillIds = talent_profile.talent_profile_hardskills.map(item => item.hardskill);
    const talent_hardSkills = await HardSkill.findAll({where: {id: talent_hardskillIds}});

    const talent_softSkillIds = talent_profile.talent_profile_softskills.map(item => item.softskill);
    const talent_softSkills = await SoftSkill.findAll({where: {id: talent_softSkillIds}});

    const talent_workTypes = talent_profile.talent_profile_worktypes.map(item => item.work_type);
    const talent_seekingJobIn = talent_profile.talent_profile_seeking_job_ins.map(item => `${item.city}, ${item.state}`); 

    const talent_languages = talent_profile.talent_profile_languages?.map(item => ({
      language: item?.language,
      level: item?.language_level
    }));

    const candidate = {
      workTypes: talent_workTypes,          
      seekingJobIn: talent_seekingJobIn,
      fields: talent_fields,
      roles: talent_roles,
      hardSkills: talent_hardSkills,
      softSkills: talent_softSkills,
      languages: talent_languages
    };

    // Get job lists that are bookmarked by the user
    const jobLists = await JobListing.findAll({
      where: { is_public: true },
      include: {
        model: JobBookMark,
        as: "job_bookmarks",
        where: { employeeId: user_id, is_saved: true }, // Only include bookmarked jobs
      },
    });

    if (jobLists.length === 0) {
      return res.send({ status: "failed", message: "No bookmarked jobs found" });
    };

    let temp = await Promise.all(jobLists.map(async jobList => {

      const job = await JobListing.findByPk(jobList.id, {
        include:
          [
            {model: JobListingField, as: "job_listing_fields"},
            {model: JobListingRole, as: "job_listing_roles"},
            {model: JobListingHardSkill, as: "job_listing_hardskills"},
            {model: JobListingSoftSkill, as: "job_listing_softskills"},
            {model: JobListingLanguage, as: "job_listing_languages"},
            {model: JobListingStudyField, as: "job_listing_study_fields"},
            {model: JobListingTimeFrameWorkDay, as: "job_listing_timeframe_workdays"},
            {model: JobListingTimeFrameWorkHour, as: "job_listing_timeframe_workhours"},
            {model: JobApplication, foreignKey: "jobId", as: "job_applications"},
            {model: JobBookMark, foreignKey: "jobId", as: "job_bookmarks"},
          ]
      });

      const job_fieldIds = job.job_listing_fields.map(item => item.field);
      const job_fields = await Field.findAll({ where: { id: job_fieldIds } });

      const job_roleIds = job.job_listing_roles.map(item => item.role); 
      const job_roles = await Role.findAll({ where: { id: job_roleIds } });

      const job_hardskillIds = job.job_listing_hardskills.map(item => item.hardskill);
      const job_hardSkills = await HardSkill.findAll({where: {id: job_hardskillIds}});

      const job_softskillIds = job.job_listing_softskills.map(item => item.softskill);
      const job_softSkills = await SoftSkill.findAll({where: {id: job_softskillIds}}); 

      const job_languages = job.job_listing_languages?.map(item => ({
        language: item.language,
        level: item?.language_level
      }));

      const jobForMatch = {
        jobType: jobList?.job_type,
        location: jobList?.location,
        jobFields: job_fields,
        jobRoles: job_roles,
        jobHardSkills: job_hardSkills,
        jobSoftSkills: job_softSkills,
        jobLanguages: job_languages
      };

      // calculate match score
      let matchedResult = MatchScore(candidate, jobForMatch);


      const my_job_bookmark_status = job?.job_bookmarks?.some(item => item?.employeeId == user_id && item?.is_saved);      
      const my_job_application_status = job?.job_applications?.some(item => (item?.employeeId == user_id && item?.status == "apply_received")); 
      const my_job_application = job?.job_applications?.find(item => (item?.employeeId == user_id && item?.status == "apply_received"));

      // get company profile for posted jobs
      const company_profile = await CompanyProfile.findOne({where: {employerId: jobList.employerId}});

      const company_profile_gallery = await CompanyProfileGallery.findAll({where: {companyProfileId: company_profile.id}});
      const gallery = company_profile_gallery?.map(item => {
        const imagePath = item.image_path;
        const ext = path.extname(imagePath).slice(1).toLowerCase();
        const contentType = `image/${ext}`;     
    
        const image = fs.readFileSync(imagePath, { encoding: 'base64' });

        return `data:${contentType};base64,${image}`;
      });

      let data = {
        basic: jobList,
        applications: job.job_applications?.filter(item => item?.status == "apply_received"),
        my_job_application_status: my_job_application_status,
        my_job_application: my_job_application,
        my_job_bookmark_status: my_job_bookmark_status,
        fields: job_fields,
        roles: job_roles,
        company_profile_gallery: gallery,
        matchedResult: matchedResult
      }
      return data
    }));

    res.send({status: "success", data: temp});
  } catch (error) {
    res.send({ message: error.message, status: "failed" })
  }
}

exports.getDetailedJob = async (req, res) => {
  const token = req.headers["x-access-token"];
  const user_id = jwt.verify(token, config.secret).id;
  const jobId = req.body.id;
 
  try {
    // get current user
    const talent = await TalentProfile.findOne({where: {employeeId: user_id}});

    if(!talent) {
      return res.send({ status: "no_talent", message: "No talent" });
    };

    const talent_profile = await TalentProfile.findByPk(talent.id, 
      {include: 
        [
          {model: TalentProfileField, as: "talent_profile_fields"}, 
          {model: TalentProfileRole, as: "talent_profile_roles"}, 
          {model: TalentProfileSoftSkill, as: "talent_profile_softskills"},
          {model: TalentProfileHardSkill, as: "talent_profile_hardskills"},
          {model: TalentProfileWorkType, as: "talent_profile_worktypes"},
          {model: TalentProfileSeekingJobIn, as: "talent_profile_seeking_job_ins"},
          {model: TalentProfileLanguage, as: "talent_profile_languages"},
          {model: TalentProfileExperience, as: "talent_profile_experiences"},
          {model: TalentProfileEducation, as: "talent_profile_educations"},
          {model: TalentProfilePhoto, as: "talent_profile_photos"},
          {model: TalentProfileRecommendation, as: "talent_profile_recommendations"},
        ] 
    });

    const talent_fieldIds = talent_profile.talent_profile_fields.map(item => item.field);
    const talent_fields = await Field.findAll({ where: { id: talent_fieldIds } });

    const talent_roleIds = talent_profile.talent_profile_roles.map(item => item.role);
    const talent_roles = await Role.findAll({ where: { id: talent_roleIds } });

    const talent_hardskillIds = talent_profile.talent_profile_hardskills.map(item => item.hardskill);
    const talent_hardSkills = await HardSkill.findAll({where: {id: talent_hardskillIds}});

    const talent_softSkillIds = talent_profile.talent_profile_softskills.map(item => item.softskill);
    const talent_softSkills = await SoftSkill.findAll({where: {id: talent_softSkillIds}});

    const talent_workTypes = talent_profile.talent_profile_worktypes.map(item => item.work_type);
    const talent_seekingJobIn = talent_profile.talent_profile_seeking_job_ins.map(item => `${item.city}, ${item.state}`); 
    
    const talent_languages = talent_profile.talent_profile_languages?.map(item => ({
      language: item?.language,
      level: item?.language_level
    }));

    const candidate = {
      workTypes: talent_workTypes,          
      seekingJobIn: talent_seekingJobIn,
      fields: talent_fields,
      roles: talent_roles,
      hardSkills: talent_hardSkills,
      softSkills: talent_softSkills,
      languages: talent_languages
    };

    // get detailed job
    const job = await JobListing.findOne({where: {id: jobId}});

    if(!job) {
      return res.send({ status: "failed", message: "No job found" });
    };

    const detailedJob = await JobListing.findByPk(jobId, {
      include:
        [
          {model: JobListingField, as: "job_listing_fields"},
          {model: JobListingRole, as: "job_listing_roles"},
          {model: JobListingHardSkill, as: "job_listing_hardskills"},
          {model: JobListingSoftSkill, as: "job_listing_softskills"},
          {model: JobListingLanguage, as: "job_listing_languages"},
          {model: JobListingStudyField, as: "job_listing_study_fields"},
          {model: JobListingTimeFrameWorkDay, as: "job_listing_timeframe_workdays"},
          {model: JobListingTimeFrameWorkHour, as: "job_listing_timeframe_workhours"},
          {model: JobApplication, foreignKey: "jobId", as: "job_applications"},
          {model: JobBookMark, foreignKey: "jobId", as: "job_bookmarks"},
        ]
    });

    const job_fieldIds = detailedJob.job_listing_fields.map(item => item.field);
    const job_fields = await Field.findAll({where: {id: job_fieldIds}});

    const job_roleIds = detailedJob.job_listing_roles.map(item => item.role);
    const job_roles = await Role.findAll({where: {id: job_roleIds}});

    const job_hardskillIds = detailedJob.job_listing_hardskills.map(item => item.hardskill);
    const job_hardSkills = await HardSkill.findAll({where: {id: job_hardskillIds}});

    const job_softskillIds = detailedJob.job_listing_softskills.map(item => item.softskill);
    const job_softSkills = await SoftSkill.findAll({where: {id: job_softskillIds}});  
    
    const job_skills = [...job_softSkills, ...job_hardSkills];

    const job_languages = detailedJob.job_listing_languages?.map(item => ({
      language: item.language,
      level: item?.language_level
    }));

    const jobForMatch = {
      jobType: job?.job_type,
      location: job?.location,
      jobFields: job_fields,
      jobRoles: job_roles,
      jobHardSkills: job_hardSkills,
      jobSoftSkills: job_softSkills,
      jobLanguages: job_languages
    };

    // calculate match score
    let matchedResult = MatchScore(candidate, jobForMatch);

    const my_job_bookmark_status = detailedJob?.job_bookmarks?.some(item => item?.employeeId == user_id && item?.is_saved);

    const my_job_application_status = detailedJob?.job_applications?.some(item => (item?.employeeId == user_id && item?.status == "apply_received")); 
    const my_job_application = detailedJob?.job_applications?.find(item => (item?.employeeId == user_id && item?.status == "apply_received"));

    // get company profile for posted jobs
    const company_profile = await CompanyProfile.findOne({where: {employerId: job.employerId}});
    
    let company_profile_logo;
    if (company_profile.image_path == null) {
      company_profile_logo = null
    } else {
      let imagePath = company_profile.image_path;
      let ext = path.extname(imagePath).slice(1).toLowerCase();
      let contentType = `image/${ext}`;     
    
      image = fs.readFileSync(imagePath, { encoding: 'base64' });

      company_profile_logo = `data:${contentType};base64,${image}`
    };

    const company_profile_gallery = await CompanyProfileGallery.findAll({where: {companyProfileId: company_profile.id}});
    const gallery = company_profile_gallery?.map(item => {
      const imagePath = item.image_path;
      const ext = path.extname(imagePath).slice(1).toLowerCase();
      const contentType = `image/${ext}`;     
    
      const image = fs.readFileSync(imagePath, { encoding: 'base64' });

      return `data:${contentType};base64,${image}`;
    });

    //get job list posted by this company
    const jobLists = await JobListing.findAll({where: {employerId: company_profile.employerId}});
    const otherJobLists = jobLists.filter(item => item.id != jobId);

    let temp = {
      basic: job,
      applications: detailedJob.job_applications?.filter(item => item?.status == "apply_received"),
      my_job_application_status: my_job_application_status,
      my_job_application: my_job_application,
      my_job_bookmark_status: my_job_bookmark_status,
      fields: job_fields,
      roles: job_roles,
      skills: job_skills,
      softskills: job_softSkills,
      hardskills: job_hardSkills,
      languages: detailedJob.job_listing_languages,
      fieldOfStudy: detailedJob.job_listing_study_fields,
      workDays: detailedJob.job_listing_timeframe_workdays,
      workHours: detailedJob.job_listing_timeframe_workhours,
      company_profile: company_profile,
      company_profile_logo: company_profile_logo,
      company_profile_gallery: gallery,
      jobLists: otherJobLists,
      matchedResult: matchedResult
    };

    res.send({status: "success", data: temp});
  } catch (error) {
    res.send({ message: error.message, status: "failed" });
  }
};

exports.getMoreJobs = async (req, res) => {
  const token = req.headers["x-access-token"];
  const user_id = jwt.verify(token, config.secret).id;

  const moreJobIds = req.body.ids; 

  try {
    // get job lists
    const jobLists = await JobListing.findAll({where: { id: { [Op.in]: moreJobIds }, is_public: true }});

    if (jobLists.length === 0) {
      return res.send({ status: "failed", message: "No jobs found" });
    };

    let temp = await Promise.all(jobLists.map(async jobList => {

      const job = await JobListing.findByPk(jobList.id, {
        include:
          [
            {model: JobListingField, as: "job_listing_fields"},
            {model: JobListingRole, as: "job_listing_roles"},   
            {model: JobApplication, foreignKey: "jobId", as: "job_applications"},
            {model: JobBookMark, foreignKey: "jobId", as: "job_bookmarks"},
          ]
      });

      const fieldIds = job.job_listing_fields.map(item => item.field);
      const fields = await Field.findAll({where: {id: fieldIds}});

      const roleIds = job.job_listing_roles.map(item => item.role);
      const roles = await Role.findAll({where: {id: roleIds}}); 
      
      const my_job_bookmark_status = job?.job_bookmarks?.some(item => item?.employeeId == user_id && item?.is_saved);

      const my_job_application_status = job?.job_applications?.some(item => (item?.employeeId == user_id && item?.status == "apply_received")); 
      const my_job_application = job?.job_applications?.find(item => (item?.employeeId == user_id && item?.status == "apply_received"));


      // get company profile for posted jobs
      const company_profile = await CompanyProfile.findOne({where: {employerId: jobList.employerId}});

      const company_profile_gallery = await CompanyProfileGallery.findAll({where: {companyProfileId: company_profile.id}});
      const gallery = company_profile_gallery?.map(item => {
        const imagePath = item.image_path;
        const ext = path.extname(imagePath).slice(1).toLowerCase();
        const contentType = `image/${ext}`;     
     
        const image = fs.readFileSync(imagePath, { encoding: 'base64' });

        return `data:${contentType};base64,${image}`;
      });

      let data = {
        basic: jobList,
        applications: job.job_applications?.filter(item => item?.status == "apply_received"),
        my_job_application_status: my_job_application_status,
        my_job_application: my_job_application,
        my_job_bookmark_status: my_job_bookmark_status,
        fields: fields,
        roles: roles,
        company_profile_gallery: gallery
      }
      return data
    }));

    res.send({status: "success", data: temp});

  } catch (error) {
    res.send({ message: error.message, status: "failed" });
  }
};

exports.jobListsFilter = async (req, res) => {
  const {hourlyRate, location, fields, roles, jobTypes, workHours} = req.body;

  try {
    const whereCondition = {};
    const includeOptions = [];

    if (location.length > 0) {
      whereCondition.location = { [Op.in]: location };
    }

    if (jobTypes.length > 0) {
      whereCondition.job_type = { [Op.in]: jobTypes };
    }

    if (fields.length > 0) {
      let all_fields_flag = false;
    
      if (fields.some(item => item == "1")) {
        all_fields_flag = true;
      }
    
      if (all_fields_flag) {        
        includeOptions.push({
          model: JobListingField,
          as: 'job_listing_fields'
        });
      } else {
        includeOptions.push({
          model: JobListingField,
          as: 'job_listing_fields',
          where: { field: { [Op.in]: fields } }
        });
      }
    }    

    if (roles.length > 0) {
      includeOptions.push({
        model: JobListingRole,
        as: 'job_listing_roles',
        where: { role: { [Op.in]: roles } }
      });
    }  
    
    if (workHours?.length > 0) {
      includeOptions.push({
        model: JobListingTimeFrameWorkHour,
        as: 'job_listing_timeframe_workhours',
        where: { work_hour: { [Op.in]: workHours } }
      });
    }

    const jobLists = await JobListing.findAll({ where: whereCondition, include: includeOptions });
    
    if (jobLists.length === 0) {
      return res.send({ status: "failed", message: "No jobs found" });
    };

    let temp = await Promise.all(jobLists.map(async jobList => {

      const job = await JobListing.findByPk(jobList.id, {
        include:
          [
            {model: JobListingField, as: "job_listing_fields"},
            {model: JobListingRole, as: "job_listing_roles"},            
          ]
      });

      const fieldIds = job.job_listing_fields.map(item => item.field);
      const fields = await Field.findAll({where: {id: fieldIds}});

      const roleIds = job.job_listing_roles.map(item => item.role);
      const roles = await Role.findAll({where: {id: roleIds}});       

      // get company profile for posted jobs
      const company_profile = await CompanyProfile.findOne({where: {employerId: jobList.employerId}});

      const company_profile_gallery = await CompanyProfileGallery.findAll({where: {companyProfileId: company_profile.id}});
      const gallery = company_profile_gallery?.map(item => {
        const imagePath = item.image_path;
        const ext = path.extname(imagePath).slice(1).toLowerCase();
        const contentType = `image/${ext}`;     
     
        const image = fs.readFileSync(imagePath, { encoding: 'base64' });

        return `data:${contentType};base64,${image}`;
      });

      let data = {
        basic: jobList,
        fields: fields,
        roles: roles,
        company_profile_gallery: gallery
      }
      return data
    }));

    res.send({status: "success", data: temp});
  } catch (error) {    
    res.send({ message: error.message, status: "failed" });
  }
};

exports.jobApply = async (req, res) => {
  const token = req.headers["x-access-token"];
  const user_id = jwt.verify(token, config.secret).id;
  const jobId = req.body.id;

  JobApplication.findOne({
    where: {
      employeeId: user_id,
      jobId: jobId 
    }
  })
  .then(apply => {
    if(apply) {
      JobApplication.update(
        {
          status: "apply_received"
        },
        {    
          where: {
            employeeId: user_id,
            jobId: jobId
          }
        }
      )      
      .catch(err => {
        res.send({ status: "failed" });
      });
    } else {
      JobApplication.create({
        status: "apply_received",
        employeeId: user_id,
        jobId: jobId 
      })
      .catch(err => {
        res.send({ status: "failed" });
      });
    };    
    res.send({status: "success"});    
  })
  .catch(err => {
    res.send({ status: "failed" });
  });
};

exports.jobApplyWithdraw = async (req, res) => {
  const token = req.headers["x-access-token"];
  const user_id = jwt.verify(token, config.secret).id;
  const jobId = req.body.id;

  JobApplication.update(
    {
      status: null
    },
    {    
      where: {
        employeeId: user_id,
        jobId: jobId
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

exports.jobBookmark = async (req, res) => {
  const token = req.headers["x-access-token"];
  const user_id = jwt.verify(token, config.secret).id;
  const jobId = req.body.id;
  const isSaved = req.body.isSaved;

  JobBookMark.findOne({
    where: {
      employeeId: user_id,
      jobId: jobId 
    }
  })
  .then(bookmark => {
    if(bookmark) {
      JobBookMark.update(
        {
          is_saved: isSaved
        },
        {    
          where: {
            employeeId: user_id,
            jobId: jobId
          }
        }
      )      
      .catch(err => {
        res.send({ status: "failed" });
      });
    } else {
      JobBookMark.create({
        is_saved: isSaved,
        employeeId: user_id,
        jobId: jobId 
      })
      .catch(err => {
        res.send({ status: "failed" });
      });
    };
    res.send({status: "success"});    
  })
  .catch(err => {
    res.send({ status: "failed" });
  });
};

exports.getJobListsWithoutToken = async (req, res) => {
  try {
    // get job lists
    const jobLists = await JobListing.findAll({where: {is_public: true}});

    if (jobLists.length === 0) {
      return res.send({ status: "failed", message: "No jobs found" });
    };

    let temp = await Promise.all(jobLists.map(async jobList => {

      const job = await JobListing.findByPk(jobList.id, {
        include:
          [
            {model: JobListingField, as: "job_listing_fields"},
            {model: JobListingRole, as: "job_listing_roles"},
            {model: JobListingHardSkill, as: "job_listing_hardskills"},
            {model: JobListingSoftSkill, as: "job_listing_softskills"},
            {model: JobListingLanguage, as: "job_listing_languages"},
            {model: JobListingStudyField, as: "job_listing_study_fields"},
            {model: JobListingTimeFrameWorkDay, as: "job_listing_timeframe_workdays"},
            {model: JobListingTimeFrameWorkHour, as: "job_listing_timeframe_workhours"},
            {model: JobApplication, foreignKey: "jobId", as: "job_applications"},
            {model: JobBookMark, foreignKey: "jobId", as: "job_bookmarks"},
          ]
      });

      const job_fieldIds = job.job_listing_fields.map(item => item.field);
      const job_fields = await Field.findAll({ where: { id: job_fieldIds } });

      const job_roleIds = job.job_listing_roles.map(item => item.role); 
      const job_roles = await Role.findAll({ where: { id: job_roleIds } });            

      // get company profile for posted jobs
      const company_profile = await CompanyProfile.findOne({where: {employerId: jobList.employerId}});

      const company_profile_gallery = await CompanyProfileGallery.findAll({where: {companyProfileId: company_profile.id}});
      const gallery = company_profile_gallery?.map(item => {
        const imagePath = item.image_path;
        const ext = path.extname(imagePath).slice(1).toLowerCase();
        const contentType = `image/${ext}`;     
     
        const image = fs.readFileSync(imagePath, { encoding: 'base64' });

        return `data:${contentType};base64,${image}`;
      });

      let data = {
        basic: jobList,        
        fields: job_fields,
        roles: job_roles,
        company_profile_gallery: gallery,       
      }
      return data
    }));

    res.send({status: "success", data: temp});

  } catch (error) {
    res.send({ message: error.message, status: "failed" });
  }
};

exports.getDetailedJobWithoutToken = async (req, res) => {  
  const jobId = req.body.id;
 
  try {
    // get detailed job
    const job = await JobListing.findOne({where: {id: jobId}});

    if(!job) {
      return res.send({ status: "failed", message: "No job found" });
    };

    const detailedJob = await JobListing.findByPk(jobId, {
      include:
        [
          {model: JobListingField, as: "job_listing_fields"},
          {model: JobListingRole, as: "job_listing_roles"},
          {model: JobListingHardSkill, as: "job_listing_hardskills"},
          {model: JobListingSoftSkill, as: "job_listing_softskills"},
          {model: JobListingLanguage, as: "job_listing_languages"},
          {model: JobListingStudyField, as: "job_listing_study_fields"},
          {model: JobListingTimeFrameWorkDay, as: "job_listing_timeframe_workdays"},
          {model: JobListingTimeFrameWorkHour, as: "job_listing_timeframe_workhours"},
          {model: JobApplication, foreignKey: "jobId", as: "job_applications"},
          {model: JobBookMark, foreignKey: "jobId", as: "job_bookmarks"},
        ]
    });

    const job_fieldIds = detailedJob.job_listing_fields.map(item => item.field);
    const job_fields = await Field.findAll({where: {id: job_fieldIds}});

    const job_roleIds = detailedJob.job_listing_roles.map(item => item.role);
    const job_roles = await Role.findAll({where: {id: job_roleIds}});

    const job_hardskillIds = detailedJob.job_listing_hardskills.map(item => item.hardskill);
    const job_hardSkills = await HardSkill.findAll({where: {id: job_hardskillIds}});

    const job_softskillIds = detailedJob.job_listing_softskills.map(item => item.softskill);
    const job_softSkills = await SoftSkill.findAll({where: {id: job_softskillIds}});  
    
    const job_skills = [...job_softSkills, ...job_hardSkills];    

    // get company profile for posted jobs
    const company_profile = await CompanyProfile.findOne({where: {employerId: job.employerId}});
    
    let company_profile_logo;
    if (company_profile.image_path == null) {
      company_profile_logo = null
    } else {
      let imagePath = company_profile.image_path;
      let ext = path.extname(imagePath).slice(1).toLowerCase();
      let contentType = `image/${ext}`;     
    
      image = fs.readFileSync(imagePath, { encoding: 'base64' });

      company_profile_logo = `data:${contentType};base64,${image}`
    };

    const company_profile_gallery = await CompanyProfileGallery.findAll({where: {companyProfileId: company_profile.id}});
    const gallery = company_profile_gallery?.map(item => {
      const imagePath = item.image_path;
      const ext = path.extname(imagePath).slice(1).toLowerCase();
      const contentType = `image/${ext}`;     
    
      const image = fs.readFileSync(imagePath, { encoding: 'base64' });

      return `data:${contentType};base64,${image}`;
    });

    //get job list posted by this company
    const jobLists = await JobListing.findAll({where: {employerId: company_profile.employerId}});
    const otherJobLists = jobLists.filter(item => item.id != jobId);

    let temp = {
      basic: job,      
      fields: job_fields,
      roles: job_roles,
      skills: job_skills,
      softskills: job_softSkills,
      hardskills: job_hardSkills,
      languages: detailedJob.job_listing_languages,
      fieldOfStudy: detailedJob.job_listing_study_fields,
      workDays: detailedJob.job_listing_timeframe_workdays,
      workHours: detailedJob.job_listing_timeframe_workhours,
      company_profile: company_profile,
      company_profile_logo: company_profile_logo,
      company_profile_gallery: gallery,
      jobLists: otherJobLists,
    };

    res.send({status: "success", data: temp});
  } catch (error) {
    res.send({ message: error.message, status: "failed" });
  }
};

exports.getMoreJobsWithoutToken = async (req, res) => {
  const moreJobIds = req.body.ids; 

  try {
    // get job lists
    const jobLists = await JobListing.findAll({where: { id: { [Op.in]: moreJobIds }, is_public: true }});

    if (jobLists.length === 0) {
      return res.send({ status: "failed", message: "No jobs found" });
    };

    let temp = await Promise.all(jobLists.map(async jobList => {

      const job = await JobListing.findByPk(jobList.id, {
        include:
          [
            {model: JobListingField, as: "job_listing_fields"},
            {model: JobListingRole, as: "job_listing_roles"},
          ]
      });

      const fieldIds = job.job_listing_fields.map(item => item.field);
      const fields = await Field.findAll({where: {id: fieldIds}});

      const roleIds = job.job_listing_roles.map(item => item.role);
      const roles = await Role.findAll({where: {id: roleIds}});

      // get company profile for posted jobs
      const company_profile = await CompanyProfile.findOne({where: {employerId: jobList.employerId}});

      const company_profile_gallery = await CompanyProfileGallery.findAll({where: {companyProfileId: company_profile.id}});
      const gallery = company_profile_gallery?.map(item => {
        const imagePath = item.image_path;
        const ext = path.extname(imagePath).slice(1).toLowerCase();
        const contentType = `image/${ext}`;     
     
        const image = fs.readFileSync(imagePath, { encoding: 'base64' });

        return `data:${contentType};base64,${image}`;
      });

      let data = {
        basic: jobList,        
        fields: fields,
        roles: roles,
        company_profile_gallery: gallery
      }
      return data
    }));

    res.send({status: "success", data: temp});

  } catch (error) {
    res.send({ message: error.message, status: "failed" });
  }
};