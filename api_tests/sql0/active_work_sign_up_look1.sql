
-- both work
--INSERT INTO registration_pre_processing (reserve_username, answer) VALUES ('user_jim', 'test123');
--INSERT INTO registration_pre_processing (id, reserve_username, answer) VALUES (DEFAULT, 'user_jim', 'test123');


SELECT id, reserve_username, answer, published FROM registration_pre_processing
   ORDER BY id DESC
   LIMIT 15
   ;

-- lemmy creates person database record before local_user
SELECT id, name, published FROM person
   ORDER BY id DESC, published DESC
   LIMIT 15
   ;
 
 
/*
observation, primay key consumption of 4
  5 | lemmy_gamma | 2023-08-29 14:04:40.351361-07
  3 | lemmy_beta  | 2023-08-29 14:04:39.879728-07
  2 | lemmy_alpha | 2023-08-29 14:04:39.885251-07

*/
