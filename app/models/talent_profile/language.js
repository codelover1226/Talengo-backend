module.exports = (sequelize, Sequelize) => {
  const TalentProfileLanguage = sequelize.define("talent_profile_languages", {  
    id: {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      primaryKey: true,        
    },
    language: {
      type: Sequelize.STRING
    },
    language_level: {
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
  return TalentProfileLanguage;
};