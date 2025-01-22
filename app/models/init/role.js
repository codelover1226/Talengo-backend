module.exports = (sequelize, Sequelize) => {
    const Role = sequelize.define("roles", {  
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        primaryKey: true,        
      },    
      role: {
        type: Sequelize.STRING
      },
      imagePath: {
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
    return Role;
  };