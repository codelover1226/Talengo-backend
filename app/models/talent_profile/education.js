module.exports = (sequelize, Sequelize) => {
    const TalentProfileEducation = sequelize.define("talent_profile_educations", {  
        id: {
            autoIncrement: true,
            type: Sequelize.INTEGER,
            primaryKey: true,        
        },
        title: {
            type: Sequelize.STRING
        },      
        country: {
            type: Sequelize.STRING
        },
        institution: {
            type: Sequelize.STRING
        },
        field_of_study: {
            type: Sequelize.STRING
        },
        degree: {
            type: Sequelize.STRING
        },          
        from: {
            type: Sequelize.STRING
        },
        to: {
            type: Sequelize.STRING
        },
        unfinished: {
            type: Sequelize.BOOLEAN
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
    return TalentProfileEducation;
};