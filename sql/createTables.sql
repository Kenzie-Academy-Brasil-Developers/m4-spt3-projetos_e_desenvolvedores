create type "preferredOS" as enum ('Windows', 'Linux', 'MacOS');

create table if not exists "developer_infos" (
	id SERIAL primary key,
	developerSince DATE not null,
	type "preferredOS" not null 
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

