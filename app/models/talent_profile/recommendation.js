module.exports = (sequelize, Sequelize) => {
    const TalentProfileRecommendation = sequelize.define("talent_profile_recommendations", {  
        id: {
            autoIncrement: true,
            type: Sequelize.INTEGER,
            primaryKey: true,        
        },
        email: {
            type: Sequelize.STRING
        },
        job_title: {
            type: Sequelize.STRING
        },
        company: {
            type: Sequelize.STRING
        },      
        representative: {
            type: Sequelize.STRING
        },
        feedback: {
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
    return TalentProfileRecommendation;
};