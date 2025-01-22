module.exports = (sequelize, Sequelize) => {
    const TalentPersonalizationEducation = sequelize.define("talent_personalization_educations", {  
        id: {
            autoIncrement: true,
            type: Sequelize.INTEGER,
            primaryKey: true,        
        },
        education_level: {
            type: Sequelize.STRING
        },      
        education_name: {
            type: Sequelize.STRING
        },
        institution_name: {
            type: Sequelize.STRING
        },                 
        from: {
            type: Sequelize.STRING
        },
        to: {
            type: Sequelize.STRING
        },
        unfinished: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        country: {
            type: Sequelize.STRING
        },
        is_currently_education: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        is_added_diploma_file: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        file_path: {
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
    return TalentPersonalizationEducation;
};