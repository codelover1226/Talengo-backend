module.exports = (sequelize, Sequelize) => {
    const JobListingPhoto = sequelize.define("job_listing_photos", {  
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        primaryKey: true,        
      },
      photo_path: {
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
    return JobListingPhoto;
};