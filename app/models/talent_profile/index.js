module.exports = (sequelize, Sequelize) => {
    const TalentProfile = sequelize.define("talent_profiles", {  
        id: {
            autoIncrement: true,
            type: Sequelize.INTEGER,
            primaryKey: true,        
        },
        accommodation: {
            type: Sequelize.STRING
        },
        avatar_path: {
            type: Sequelize.STRING
        },
        phone_number: {
            type: Sequelize.STRING
        },
        first_name: {
            type: Sequelize.STRING
        },
        middle_name: {
            type: Sequelize.STRING
        },  
        last_name: {
            type: Sequelize.STRING
        },   
        country: {
            type: Sequelize.STRING
        },  
        city: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.TEXT
        },        
        education_level: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        email_confirm: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        when_start_job: {
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
    return TalentProfile;
};