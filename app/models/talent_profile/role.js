module.exports = (sequelize, Sequelize) => {
    const TalentProfileRole = sequelize.define("talent_profile_roles", {  
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        primaryKey: true,        
      }, 
      role: {
        type: Sequelize.STRING
      }, 
      field_id: {
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
    return TalentProfileRole;
};