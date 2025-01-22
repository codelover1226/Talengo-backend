module.exports = (sequelize, Sequelize) => {
    const Field = sequelize.define("fields", {  
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        primaryKey: true,        
      },    
      field: {
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
    return Field;
};