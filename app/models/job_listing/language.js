module.exports = (sequelize, Sequelize) => {
    const JobListingLanguage = sequelize.define("job_listing_languages", {  
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
      require_document: {
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
    return JobListingLanguage;
  };