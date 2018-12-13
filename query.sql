SELECT "docid","page","user","corrupted","tableType" ,
	results->>'location' "location",
	results->>'number' "number",
	( json_object_keys(results->'content')) as "content",
	( json_object_keys(results->'qualifiers')) as "qualifier",
	results->'content' as jsoncontent,
	results->'qualifiers' as jsonqualifier

FROM
(
	SELECT json_array_elements(
				("annotation"#>>'{annotations}')::json
				) "results","docid","page","user","corrupted","tableType" 

	FROM (
		select distinct on ("docid") docid,"page","user","corrupted","tableType","N","annotation"
		from annotations
		order by "docid", "N" desc
	) AS annotations
) as mytable1