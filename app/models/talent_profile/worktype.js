module.exports = (sequelize, Sequelize) => {
    const TalentProfileWorkType = sequelize.define("talent_profile_worktypes", {  
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        primaryKey: true,        
      }, 
      work_type: {
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
    return TalentProfileWorkType;
};