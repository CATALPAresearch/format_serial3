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