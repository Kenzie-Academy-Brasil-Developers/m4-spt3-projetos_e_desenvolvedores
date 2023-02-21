create type "preferredOS" as enum ('Windows', 'Linux', 'MacOS');


create table if not exists "developer_infos" (
	"id" SERIAL primary key,
	"developerSince" DATE not null,
	"preferredOS" "preferredOS" not NULL
	--"developerID" INTEGER UNIQUE,
	--FOREIGN KEY ("developerID") REFERENCES developers("id") ON DELETE CASCADE
);

create table if not exists "developers" (
	"id" SERIAL primary key,
	"name" VARCHAR(50) not null,
	"email" VARCHAR(50) not null UNIQUE,
	"developerInfoID" INTEGER UNIQUE,
	foreign key ("developerInfoID") references developer_infos("id")
);

create table if not exists "projects" (
	"id" SERIAL primary key,
	"name" VARCHAR(50) not null,
	"description" TEXT not null,
	"estimatedTime" VARCHAR(20) not null,
	"repository" VARCHAR(120) not null,
	"startDate" DATE not null,
	"endDate" DATE
	--"developerID" INTEGER not null
);

create table if not exists "technologies" (
	"id" SERIAL primary key,
	"name" VARCHAR(30) not null
	--Inserir a tabela chumbada "listTechnologies": 
	--('JavaScript', 'Python', 'React', 'Express.js', 'HTML', 'CSS', 'Django', 'PostgreSQL', 'MongoDB')
);

create table if not exists "projects_technologies" (
	"id" SERIAL primary key,
	"addedIn" DATE not null
);


ALTER TABLE 
	projects
ADD COLUMN 
	"developerID" INTEGER NOT NULL;

ALTER TABLE
	projects
ADD FOREIGN KEY ("developerID") REFERENCES developers("id") ON DELETE CASCADE;

ALTER TABLE
	projects_technologies
ADD COLUMN 
	"projectID" INTEGER NOT NULL;
	
ALTER TABLE
	projects_technologies
ADD COLUMN 
	"technologyID" INTEGER;

ALTER TABLE
	projects_technologies 
ADD FOREIGN KEY ("projectID") REFERENCES projects("id") ON DELETE CASCADE;

ALTER TABLE
	projects_technologies 
ADD FOREIGN KEY ("technologyID") REFERENCES technologies("id") ON DELETE CASCADE;

ALTER TABLE
	developer_infos 
ADD COLUMN 
	"developerID" INTEGER UNIQUE;

ALTER TABLE
	developer_infos 
ADD FOREIGN KEY
	("developerID") REFERENCES developers("id") ON DELETE CASCADE;




-- insert into 
-- 	developers (%I)
-- values 
-- 	(%L)	
-- returning *;

--  insert into
--     developer_infos (%I)
--  values 
--     (%L)
--  returning *;


-- select * from developers;
-- select * from developer_infos;
-- SELECT * FROM projects;
-- SELECT * FROM projects JOIN developers de ON wo."developerID" = de."id";
-- SELECT wo.*, de."name", de."email" FROM projects JOIN developers de ON wo."developerID" = de."id";

-- SELECT
--     dv."id" AS "developerID",
--     dv."name" AS "developerName",
--     dv."email" AS "developerEmail",
--     dv."developerInfoID",
--     dinfo."developerSince" AS "developerInfoDeveloperSince",
--     dinfo."preferredOS" AS "developerInfoPreferredOS",
--     pr."id" AS "projectID",
--     pr."name" AS "projectName",
--     pr."description" AS "projectDescription",
--     pr."estimatedTime" AS "projectEstimatedTime",
--     pr."repository" AS "projectRepository",
--     pr."startDate" AS "projectStartDate",
--     pr."endDate" AS "projectEndDate",
--     tech."id" AS "technologyID",
--     tech."name" AS "technologyName"
-- FROM
--     developers dv
-- FULL JOIN
--     developer_infos dinfo ON dinfo.id = dv."developerInfoID"
-- JOIN
--     projects pr ON dv.id = pr."developerID"
-- FULL JOIN
--     technologies tech ON tech.id = pr."developerID"
-- WHERE
--     dv.id = 4;

-- update
-- 	developers 
-- set
-- 	(%I) = row(%L)
-- where 
--     id = $1
-- returning *;


-- delete from
--    developers
-- where
--    id = $1;

-- DELETE FROM developer_infos WHERE id = 3; 
  
-- drop table developers;
-- drop table developer_infos;
-- DROP TABLE projects;
-- DROP TABLE technologies;
-- DROP TABLE projects_technologies; 
-- drop type "preferredOS";

-- SELECT * FROM projects;
-- SELECT * FROM projects_technologies;
-- SELECT * FROM technologies;
-- DELETE FROM technologies;

-- SELECT
--     pr."id" AS "projectID",
--     pr."name" AS "projectName",
--     pr."description" AS "projectDescription",
--     pr."estimatedTime" AS "projectEstimatedTime",
--     pr."repository" AS "projectRepository",
--     pr."startDate" AS "projectStartDate",
--     pr."endDate" AS "projectEndDate",
--     pr."developerID" AS "projectDeveloperID",
--     tech."id" AS "technologyID",
--     tech."name" AS "technologyName"
-- FROM
-- 	projects pr
-- JOIN
-- 	projects_technologies prtech ON pr.id = prtech."projectID"
-- FULL JOIN
-- 	technologies tech ON tech.id = pr."developerID";

-- DELETE FROM
--     technologies tech
-- WHERE
--     tech.name = $1 AND tech.id = $2;