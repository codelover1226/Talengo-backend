var jwt = require("jsonwebtoken");
require('dotenv').config();
const config = require("../config/auth.config");
const db = require("../models");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// user table
const User = db.user;

// settings table
const SettingNotification = db.b2b_setting_notification;
const SettingPaymentDetail = db.b2b_setting_payment_detail;

exports.gettingNotifications = async (req, res) => {
  const token = req.headers["x-access-token"];
  const user_id = jwt.verify(token, config.secret).id;  

  SettingNotification.findOne({
    where: {
      employerId: user_id
    }
  })
  .then(data => {
    if(!data) {
      res.send({ status: "success", message: "Nothing notifications" });
    } else {
      res.send({ status: "success", data: data });
    };    
  })
  .catch(err => {
    res.send({ status: "failed" });
  })
};

exports.settingNotifications = async (req, res) => {
  const token = req.headers["x-access-token"];
  const user_id = jwt.verify(token, config.secret).id;

  const {emailAddress, smsNotification, topMatch, isOfferAccepted, isNewMessage, billingNotification, isNewApplicants, platformUpdate} = req.body;

  SettingNotification.findOne({
    where: {
      employerId: user_id
    }
  })
  .then(data => {
    if(!data) {
      SettingNotification.create({
        email_address: emailAddress,
        sms_notification: smsNotification,
        top_match: topMatch,
        offer_is_accepted: isOfferAccepted,
        billing_notification: billingNotification,
        new_applicant: isNewApplicants,
        new_message: isNewMessage,
        platform_update: platformUpdate,
        employerId: user_id
      })
    } else {
      SettingNotification.update(
        {
          email_address: emailAddress,
          sms_notification: smsNotification,
          top_match: topMatch,
          offer_is_accepted: isOfferAccepted,
          billing_notification: billingNotification,
          new_applicant: isNewApplicants,
          new_message: isNewMessage,
          platform_update: platformUpdate,
        },
        {
          where: {
            employerId: user_id
          }
        }
      )
    };

    res.send({ status: "success" });
  })
  .catch(err => {
    res.send({ status: "failed" });
  })
};

exports.getPaymentMethods = async (req, res) => {
  const token = req.headers["x-access-token"];
  const user_id = jwt.verify(token, config.secret).id;

  User.findOne({
    where: {
      id: user_id
    }
  })
  .then(user => {
    const customerId = user.stripe_customer_id;

    stripe.customers.listPaymentMethods(customerId, {
      type: "card"
    })
    .then(paymentMethods => {
      if(paymentMethods?.data?.length == 0) {
        return res.send({status: "no_pay_method", message: "No payment method"})
      };

      SettingPaymentDetail.findAll({
        where: {
          employerId: user_id,   
          is_removed: false,
        }
      })
      .then(paymentMethodLists => {
        if(paymentMethodLists?.length == 0) {
          return res.send({status: "no_pay_method", message: "No payment method"})
        };
        const primaryPayMethodId = paymentMethodLists?.filter(item => item?.is_primary == true)[0]?.payment_method_id;
        const primary = paymentMethods?.data?.filter(item => item?.id == primaryPayMethodId);
        const other = paymentMethods?.data?.filter(item => item?.id != primaryPayMethodId);

        stripe.paymentIntents.list({
          customer: customerId,
          limit: 100
        })
        .then(result => {
          if(result?.data?.length == 0) {
            return res?.send({status: "no_payment_intent", message: "No payment Intents"})
          };
          
          const paymentIntents = result?.data?.filter(item => item?.payment_method == primaryPayMethodId);
          res?.send({status: "success", paymentMethods: paymentMethods, primary: primary, other: other, paymentIntents: paymentIntents});
        })
        .catch(error => {
          res?.send({status: "stripe_failed", message: error});
        })
      })      
    })
    .catch(error => {
      res?.send({status: "stripe_failed", message: error});
    })
  })   
  .catch(error => {
    res?.send({status: "failed", message: error});
  })
};

exports.createStripePaymentMethod = async (req, res) => {
  const token = req.headers["x-access-token"];
  const user_id = jwt.verify(token, config.secret).id;

  const {paymentMethod, isPrimary} = req.body;

  User.findOne({
    where: {
      id: user_id
    }
  })
  .then(user => {
    const customerId = user.stripe_customer_id;

    stripe.paymentMethods.attach(paymentMethod?.id, {
      customer: customerId
    })
    .then(attachedMethod => {      
      SettingPaymentDetail.create({
        payment_method_id: attachedMethod?.id,        
        is_primary: isPrimary,
        is_removed: false,
        employerId: user_id,
      })
      .then(data => {
        res.send({status: "success"});
      })       
    })
    .catch(error => {
      res?.send({status: "stripe_failed", message: error});
    })
  }) 
  .catch(error => {
    res?.send({status: "failed", message: error});
  })  
};

