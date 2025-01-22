module.exports = (sequelize, Sequelize) => {
    const JobBookmark = sequelize.define("job_bookmarks", {  
        id: {
            autoIncrement: true,
            type: Sequelize.INTEGER,
            primaryKey: true,        
        },    
        is_saved:{
            type:Sequelize.BOOLEAN
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
    return JobBookmark;
};