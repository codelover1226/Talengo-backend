const { verifySignUp, verifySmsSignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");
const { authJwt } = require("../middleware");
module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.post("/api/auth/signup", [verifySignUp.checkDuplicateUsernameOrEmail], controller.signup);
  app.post("/api/auth/email-verification-for-signup", controller.emailVerificationForSignup);
  app.post("/api/auth/business-signup", [verifySignUp.checkDuplicateUsernameOrEmail], controller.businessSignup);
  app.post("/api/auth/email-verify", controller.emailVerify);
  app.post("/api/auth/resend-email", controller.resendEmail);
  app.post("/api/auth/forgot-password-send-email", controller.forgotPasswordSendEmail);
  app.post("/api/auth/update-password", controller.updatePassword);
  app.post("/api/auth/login", controller.login);
  app.get("/api/fetch-b2b-user", [authJwt.verifyToken], controller.fetchB2BUser);
  app.post("/api/auth/google-login", controller.googleLogin);
  app.post("/api/auth/getuser", controller.getInfo);
  app.post("/api/auth/logout",controller.signout);
  app.post("/api/send-sms-verification-code-for-signup", controller.sendSMSVerificationCodeForSignup);
  app.post("/api/send-sms-verification-code-for-login", controller.sendSMSVerificationCodeForLogin);
  app.post("/api/check-sms-verification-code", controller.checkSMSVerificationCode);  
  app.post("/api/b2b-user-update-password", [authJwt.verifyToken], controller.b2bUserUpdatePassword);
};