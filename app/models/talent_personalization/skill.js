module.exports = (sequelize, Sequelize) => {
    const TalentPersonalizationSkill = sequelize.define("talent_personalization_skills", {  
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        primaryKey: true,        
      }, 
      title: {
        type: Sequelize.STRING
      },
      uri: {
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
    return TalentPersonalizationSkill;
};