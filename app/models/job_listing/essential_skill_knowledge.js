module.exports = (sequelize, Sequelize) => {
    const JobListingEssentialSkillAndKnowledge = sequelize.define("job_listing_essential_skill_knowledges", {  
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        primaryKey: true,        
      }, 
      title: {
        type: Sequelize.STRING
      },   
      has_skill_type: {
        type: Sequelize.STRING
      },
      uri: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
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
    return JobListingEssentialSkillAndKnowledge;
};