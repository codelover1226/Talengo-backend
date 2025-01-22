module.exports = (sequelize, Sequelize) => {
    const SoftSkill = sequelize.define("soft_skills", {  
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        primaryKey: true,        
      }, 
      soft_skill: {
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
    return SoftSkill;
  };