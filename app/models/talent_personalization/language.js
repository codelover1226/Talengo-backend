module.exports = (sequelize, Sequelize) => {
  const TalentPersonalizationLanguage = sequelize.define("talent_personalization_languages", {  
    id: {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      primaryKey: true,        
    },
    language: {
      type: Sequelize.STRING
    },
    level: {
      type: Sequelize.STRING
    },
    is_added_doc: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
    file_path: {
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
  return TalentPersonalizationLanguage;
};