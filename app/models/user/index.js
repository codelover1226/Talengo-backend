module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {  
        id: {
            autoIncrement: true,
            type: Sequelize.INTEGER,
            primaryKey: true,        
        },    
        email: {
            type: Sequelize.STRING
        },
        email_verify_token: {
            type: Sequelize.STRING
        },
        password: {
            type:Sequelize.STRING
        },
        phone_number: {
            type:Sequelize.STRING
        },   
        stripe_customer_id: {
            type:Sequelize.STRING
        },    
        role: {
            type:Sequelize.STRING
        },
        verification_code: {
            type:Sequelize.STRING
        },
        is_verified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
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
    return User;
  };