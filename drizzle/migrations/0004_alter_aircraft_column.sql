-- Custom SQL migration file, put your code below! --
alter table aircraft
alter column total_seats drop not null;