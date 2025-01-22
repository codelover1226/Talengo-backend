module.exports = (sequelize, Sequelize) => {
    const CompanyProfile = sequelize.define("company_profiles", {  
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        primaryKey: true,        
      }, 
      cvr_number: {
        type: Sequelize.STRING
      },
      company_name: {
        type: Sequelize.STRING
      }, 
      phone_number: {
        type: Sequelize.STRING
      }, 
      address: {
        type: Sequelize.STRING
      },
      post_code: {
        type: Sequelize.STRING
      },
      public_name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      }, 
      logo_path: {
        type: Sequelize.STRING
      },       
      representative_first_name: {
        type: Sequelize.STRING
      }, 
      representative_last_name: {
        type: Sequelize.STRING
      },
      your_position: {
        type: Sequelize.STRING
      },
      profile_image_path: {
        type: Sequelize.STRING
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
    return CompanyProfile;
  };