module.exports = (sequelize, Sequelize) => {
    const TalentProfileHardSkill = sequelize.define("talent_profile_hardskills", {  
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        primaryKey: true,        
      },
      hardskill: {
        type: Sequelize.STRING
      }, 
      role_id: {
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
    return TalentProfileHardSkill;
};