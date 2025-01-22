const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");
const jobController = require("../controllers/joblist.controller");
const talentController = require("../controllers/talent.controller");
const b2bSettingController = require("../controllers/b2b.setting.controller");
const companyController = require("../controllers/company.controller");
const chatController = require("../controllers/chat.controller");
const multer = require("multer");
const fs = require('fs');

// Base uploads directory
const uploadsDir = 'uploads/';

// Define the folders to create
const folders = [
    'company/logo',
    'company/gallery',
    'joblist/photos',
    'avatars',
    'resumes',
    'diplomas',
    'language-docs'
];

// Function to create directories
const createDirectories = (baseDir, folders) => {
    folders.forEach(folder => {
        const dirPath = `${baseDir}${folder}/`;
        if (!fs.existsSync(dirPath)){
            fs.mkdirSync(dirPath, { recursive: true });
        }
    });
};

// Create the required directories
createDirectories(uploadsDir, folders);

// Storage configuration for general uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir); // Default uploads folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Storage configuration for avatar uploads
const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${uploadsDir}avatars/`); // Specific folder for avatars
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Storage configuration for resume uploads
const resumeStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${uploadsDir}resumes/`); // Specific folder for resumes
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Storage configuration for company logo uploads
const companyLogoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${uploadsDir}company/logo/`); // Specific folder for company logos
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Storage configuration for company profile uploads
const companyProfileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${uploadsDir}company/profile/`); // Specific folder for company profiles
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Storage configuration for job list photos uploads
const jobListPhotosStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${uploadsDir}joblist/photos/`); // Specific folder for job list photos
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Storage configuration for diploma uploads
const diplomaStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${uploadsDir}diplomas/`); // Specific folder for diplomas
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Storage configuration for language document uploads
const languageDocsStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${uploadsDir}language-docs/`); // Specific folder for language documents
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Multer upload instances
const upload = multer({ storage: storage });
const avatarUpload = multer({ storage: avatarStorage });
const resumeUpload = multer({ storage: resumeStorage });
const companyLogoUpload = multer({ storage: companyLogoStorage });
const companyProfileUpload = multer({ storage: companyProfileStorage });
const jobListPhotosUpload = multer({ storage: jobListPhotosStorage });
const diplomaUpload = multer({ storage: diplomaStorage });
const languageDocsUpload = multer({ storage: languageDocsStorage });

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });  
  app.get('/api/test', controller.test);
  app.get("/api/get-field", controller.getField);
  app.get("/api/get-roles", controller.getRole);
  app.get("/api/get-skills", controller.getSkill);
  app.get("/api/get-softskill", controller.getSoftSkill);
  app.get("/api/get-hardskill", controller.getHardSkill);

   //--------------------company controller---------------//
   //b2b part
  app.post("/api/company-logo-upload", [authJwt.verifyToken], companyLogoUpload.single('file'), companyController.CompanyLogoUpload); 
  app.post("/api/company-profile-image-upload", [authJwt.verifyToken], companyProfileUpload.single('file'), companyController.CompanyProfileImageUpload);
  app.post("/api/company-profile-create", [authJwt.verifyToken], companyController.CompanyProfileCreate);
  app.post("/api/company-profile-update", [authJwt.verifyToken], companyController.companyProfileUpdate);
  app.get("/api/get-company-profile", [authJwt.verifyToken], companyController.getCompanyProfile);
  app.post("/api/get-company", companyController.getCompany);
  
  //------------------b2b setting controller----------------
  app.get("/api/getting-notifications", [authJwt.verifyToken], b2bSettingController.gettingNotifications); 
  app.post("/api/setting-notifications", [authJwt.verifyToken], b2bSettingController.settingNotifications); 
  app.get("/api/get-payment-methods", [authJwt.verifyToken], b2bSettingController.getPaymentMethods);
  app.post("/api/create-payment-method", [authJwt.verifyToken], b2bSettingController.createStripePaymentMethod);
  app.post("/api/remove-payment-method", [authJwt.verifyToken], b2bSettingController.removeStripePaymentMethod);
  app.post("/api/set-primary-payment-method", [authJwt.verifyToken], b2bSettingController.setPrimaryPaymentMethod);
  app.post("/api/create-payment-intent", [authJwt.verifyToken], b2bSettingController.createPaymentIntent); 
  app.post("/api/confirm-payment-intent", [authJwt.verifyToken], b2bSettingController.confirmPaymentIntent);

  //----------------job-list controller-----------------------//
  //b2b part
  app.post("/api/job-listing-photos-upload", [authJwt.verifyToken], jobListPhotosUpload.array('photos', 30), jobController.jobListingPhotoUpload);
  app.post("/api/job-listing-publish", [authJwt.verifyToken], jobController.jobListingPublish); 
  app.post("/api/job-listing-update", [authJwt.verifyToken], jobController.jobListingUpdate);
  app.post("/api/get-current-job", [authJwt.verifyToken], jobController.getCurrentJob);  
  app.get("/api/get-public-job-listing", [authJwt.verifyToken], jobController.getPublicJobListing);
  app.get("/api/get-hidden-job-listing", [authJwt.verifyToken], jobController.getHiddenJobListing);
  app.post("/api/get-preview-job", [authJwt.verifyToken], jobController.getPreviewJob);
  app.post("/api/get-matched-talents-for-create-job", [authJwt.verifyToken], jobController.MatchedTalentsForCreateJob);
  app.post("/api/get-matched-talents-for-current-job", [authJwt.verifyToken], jobController.MatchedTalentsForCurrentJob);

  //b2c part
  app.get("/api/get-job-lists", [authJwt.verifyToken], jobController.getJobLists);
  app.get("/api/get-bookmarked-job-lists", [authJwt.verifyToken], jobController.getBookmarkedJobLists);
  app.post("/api/get-detailed-job", [authJwt.verifyToken], jobController.getDetailedJob);
  app.post("/api/get-more-jobs", [authJwt.verifyToken], jobController.getMoreJobs);
  app.post("/api/job-lists-filter", [authJwt.verifyToken], jobController.jobListsFilter); 
  app.post("/api/job-apply", [authJwt.verifyToken], jobController.jobApply);
  app.post("/api/job-apply-withdraw", [authJwt.verifyToken], jobController.jobApplyWithdraw);  
  app.post("/api/job-bookmark", [authJwt.verifyToken], jobController.jobBookmark); 

  app.get("/api/get-job-lists-without-token", jobController.getJobListsWithoutToken);
  app.post("/api/get-detailed-job-without-token", jobController.getDetailedJobWithoutToken);
  app.post("/api/get-more-jobs-without-token", jobController.getMoreJobsWithoutToken);

  //------------------------talent controller---------------//
  // b2c part
  app.post("/api/resume-upload", [authJwt.verifyToken], resumeUpload.single('file'), talentController.resumeUpload); 
  app.get("/api/get-all-talents-profile", talentController.getAllTalentsProfile);
  app.post("/api/talent-avatar-upload", [authJwt.verifyToken], avatarUpload.single('file'), talentController.talentAvatarUpload);
  app.post("/api/talent-photos-upload", [authJwt.verifyToken], upload.array('photos', 30), talentController.talentPhotosUpload);
  app.get("/api/get-talent-photos", [authJwt.verifyToken], talentController.getTalentPhotos);
  app.post("/api/talent-profile-create", [authJwt.verifyToken], talentController.talentProfileCreate);  
  app.get("/api/get-current-talent-profile", [authJwt.verifyToken], talentController.getCurrentTalentProfile);  
  app.post("/api/talents-jobtype-filter", talentController.TalentsJobTypeFilter);
  app.post("/api/talents-availability-filter", talentController.TalentsAvailabilityFilter);
  app.post("/api/talents-all-filter", talentController.TalentsAllFilter); 
  app.post("/api/send-recommendation", [authJwt.verifyToken], talentController.sendRecommendation); 
  app.post("/api/receive-recommendation", talentController.receiveRecommendation);
  app.post("/api/send-email", [authJwt.verifyToken], talentController.sendEmail);
  app.post("/api/confirm-email", talentController.confirmEmail);
  app.post("/api/send-sms-verification-code-for-phone-change", talentController.sendSMSVerificationCodeForPhoneChange);
  app.post("/api/check-sms-verification-code-for-phone-change", talentController.checkSMSVerificationCodeForPhoneChange); 
  
  app.post("/api/talent-personalization-create", [authJwt.verifyToken], talentController.talentPersonalizationCreate);
  app.post("/api/talent-personalization-avatar-upload", [authJwt.verifyToken], avatarUpload.single('file'), talentController.talentPersonalizationAvatarUpload);
  app.post("/api/talent-diploma-file-upload-with-education", [authJwt.verifyToken], diplomaUpload.array('diplomaFiles'), talentController.TalentDiplomaFilesUploadWithEducation);
  app.post("/api/talent-language-doc-file-upload", [authJwt.verifyToken], languageDocsUpload.array('languageDocFiles'), talentController.talentLanguageDocFilesUpload);
  // temp page
  app.post("/api/mailchimp-confirm", talentController.mailchimpConfirm);

  //chat controller
  app.get("/api/get-b2b-chat-users", [authJwt.verifyToken], chatController.getB2BChatUsers); 
  app.post("/api/get-b2b-current-chat-user", [authJwt.verifyToken], chatController.getB2BCurrentChatUser); 
  app.get("/api/get-b2c-chat-users", [authJwt.verifyToken], chatController.getB2cChatUsers); 
  app.post("/api/get-current-b2c-chat-user", [authJwt.verifyToken], chatController.getCurrentB2cChatUser);
  app.post("/api/get-b2b-messages", [authJwt.verifyToken], chatController.getB2BMessages);
  app.post("/api/get-b2c-messages", [authJwt.verifyToken], chatController.getB2CMessages);
  app.post("/api/mark-b2b-messages-as-read", [authJwt.verifyToken], chatController.markB2BMessagesAsRead);
  app.post("/api/mark-b2c-messages-as-read", [authJwt.verifyToken], chatController.markB2CMessagesAsRead);
};