exports.removeStripePaymentMethod = async (req, res) => {
  const token = req.headers["x-access-token"];
  const user_id = jwt.verify(token, config.secret).id;

  const paymentMethodId = req.body.id; 

  stripe.paymentMethods.detach(paymentMethodId)
  .then(detachedMethod => {
    SettingPaymentDetail.update(
      {
        is_removed: true
      },
      {
        where: {          
          payment_method_id: detachedMethod.id,
          employerId: user_id,
        }
      }
    )
    .then(data => {
      User.findOne({
        where: {
          id: user_id
        }
      })
      .then(user => {
        const customerId = user.stripe_customer_id;
    
        stripe.customers.listPaymentMethods(customerId, {
          type: "card"
        })
        .then(paymentMethods => {
          if(paymentMethods?.data?.length == 0) {
            return res.send({status: "no_pay_method", message: "No payment method"})
          };
    
          SettingPaymentDetail.findAll({
            where: {
              employerId: user_id,
              is_removed: false          
            }
          })
          .then(paymentMethodLists => {            
            const primaryPayMethodId = paymentMethodLists?.filter(item => item?.is_primary == true)[0]?.payment_method_id;
            const primary = paymentMethods?.data?.filter(item => item?.id == primaryPayMethodId);
            const other = paymentMethods?.data?.filter(item => item?.id != primaryPayMethodId);
            res?.send({status: "success", paymentMethods: paymentMethods, primary: primary, other: other});        
          })
        })        
      })
    })
    .catch(error => {
      res?.send({status: "failed", message: error});
    })
  }) 
  .catch(error => {
    res?.send({status: "stripe_failed", message: error});
  }) 
};

exports.setPrimaryPaymentMethod = async (req, res) => {
  const token = req.headers["x-access-token"];
  const user_id = jwt.verify(token, config.secret).id;

  const paymentMethodId = req.body.id;

  SettingPaymentDetail.update(
    {
      is_primary: false
    },
    {
      where: {
        employerId: user_id,
        is_primary: true
      }
    }
  )
  .then(data => {
    SettingPaymentDetail.update(
      {
        is_primary: true
      },
      {
        where: {          
          payment_method_id: paymentMethodId,
          employerId: user_id,
        }
      }
    )
    .then(data => {
      User.findOne({
        where: {
          id: user_id
        }
      })
      .then(user => {
        const customerId = user.stripe_customer_id;
    
        stripe.customers.listPaymentMethods(customerId, {
          type: "card"
        })
        .then(paymentMethods => {
          if(paymentMethods?.data?.length == 0) {
            return res.send({status: "no_pay_method", message: "No payment method"})
          };
    
          SettingPaymentDetail.findAll({
            where: {
              employerId: user_id,
              is_removed: false          
            }
          })
          .then(paymentMethodLists => {            
            const primaryPayMethodId = paymentMethodLists?.filter(item => item?.is_primary == true)[0]?.payment_method_id;
            const primary = paymentMethods?.data?.filter(item => item?.id == primaryPayMethodId);
            const other = paymentMethods?.data?.filter(item => item?.id != primaryPayMethodId);
            
            stripe.paymentIntents.list({
              customer: customerId,
              limit: 100
            })
            .then(result => {
              if(result?.data?.length == 0) {
                return res?.send({status: "no_payment_intent", message: "No payment Intents"})
              };            
              
              const paymentIntents = result?.data?.filter(item => item?.payment_method == primaryPayMethodId);
              res?.send({status: "success", paymentMethods: paymentMethods, primary: primary, other: other, paymentIntents: paymentIntents});
            })
            .catch(error => {
              res?.send({status: "stripe_failed", message: error});
            })
          })      
        })
        .catch(error => {
          res?.send({status: "stripe_failed", message: error});
        })
      })
    })       
  })
  .catch(error => {
    res?.send({status: "failed", message: error});
  })  
};

exports.createPaymentIntent = (req, res) => {
  const token = req.headers["x-access-token"];
  const user_id = jwt.verify(token, config.secret).id;

  const { price, paymentMethodId } = req.body;

  User.findOne({
    where: {
      id: user_id
    }
  })
  .then(user => {
    const customerId = user.stripe_customer_id;

    stripe.paymentIntents.create({
      amount: price * 100,
      currency: "DKK",
      customer: customerId,
      payment_method: paymentMethodId,
      confirmation_method: "manual", // For 3D Security
      description: "Buy Product",
    })
    .then(data => {      
      res.send({status: "success", data});
    })
    .catch(error => {
      res.send({message: "stripe_failed"});
    }) 
  })
  .catch(error => {
    res.send({message: "failed"});
  })
};

exports.confirmPaymentIntent = (req, res) => {
  const token = req.headers["x-access-token"];
  const user_id = jwt.verify(token, config.secret).id;

  const { paymentMethodId, paymentIntentId } = req.body;

  stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: paymentMethodId,
    return_url: "http://13.50.33.149:3000/"
  })
  .then(result => {    
    res.send({status: "success", result});
  })
  .catch(error => {    
    res.send({status: "failed", message: error});
  })
};