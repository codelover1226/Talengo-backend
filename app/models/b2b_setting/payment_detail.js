module.exports = (sequelize, Sequelize) => {
    const B2BPaymentDetail = sequelize.define("b2b_setting_payment_details", {  
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        primaryKey: true,        
      }, 
      payment_method_id: {
        type: Sequelize.STRING
      },
      is_primary: {
        type:Sequelize.BOOLEAN
      },
      is_removed: {
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
    return B2BPaymentDetail;
  };