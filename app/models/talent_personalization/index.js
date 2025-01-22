module.exports = (sequelize, Sequelize) => {
    const TalentPersonalization = sequelize.define("talent_personalizations", {  
        id: {
            autoIncrement: true,
            type: Sequelize.INTEGER,
            primaryKey: true,        
        },
        first_name: {
            type: Sequelize.STRING
        },         
        last_name: {
            type: Sequelize.STRING
        },
        phone_number: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        email_confirm: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        sex: {
            type: Sequelize.STRING
        },
        nationality: {
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
        relocation_to_denmark: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        need_accommodation_in_denmark: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        know_destination: {
            type: Sequelize.STRING
        },
        destination: {
            type: Sequelize.STRING
        },
        is_in_employment: {
            type: Sequelize.STRING
        },
        when_start_job: {
            type: Sequelize.STRING
        },
        avatar_path: {
            type: Sequelize.STRING
        }, 
        education_level: {
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
    return TalentPersonalization;
};