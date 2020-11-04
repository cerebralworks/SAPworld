/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/**
 * JobPostings.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'she_job_postings',
    tableAlias: 'job_posting',
    attributes: {
        title: {type: 'string'},
        type: {type: 'number', defaultsTo: 0},
        min_salary: {type: 'number'},
        max_salary: {type: 'number'},
        min_experience: {type: 'number'},
        max_experience: {type: 'number'},
        company: {type: 'string'},
        photo: {type: 'string', allowNull: true},
        email: {type: 'string', allowNull: true},
        phone_numbers: {type: 'ref'},
        company_bio: {type: 'string', allowNull: true},
        location: {type: 'ref'},
        location_text: {type: 'string', allowNull: true},
        location_geom: {type: 'ref'},
        zip_code: {type: 'number'},
        responsibilities: {type: 'string', allowNull: true},
        company_established: {type: 'number', allowNull: true},
        company_employees: {type: 'number', allowNull: true},
        company_branches: {type: 'number', allowNull: true},
        company_website: {type: 'string', allowNull: true},
        skill_requirements: {type: 'ref'},
        skill_tags: {type: 'ref'},
        status: {type: 'number', defaultsTo: 1},
        status_glossary: {type: 'string', allowNull: true},
        city: {
            model: 'cities'
        },
        category: {
            model: 'categories'
        },
        employer: {
            model: 'employerprofiles'
        }
    }
};
