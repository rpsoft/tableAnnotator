DELETE FROM clusters;
COPY clusters (cn,concept,cuis)
FROM '/home/suso/ihw/tableAnnotator/Server/CLUSTERS/clusters-ms-assign.csv' DELIMITER ',' CSV HEADER;
