/*
Creates table limesurvey assign
*/
CREATE TABLE m_limesurvey_assign (
    id int,
    name varchar(255),
    course_id int,
    survey_id int,
    startdate int,
    warndate int,
    stopdate int
);

CREATE TABLE m_limesurvey_access(
id int NOT NULL AUTO_INCREMENT,
user_id int,
course_id int,
survey_id int,
access_date int,
PRIMARY KEY (id)
);

