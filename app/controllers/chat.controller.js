var jwt = require("jsonwebtoken");
require('dotenv').config();
const fs = require("fs");
const path = require("path");
const { Op, where } = require('sequelize');
const config = require("../config/auth.config");
const db = require("../models");

//chat message table
const ChatMessage = db.chat_message;

//talent personalization table
const TalentPersonalization = db.talent_personalization;
const TalentPersonalizationJobInterest = db.talent_personalization_job_interest;
const TalentPersonalizationOccupation = db.talent_personalization_occupation;
const TalentPersonalizationEducation = db.talent_personalization_education;
const TalentPersonalizationLanguage = db.talent_personalization_language;
const TalentPersonalizationExperience = db.talent_personalization_experience;
const TalentPersonalizationSkill = db.talent_personalization_skill;

//company profile table
const CompanyProfile = db.company_profile;
const CompanyProfileGallery = db.company_profile_gallery;

exports.getB2BChatUsers = async (req, res) => {
    const token = req.headers["x-access-token"];
    const user_id = jwt.verify(token, config.secret).id;
  
    try {
        const messages = await ChatMessage.findAll({where: {sender_id: user_id}});
    
        if (messages.length === 0) {
            return res.send({ status: "success", chatUserLists: [] });
        };

        // Extract unique employee IDs
        const employeeIds = [...new Set(messages.map(msg => msg.receiver_id))];

        let temp = await Promise.all(employeeIds.map(async employeeId => {
            const talent = await TalentPersonalization.findOne({where: {employeeId: employeeId}});

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

            // Count unread messages for this employee
            const unreadCount = await ChatMessage.count({
                where: {
                    sender_id: employeeId,
                    receiver_id: user_id,
                    is_read: false
                }
            });

            let profile = {
                basicData: plainTalent,
                avatar: avatar,
                jobInterests: talent_personalization.talent_personalization_job_interests,
                occupations: talent_personalization.talent_personalization_occupations, // Now includes skills
                educations: educations,
                experiences: talent_personalization.talent_personalization_experiences,
                languages: languages,
                skills: talent_personalization.talent_personalization_skills,
                unreadMessageCount: unreadCount
            };
            return profile
        }));
        res.send({ status: "success", chatUserLists: temp });
    } catch (error) {
        res.send({ message: error.message, status: "failed" });
    }
};

exports.getB2BCurrentChatUser = async (req, res) => {
    const token = req.headers["x-access-token"];
    const user_id = jwt.verify(token, config.secret).id;

    const employee_id = req.body.id;

    try {
        //current chat user
        const talent = await TalentPersonalization.findOne({where: {employeeId: employee_id}});        
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
            skills: talent_personalization.talent_personalization_skills,
            unreadMessageCount: 0
        };

        res.send({status: "success", currentChatUser: profile});        
    } catch (error) {
        res.send({ message: error.message, status: "failed" });
    }
};


exports.getB2cChatUsers = async (req, res) => {
    const token = req.headers["x-access-token"];
    const user_id = jwt.verify(token, config.secret).id;
  
    try {
        const messages = await ChatMessage.findAll({where: {receiver_id: user_id}});
    
        if (messages.length === 0) {
            return res.send({ status: "success", B2cChatUserLists: [] });
        };

        // Extract unique employee IDs
        const employerIds = [...new Set(messages.map(msg => msg.sender_id))];

        let temp = await Promise.all(employerIds.map(async employerId => {
            // Fetch the company profile
            const profile = await CompanyProfile.findOne({
                where: { employerId: employerId }
            });
        
            if (!profile) {
                return null; // Handle case where no profile is found
            }

            // Count unread messages for the current employer
            const unreadCount = await ChatMessage.count({
                where: {
                    sender_id: employerId,
                    receiver_id: user_id,
                    is_read: false // Assuming there's an `is_read` field
                }
            });
        
            let avatar = null;
            if (profile.image_path) {
                const imagePath = profile.image_path;
                const ext = path.extname(imagePath).slice(1).toLowerCase();
                const contentType = `image/${ext}`;
                
                const image = fs.readFileSync(imagePath, { encoding: 'base64' });
                avatar = `data:${contentType};base64,${image}`;
            }
        
            // Fetch the company profile gallery
            const galleries = await CompanyProfileGallery.findAll({
                where: { companyProfileId: profile.id }
            });
        
            const gallery_temp = await Promise.all(galleries.map(async gallery => {
                const imagePath = gallery.image_path;
                const ext = path.extname(imagePath).slice(1).toLowerCase();
                const contentType = `image/${ext}`;
                const image = fs.readFileSync(imagePath, { encoding: 'base64' });
        
                return `data:${contentType};base64,${image}`;
            }));            
        
            return {
                profile: profile,
                logo: avatar,
                gallery: gallery_temp,
                unreadMessageCount: unreadCount // Include the unread message count      
            };
        }));

        res.send({ status: "success", B2cChatUserLists: temp });
    } catch (error) {
        res.send({ message: error.message, status: "failed" });
    }
};

