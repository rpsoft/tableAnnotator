select distinct concept, cuis, rep_cuis, excluded_cuis, t1.cc  from 
 (select cleaned as concept , cuis, COALESCE(cn_override,cn) as cc from clusters where cuis != '' ) as t1
LEFT JOIN (select cn as cc, rep_cuis, excluded_cuis from clusterdata where status != 'unhelpful' ) as t2
ON t1.cc = t2.cc


CREATE TABLE cuis_recommend AS (select distinct * from 
 (select distinct concept, cuis, rep_cuis, excluded_cuis, t1.cc  from 
 (select cleaned as concept , cuis, COALESCE(cn_override,cn) as cc from clusters where cuis != '' ) as t1
LEFT JOIN (select cn as cc, rep_cuis, excluded_cuis from clusterdata where status != 'unhelpful' ) as t2
ON t1.cc = t2.cc) as mydata )

select * from clusterData order by cn desc