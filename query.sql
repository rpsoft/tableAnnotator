SELECT "docid","page","user","corrupted","tableType" ,
	results->>'location' "location",
	results->>'number' "number",
	results->'content' as jsoncontent,
	results->'qualifiers' as jsonqualifier, "N" 

FROM
(
	SELECT json_array_elements(
				("annotation"#>>'{annotations}')::json
				) "results","docid","page","user","corrupted","tableType", "N" 

	FROM (
		select distinct on ("docid") docid,"page","user","corrupted","tableType","N","annotation"
		from annotations
		order by "docid", "N" desc
	) AS annotations
) as mytable1