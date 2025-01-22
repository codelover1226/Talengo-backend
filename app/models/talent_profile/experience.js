module.exports = (sequelize, Sequelize) => {
    const TalentProfileExperience = sequelize.define("talent_profile_experiences", {  
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        primaryKey: true,        
      },
      company: {
        type: Sequelize.STRING
      },
      role: {
        type: Sequelize.STRING
      },
      currently_working: {
        type: Sequelize.BOOLEAN
      },
      country: {
        type: Sequelize.STRING
      },           
      from: {
        type: Sequelize.STRING
      },
      to: {
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
    return TalentProfileExperience;
};