module.exports = (sequelize, Sequelize) => {
    const JobListing = sequelize.define("job_listings", {  
        id: {
            autoIncrement: true,
            type: Sequelize.INTEGER,
            primaryKey: true,        
        },
        title: {
            type: Sequelize.STRING
        },
        job_title: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.TEXT
        },
        same_location_as_company: {
            type: Sequelize.BOOLEAN
        },
        job_type: {
            type: Sequelize.STRING
        },
        period_from: {
            type: Sequelize.STRING
        },
        period_to: {
            type: Sequelize.STRING
        },
        work_hour: {
            type: Sequelize.STRING
        },
        work_per: {
            type: Sequelize.STRING
        },
        shifts_fixed: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        shifts_floater: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        shifts_flexible: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        includes_night_time_work: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        includes_work_on_weekends: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        pay_amount: {
            type: Sequelize.FLOAT
        },
        pay_method: {
            type: Sequelize.STRING
        },
        vacant_position: {
            type: Sequelize.INTEGER
        },
        accommodation: {
            type: Sequelize.STRING
        },
        require_education: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        require_profile_picture: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        require_no_criminal_record: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        is_public: {
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
    return JobListing;
};