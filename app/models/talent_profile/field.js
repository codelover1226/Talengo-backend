module.exports = (sequelize, Sequelize) => {
    const TalentProfileField = sequelize.define("talent_profile_fields", {  
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        primaryKey: true,        
      }, 
      field: {
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
    return TalentProfileField;
};