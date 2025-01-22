module.exports = (sequelize, Sequelize) => {
    const JobApplication = sequelize.define("job_applications", {  
        id: {
            autoIncrement: true,
            type: Sequelize.INTEGER,
            primaryKey: true,        
        },        
        status: {
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
    return JobApplication;
};