exports.getCurrentB2cChatUser = async (req, res) => {
    // Uncomment if you want to use token authentication
    // const token = req.headers["x-access-token"];
    // const user_id = jwt.verify(token, config.secret).id;       
    const employer_id = req.body.id;

    try {
        const profile = await CompanyProfile.findOne({
            where: {
                employerId: employer_id
            }
        });

        if (!profile) {
            return res.send({ status: "failed", message: "Profile not found." });
        }

        let avatar = null;
        if (profile.image_path) {
            const imagePath = profile.image_path;
            const ext = path.extname(imagePath).slice(1).toLowerCase();
            const contentType = `image/${ext}`;
            
            const image = fs.readFileSync(imagePath, { encoding: 'base64' });
            avatar = `data:${contentType};base64,${image}`;
        }

        const galleries = await CompanyProfileGallery.findAll({
            where: {
                companyProfileId: profile.id
            }
        });

        const gallery_temp = await Promise.all(galleries.map(async gallery => {
            const imagePath = gallery.image_path;
            const ext = path.extname(imagePath).slice(1).toLowerCase();
            const contentType = `image/${ext}`;
            const image = fs.readFileSync(imagePath, { encoding: 'base64' });

            return `data:${contentType};base64,${image}`;
        }));

        const data = {
            profile: profile, 
            logo: avatar, 
            gallery: gallery_temp,
            unreadMessageCount: 0
        };

        res.send({ status: "success", chatUser: data });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.send({ status: "failed", message: "An error occurred." });
    }
};

exports.getB2BMessages = async (req, res) => {
    const token = req.headers["x-access-token"];
    const user_id = jwt.verify(token, config.secret).id;

    const {sender, receiver} = req.body;
  
    try {
        const messages = await ChatMessage.findAll({
            where: {
                [Op.or]: [
                    { sender_id: sender, receiver_id: receiver },
                    { sender_id: receiver, receiver_id: sender }
                ]
            },
            order: [['createdAt', 'ASC']]
        });        
    
        if (messages.length === 0) {
            return res.send({ status: "failed", message: "No messages found" });
        };
        
        res.send({ status: "success", messages: messages });
    } catch (error) {
        res.send({ message: error.message, status: "failed" });
    }
}

exports.getB2CMessages = async (req, res) => {
    const token = req.headers["x-access-token"];
    const user_id = jwt.verify(token, config.secret).id;

    const {sender, receiver} = req.body;
    
    try {
        const messages = await ChatMessage.findAll({
            where: {
                [Op.or]: [
                    { sender_id: sender, receiver_id: receiver },
                    { sender_id: receiver, receiver_id: sender }
                ]
            },
            order: [['createdAt', 'ASC']]
        });        
    
        if (messages.length === 0) {
            return res.send({ status: "failed", message: "No messages found" });
        };
        
        res.send({ status: "success", messages: messages });
    } catch (error) {
        res.send({ message: error.message, status: "failed" });
    }
}

exports.markB2BMessagesAsRead = async (req, res) => {
    const token = req.headers["x-access-token"];
    const user_id = jwt.verify(token, config.secret).id;

    const {sender, receiver} = req.body;
    
    try {
        ChatMessage.update(
            { is_read: true },
            {
                where: {                
                    sender_id: sender, 
                    receiver_id: receiver,
                    is_read: false
                }
            }
        )
        .then(data => {
            res.send({status: "success"})
        })
    } catch (error) {
        res.send({ message: error.message, status: "failed" });
    }
}

exports.markB2CMessagesAsRead = async (req, res) => {
    const token = req.headers["x-access-token"];
    const user_id = jwt.verify(token, config.secret).id;

    const {sender, receiver} = req.body;
    
    try {
        ChatMessage.update(
            { is_read: true },
            {
                where: {                
                    sender_id: sender, 
                    receiver_id: receiver,
                    is_read: false
                }
            }
        )
        .then(data => {
            res.send({status: "success"})
        })
    } catch (error) {
        res.send({ message: error.message, status: "failed" });
    }
}

