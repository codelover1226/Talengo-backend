module.exports = (sequelize, Sequelize) => {
    const B2BNotification = sequelize.define("b2b_setting_notifications", {  
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        primaryKey: true,        
      },    
      email_address: {
        type: Sequelize.BOOLEAN
      },
      sms_notification: {
        type: Sequelize.BOOLEAN
      },
      top_match: {
        type: Sequelize.BOOLEAN
      },
      offer_is_accepted: {
        type: Sequelize.BOOLEAN
      },
      billing_notification: {
        type:Sequelize.BOOLEAN
      },
      new_applicant: {
        type:Sequelize.BOOLEAN
      },      
      new_message: {
        type:Sequelize.BOOLEAN
      },
      platform_update: {
        type:Sequelize.BOOLEAN
      },      
      created_by:{
        type:Sequelize.INTEGER
      },
      updated_by:{
        type:Sequelize.INTEGER
      },
      createdAt: {
        type: Sequelize.DATE,
        field: 'CREATED_AT'
       },      
      updatedAt: {
        type: Sequelize.DATE,
        field: 'UPDATED_AT'
      },
    });
    return B2BNotification;
  };