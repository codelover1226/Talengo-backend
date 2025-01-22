module.exports = (sequelize, Sequelize) => {
    const TalentProfileSeekingJobIn = sequelize.define("talent_profile_seeking_job_in", {  
        id: {
            autoIncrement: true,
            type: Sequelize.INTEGER,
            primaryKey: true,        
        },
        location: {
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
    return TalentProfileSeekingJobIn;
};