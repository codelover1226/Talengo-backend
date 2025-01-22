module.exports = (sequelize, Sequelize) => {
    const TalentPersonalizationExperience = sequelize.define("talent_personalization_experiences", {  
        id: {
            autoIncrement: true,
            type: Sequelize.INTEGER,
            primaryKey: true,        
        },
        job_title: {
            type: Sequelize.STRING
        },
        company_name: {
            type: Sequelize.STRING
        },                 
        from: {
            type: Sequelize.STRING
        },
        to: {
            type: Sequelize.STRING
        },   
        country: {
            type: Sequelize.STRING
        }, 
        is_currently_working: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
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
    return TalentPersonalizationExperience;
};