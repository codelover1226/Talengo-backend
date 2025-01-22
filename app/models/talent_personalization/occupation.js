module.exports = (sequelize, Sequelize) => {
    const TalentPersonalizationOccupation= sequelize.define("talent_personalization_occupations", {  
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        primaryKey: true,        
      }, 
      code: {
        type: Sequelize.STRING
      },
      title: {
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
    return TalentPersonalizationOccupation;
};